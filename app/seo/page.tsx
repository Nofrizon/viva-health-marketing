'use client'
import { useState } from 'react'
import { Search, TrendingUp, AlertCircle, Star } from 'lucide-react'

interface SearchResult { position: number; title: string; rating: number; reviews: number; isViva: boolean }

export default function SEOPage() {
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const checkRank = async () => {
    if (!keyword.trim()) {
      setError('Silakan masukkan keyword terlebih dahulu')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: keyword.trim() }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Gagal mengambil data')
      }
      const data = await res.json()
      setResults(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Local SEO Tracker</h1>
        <div className="w-full h-px bg-slate-300 mb-6"></div>
        <h2 className="text-xl font-bold text-blue-600">Pantau Posisi Google Maps</h2>
      </div>

      <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 mb-8 border border-slate-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Cari nama cabang atau lokasi... (contoh: Apotek Semarang)"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && checkRank()}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400 text-slate-900"
            />
          </div>
          <button
            onClick={checkRank}
            disabled={loading}
            className="md:w-auto w-full bg-emerald-400 hover:bg-emerald-500 text-white font-semibold py-3 px-8 rounded-full transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <TrendingUp size={18} />}
            {loading ? 'Mencari...' : 'Cek Urutan'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-8 flex items-center gap-3">
          <AlertCircle className="text-red-500" size={20} />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {loading && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-pulse">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Posisi', 'Nama Lokasi', 'Rating', 'Ulasan', 'Status'].map((h) => (
                    <th key={h} className="px-6 py-4 text-sm font-bold text-slate-900">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3].map((i) => (
                  <tr key={i} className="border-b border-slate-50">
                    {[1, 2, 3, 4, 5].map((j) => (
                      <td key={j} className="px-6 py-5"><div className="h-4 bg-slate-200 rounded w-3/4" /></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {results.length > 0 && !loading && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-6 py-4 text-sm font-bold text-slate-900">Posisi</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-900">Nama Lokasi</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-900">Rating</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-900">Ulasan</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-900">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-600">
                {results.map((item) => (
                  <tr key={item.position} className={`border-b border-slate-50 hover:bg-slate-50 ${item.isViva ? 'bg-blue-50/30' : ''}`}>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {item.position === 1 ? (
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-400 text-white font-bold text-sm">#{item.position}</span>
                      ) : item.position <= 3 ? (
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-300 text-slate-700 font-bold text-sm">#{item.position}</span>
                      ) : (
                        <span className="text-slate-500">#{item.position}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">{item.title}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1">
                        <Star size={16} className="text-yellow-400 fill-yellow-400" /> {item.rating}
                      </span>
                    </td>
                    <td className="px-6 py-4">{item.reviews} ulasan</td>
                    <td className="px-6 py-4">
                      {item.isViva ? (
                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">Unit Kita</span>
                      ) : (
                        <span className="text-slate-400 text-xs">Kompetitor</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && results.length === 0 && !error && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-12 text-center">
          <Search className="mx-auto text-slate-300 mb-3" size={40} />
          <p className="text-slate-500">Masukkan keyword dan klik "Cek Urutan" untuk melihat hasil</p>
        </div>
      )}
    </>
  )
}
