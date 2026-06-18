'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Search,
  Plus,
  Store,
  Star,
  TrendingUp,
  TrendingDown,
  Minus,
  Trash2,
  MapPin,
  Building2,
  RefreshCw,
  X,
  Target,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import type { Store as StoreType, StoreKeyword } from '@/lib/types/mystore'

export default function MyStorePage() {
  const [stores, setStores] = useState<StoreType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [cityFilter, setCityFilter] = useState('')

  // Add store modal
  const [showAddModal, setShowAddModal] = useState(false)
  const [newStore, setNewStore] = useState({ name: '', regional: '', city: '', rating: 0, address: '' })
  const [saving, setSaving] = useState(false)

  // Track keyword
  const [trackingStore, setTrackingStore] = useState<string | null>(null)
  const [keywordInput, setKeywordInput] = useState('')
  const [tracking, setTracking] = useState(false)
  const [trackResult, setTrackResult] = useState<{ keyword: string; rank: number; stars: number } | null>(null)

  // Expanded store for keyword view
  const [expandedStore, setExpandedStore] = useState<string | null>(null)
  const [storeKeywords, setStoreKeywords] = useState<Record<string, StoreKeyword[]>>({})
  const [loadingKeywords, setLoadingKeywords] = useState<Record<string, boolean>>({})

  const cities = ['Semua Kota', 'Bogor', 'Jakarta', 'Bandung', 'Semarang', 'Surabaya', 'Yogyakarta']

  const fetchStores = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (cityFilter && cityFilter !== 'Semua Kota') params.set('city', cityFilter)
      const res = await fetch(`/api/mystore?${params.toString()}`)
      if (!res.ok) throw new Error('Gagal mengambil data')
      const data = await res.json()
      setStores(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }, [search, cityFilter])

  useEffect(() => {
    fetchStores()
  }, [fetchStores])

  const handleAddStore = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/mystore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStore),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Gagal menambah toko')
      }
      setShowAddModal(false)
      setNewStore({ name: '', regional: '', city: '', rating: 0, address: '' })
      fetchStores()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Gagal menambah toko')
    } finally {
      setSaving(false)
    }
  }

  const handleTrackKeyword = async (storeId: string) => {
    if (!keywordInput.trim()) return
    setTracking(true)
    setTrackResult(null)
    try {
      const res = await fetch('/api/mystore/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ store_id: storeId, keyword: keywordInput.trim() }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Gagal melacak keyword')
      }
      const data = await res.json()
      setTrackResult(data)
      setKeywordInput('')
      // Refresh keywords for this store
      fetchKeywords(storeId)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Gagal melacak')
    } finally {
      setTracking(false)
    }
  }

  const fetchKeywords = async (storeId: string) => {
    setLoadingKeywords((prev) => ({ ...prev, [storeId]: true }))
    try {
      const res = await fetch(`/api/mystore/track?store_id=${storeId}`)
      if (!res.ok) throw new Error('Gagal mengambil data keyword')
      const data = await res.json()
      setStoreKeywords((prev) => ({ ...prev, [storeId]: data }))
    } catch {
      // silently fail
    } finally {
      setLoadingKeywords((prev) => ({ ...prev, [storeId]: false }))
    }
  }

  const handleDeleteKeyword = async (keywordId: string, storeId: string) => {
    try {
      const res = await fetch(`/api/mystore/track?id=${keywordId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Gagal menghapus')
      fetchKeywords(storeId)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Gagal menghapus keyword')
    }
  }

  const toggleExpand = (storeId: string) => {
    if (expandedStore === storeId) {
      setExpandedStore(null)
    } else {
      setExpandedStore(storeId)
      if (!storeKeywords[storeId]) fetchKeywords(storeId)
    }
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const renderStars = (rating: number) => {
    const full = Math.floor(rating)
    const hasHalf = rating - full >= 0.5
    return (
      <span className="inline-flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => {
          if (i < full) return <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
          if (i === full && hasHalf) return <Star key={i} size={14} className="text-yellow-400 fill-yellow-400 opacity-60" />
          return <Star key={i} size={14} className="text-slate-300" />
        })}
        <span className="ml-1 text-xs font-medium text-slate-700">{rating.toFixed(1)}</span>
      </span>
    )
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">MyStore</h1>
        <div className="w-full h-px bg-slate-300 mb-6"></div>
        <h2 className="text-xl font-bold text-blue-600">Kelola & Lacak Rating Toko Berdasarkan Keyword</h2>
      </div>

      {/* Add Store & Track Bar */}
      <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 mb-8 border border-slate-100">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex items-center gap-3 text-slate-600">
            <Building2 size={20} />
            <span className="text-sm font-medium">{stores.length} Toko Terdaftar</span>
          </div>
          <div className="flex-1" />
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full md:w-auto bg-emerald-400 hover:bg-emerald-500 text-white font-semibold py-3 px-6 rounded-full transition-all flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Tambah Toko
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-8 flex items-center gap-3">
          <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
          <p className="text-red-700 text-sm">{error}</p>
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-6">
        <div className="p-4 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Cari nama toko..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-400 min-w-[140px]"
          >
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-pulse">
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="h-10 w-20 bg-slate-200 rounded" />
                <div className="h-4 flex-1 bg-slate-200 rounded" />
                <div className="h-4 w-24 bg-slate-200 rounded" />
                <div className="h-4 w-16 bg-slate-200 rounded" />
                <div className="h-8 w-20 bg-slate-200 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Store List */}
      {!loading && stores.length === 0 && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-12 text-center">
          <Store className="mx-auto text-slate-300 mb-3" size={48} />
          <p className="text-slate-500">Belum ada toko terdaftar. Klik "Tambah Toko" untuk memulai.</p>
        </div>
      )}

      {!loading && stores.length > 0 && (
        <div className="space-y-4">
          {stores.map((store) => (
            <div key={store.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              {/* Store Row */}
              <div
                className="p-5 flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => toggleExpand(store.store_id)}
              >
                <button className="text-slate-400 flex-shrink-0">
                  {expandedStore === store.store_id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Store size={18} className="text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{store.store_id}</span>
                    <h3 className="font-semibold text-slate-900 truncate">{store.name}</h3>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} /> {store.city}, {store.regional}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star size={12} className="text-yellow-400" /> {store.rating.toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Quick Track Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setTrackingStore(store.store_id)
                    setTrackResult(null)
                    setKeywordInput('')
                  }}
                  className="flex-shrink-0 flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium px-4 py-2 rounded-full text-xs transition-colors"
                >
                  <Target size={14} /> Track Keyword
                </button>
              </div>

              {/* Expanded: Keywords Section */}
              {expandedStore === store.store_id && (
                <div className="border-t border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Target size={14} /> Keyword Tracked
                    </h4>
                    <button
                      onClick={() => fetchKeywords(store.store_id)}
                      className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
                    >
                      <RefreshCw size={12} className={loadingKeywords[store.store_id] ? 'animate-spin' : ''} /> Refresh
                    </button>
                  </div>

                  {loadingKeywords[store.store_id] ? (
                    <div className="text-center py-4 text-slate-400">
                      <Loader2 size={20} className="animate-spin mx-auto" />
                    </div>
                  ) : storeKeywords[store.store_id]?.length > 0 ? (
                    <div className="grid gap-2">
                      {storeKeywords[store.store_id].map((kw) => (
                        <div
                          key={kw.id}
                          className="bg-white rounded-xl p-3 flex items-center gap-4 border border-slate-100 hover:shadow-sm transition-shadow"
                        >
                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-slate-800 text-sm block truncate">{kw.keyword}</span>
                            <span className="text-xs text-slate-400">Terakhir: {formatDate(kw.last_checked)}</span>
                          </div>
                          <div className="text-center">
                            <span className="text-xs text-slate-500 block">Peringkat</span>
                            <span className="font-bold text-sm">
                              {kw.current_rank > 0 ? (
                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                                  #{kw.current_rank}
                                </span>
                              ) : (
                                <span className="text-slate-400 text-xs">-</span>
                              )}
                            </span>
                          </div>
                          <div className="text-center min-w-[70px]">
                            <span className="text-xs text-slate-500 block">Bintang</span>
                            <div className="flex items-center gap-1 justify-center">
                              <span className="font-bold text-sm text-yellow-500">{kw.current_stars.toFixed(1)}</span>
                              {kw.trend === 'up' && <TrendingUp size={14} className="text-emerald-500" />}
                              {kw.trend === 'down' && <TrendingDown size={14} className="text-red-500" />}
                              {kw.trend === 'stable' && <Minus size={14} className="text-slate-400" />}
                            </div>
                            {kw.previous_stars !== undefined && kw.previous_stars !== null && (
                              <span className="text-[10px] text-slate-400">
                Sebelumnya: {kw.previous_stars.toFixed(1)}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteKeyword(kw.id, store.store_id)
                            }}
                            className="text-slate-300 hover:text-red-500 transition-colors"
                            title="Hapus keyword"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-sm text-slate-400 py-4">
                      Belum ada keyword yang dilacak. Gunakan tombol "Track Keyword" untuk memulai.
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Store Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Tambah Toko Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddStore} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Toko *</label>
                <input
                  type="text"
                  required
                  value={newStore.name}
                  onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                  placeholder="Contoh: Viva Apotek Bogor Raya"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Regional *</label>
                  <input
                    type="text"
                    required
                    value={newStore.regional}
                    onChange={(e) => setNewStore({ ...newStore, regional: e.target.value })}
                    placeholder="Jawa Barat"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Kota *</label>
                  <input
                    type="text"
                    required
                    value={newStore.city}
                    onChange={(e) => setNewStore({ ...newStore, city: e.target.value })}
                    placeholder="Bogor"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rating Awal (0-5)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={newStore.rating}
                  onChange={(e) => setNewStore({ ...newStore, rating: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Alamat</label>
                <textarea
                  value={newStore.address}
                  onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
                  placeholder="Alamat lengkap toko..."
                  rows={2}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-emerald-400 hover:bg-emerald-500 disabled:opacity-60 text-white font-semibold py-3 rounded-full transition-all flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Menyimpan...
                  </>
                ) : (
                  <>
                    <Plus size={18} /> Simpan Toko
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Track Keyword Modal */}
      {trackingStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Track Keyword</h3>
              <button
                onClick={() => {
                  setTrackingStore(null)
                  setTrackResult(null)
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Lacak peringkat dan rating bintang untuk toko <span className="font-semibold">{trackingStore}</span> berdasarkan keyword tertentu.
            </p>
            <div className="flex gap-3">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                placeholder="Contoh: apotek terdekat, obat murah..."
                onKeyDown={(e) => e.key === 'Enter' && handleTrackKeyword(trackingStore)}
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <button
                onClick={() => handleTrackKeyword(trackingStore)}
                disabled={tracking || !keywordInput.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2"
              >
                {tracking ? <Loader2 size={16} className="animate-spin" /> : <Target size={16} />}
                {tracking ? 'Tracking...' : 'Track'}
              </button>
            </div>

            {trackResult && (
              <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm mb-2">
                  <Target size={14} /> Hasil Tracking
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-500 block text-xs">Keyword</span>
                    <span className="font-medium text-slate-800">{trackResult.keyword}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs">Peringkat</span>
                    <span className="font-bold text-blue-600">
                      {trackResult.rank > 0 ? `#${trackResult.rank}` : 'Tidak di 10 besar'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs">Rating Bintang</span>
                    <span className="font-bold text-yellow-500 flex items-center gap-1">
                      <Star size={14} className="fill-yellow-400" /> {trackResult.stars.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}