import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { StoreKeyword, TrackResult } from '@/lib/types/mystore'

// GET /api/mystore/track?store_id=VIVA-001 - Get keywords tracked for a store
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('store_id')

    if (!storeId) {
      return NextResponse.json({ error: 'store_id diperlukan' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('store_keywords')
      .select('*')
      .eq('store_id', storeId)
      .order('last_checked', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Gagal mengambil data keyword' }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan internal server' }, { status: 500 })
  }
}

// POST /api/mystore/track - Track keyword stars for a store
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { store_id, keyword } = body

    if (!store_id || !keyword) {
      return NextResponse.json({ error: 'store_id dan keyword diperlukan' }, { status: 400 })
    }

    // 1. Fetch store name from DB
    const { data: store } = await supabase
      .from('stores')
      .select('name')
      .eq('store_id', store_id)
      .single()

    if (!store) {
      return NextResponse.json({ error: 'Toko tidak ditemukan' }, { status: 404 })
    }

    // 2. Call SerpAPI to get Google Maps ranking data
    const apiKey = process.env.SERPAPI_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Konfigurasi API tidak lengkap' }, { status: 500 })
    }

    const searchQuery = `${keyword} ${store.name}`
    const url = `https://serpapi.com/search.json?engine=google_maps&q=${encodeURIComponent(searchQuery)}&api_key=${apiKey}`
    const response = await fetch(url)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('SerpAPI error:', response.status, errorData)
      return NextResponse.json(
        { error: `Gagal mengambil data dari Google Maps (HTTP ${response.status})` },
        { status: response.status }
      )
    }

    const data = await response.json()
    const results = data.local_results || []

    // 3. Find our store in results
    let rank = 0
    let stars = 0

    for (let i = 0; i < results.length; i++) {
      const result = results[i]
      if (
        result.title?.toLowerCase().includes('viva apotek') ||
        result.title?.toLowerCase().includes(store.name.toLowerCase())
      ) {
        rank = i + 1
        stars = result.rating || 0
        break
      }
    }

    // 4. Get previous tracking data for trend calculation
    const { data: previousTrack } = await supabase
      .from('store_keywords')
      .select('current_stars, current_rank')
      .eq('store_id', store_id)
      .eq('keyword', keyword)
      .order('last_checked', { ascending: false })
      .limit(1)
      .maybeSingle()

    let trend: 'up' | 'down' | 'stable' = 'stable'
    let previousStars: number | undefined = undefined

    if (previousTrack) {
      previousStars = previousTrack.current_stars
      if (stars > previousTrack.current_stars) trend = 'up'
      else if (stars < previousTrack.current_stars) trend = 'down'
      else trend = 'stable'
    }

    // 5. Upsert the keyword tracking record
    const now = new Date().toISOString()
    const { data: upserted, error: upsertError } = await supabase
      .from('store_keywords')
      .upsert(
        {
          store_id,
          keyword,
          current_rank: rank,
          current_stars: stars,
          previous_stars: previousStars,
          trend,
          last_checked: now,
        },
        {
          onConflict: 'store_id,keyword',
        }
      )
      .select()
      .single()

    if (upsertError) {
      console.error('Upsert error:', upsertError)
      return NextResponse.json({ error: 'Gagal menyimpan data tracking' }, { status: 500 })
    }

    const result: TrackResult = {
      keyword,
      rank,
      stars,
      store_name: store.name,
      timestamp: now,
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan internal server' }, { status: 500 })
  }
}

// DELETE /api/mystore/track?id=xxx - Remove a keyword tracking
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id diperlukan' }, { status: 400 })
    }

    const { error } = await supabase.from('store_keywords').delete().eq('id', id)

    if (error) {
      console.error('Delete error:', error)
      return NextResponse.json({ error: 'Gagal menghapus keyword' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan internal server' }, { status: 500 })
  }
}