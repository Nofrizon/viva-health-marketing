import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { Store, StoreKeyword } from '@/lib/types/mystore'

// GET /api/mystore - List all stores or filter
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const city = searchParams.get('city') || ''

    let query = supabase.from('stores').select('*').order('store_id', { ascending: true })

    if (search) query = query.ilike('name', `%${search}%`)
    if (city) query = query.eq('city', city)

    const { data, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Gagal mengambil data toko' }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan internal server' }, { status: 500 })
  }
}

// POST /api/mystore - Add a new store
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, regional, city, rating, address } = body

    if (!name || !regional || !city) {
      return NextResponse.json({ error: 'Nama, regional, dan kota wajib diisi' }, { status: 400 })
    }

    // Generate store_id automatically: VIVA-XXX
    const { data: lastStore } = await supabase
      .from('stores')
      .select('store_id')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    let nextNumber = 1
    if (lastStore?.store_id) {
      const match = lastStore.store_id.match(/VIVA-(\d+)/)
      if (match) nextNumber = parseInt(match[1]) + 1
    }

    const storeId = `VIVA-${String(nextNumber).padStart(3, '0')}`

    const { data, error } = await supabase
      .from('stores')
      .insert({
        store_id: storeId,
        name,
        regional,
        city,
        rating: rating || 0,
        address: address || '',
      })
      .select()
      .single()

    if (error) {
      console.error('Insert error:', error)
      return NextResponse.json({ error: 'Gagal menambah toko' }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan internal server' }, { status: 500 })
  }
}