'use client'
import { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '@/components/DashboardLayout' // Gunakan layout utama
import { Search, TrendingUp, AlertCircle, MapPin, Star, Filter, Download, Award, Building2, Lightbulb, Save } from 'lucide-react'

// (Tipe data SearchResult dan SavedItem tetap sama seperti sebelumnya)
interface SearchResult { position: number; title: string; rating: number; reviews: number; isViva: boolean }

export default function SEOPage() {
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'viva'>('all')

  const checkRank = async () => {
    // Simulasi atau logic fetch API Anda di sini
    setLoading(true); setError('');
    setTimeout(() => {
      setResults([
        { position: 1, title: 'Kompetitor A', rating: 4.8, reviews: 120, isViva: false },
        { position: 2, title: 'Viva Health Apotek', rating: 4.9, reviews: 85, isViva: true },
      ]);
      setLoading(false);
    }, 1000);
  }

  const filteredResults = filter === 'all' ? results : results.filter((r) => r.isViva)

  return (
    <DashboardLayout>
      {/* HEADER SELARAS */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Local SEO Tracker</h1>
        <div className="w-full h-px bg-slate-300 mb-6"></div>
        <h2 className="text-xl font-bold text-blue-600">Pantau Posisi Google Maps</h2>
      </div>

      {/* SEARCH CARD (Putih Bersih) */}
      <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 mb-8 border border-slate-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Cari nama cabang atau lokasi... (contoh: Apotek Semarang)"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400 text-slate-900"
            />
          </div>
          {/* TOMBOL EMERALD ROUNDED-FULL */}
          <button
            onClick={checkRank}
            disabled={loading}
            className="md:w-auto w-full bg-emerald-400 hover:bg-emerald-500 text-white font-semibold py-3 px-8 rounded-full transition-all flex items-center justify-center gap-2"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <TrendingUp size={18} />}
            Cek Urutan
          </button>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-8 flex items-center gap-3">
          <AlertCircle className="text-red-500" size={20} />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* RESULTS TABLE */}
      {results.length > 0 && !loading && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-6 py-4 text-sm font-bold text-slate-900">Posisi</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-900">Nama Lokasi</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-900">Rating</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-900">Ulasan</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-900">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-slate-600">
                  {filteredResults.map((item) => (
                    <tr key={item.position} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-6 py-4 font-semibold text-slate-900">#{item.position}</td>
                      <td className="px-6 py-4 font-medium text-slate-800">{item.title}</td>
                      <td className="px-6 py-4 flex items-center gap-1">
                        <Star size={16} className="text-yellow-400 fill-yellow-400" /> {item.rating}
                      </td>
                      <td className="px-6 py-4">{item.reviews} ulasan</td>
                      <td className="px-6 py-4">
                        {item.isViva ? (
                          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">Unit Kita</span>
                        ) : (
                          <span className="text-slate-400">Kompetitor</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}