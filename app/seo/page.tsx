'use client'
import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import { Search, TrendingUp, AlertCircle, MapPin, Star } from 'lucide-react'

export default function SEOPage() {
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const checkRank = async () => {
    if (!keyword) {
      setError('Masukkan nama cabang terlebih dahulu')
      return
    }
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/seo', {
        method: 'POST',
        body: JSON.stringify({ keyword }),
      })
      const data = await response.json()
      setResults(data)
    } catch (err) {
      setError('Terjadi kesalahan koneksi. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') checkRank()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col">
        <TopBar />

        {/* Content */}
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-6xl">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Local SEO Tracker</h1>
              <p className="text-gray-600">Pantau posisi cabang Anda di Google Maps secara real-time</p>
            </div>

            {/* Search Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
              <div className="grid md:grid-cols-12 gap-4">
                <div className="md:col-span-7 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Cari nama cabang atau lokasi... (contoh: Cibinong, Bandung)"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                  />
                </div>
                <button
                  onClick={checkRank}
                  disabled={loading}
                  className="md:col-span-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Mencari...
                    </>
                  ) : (
                    <>
                      <TrendingUp size={18} />
                      Cek Urutan
                    </>
                  )}
                </button>
              </div>

              {/* Info Text */}
              <p className="text-sm text-gray-500 mt-4 flex items-center gap-2">
                <AlertCircle size={16} />
                Data diambil dari Google Maps secara real-time
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 flex items-center gap-3">
                <AlertCircle className="text-red-500" size={20} flex-shrink-0 />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Results */}
            {results.length > 0 && (
              <div className="space-y-6 animate-in fade-in">
                {/* Summary Stats */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <p className="text-gray-600 text-sm font-medium mb-2">Total Hasil</p>
                    <p className="text-3xl font-bold text-gray-900">{results.length}</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <p className="text-gray-600 text-sm font-medium mb-2">Posisi Viva Terendah</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {Math.min(...results.filter((r: any) => r.isViva).map((r: any) => r.position), Infinity)}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <p className="text-gray-600 text-sm font-medium mb-2">Unit Viva</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {results.filter((r: any) => r.isViva).length}
                    </p>
                  </div>
                </div>

                {/* Results Table */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
                          <th className="px-6 py-4 text-left font-semibold">Posisi</th>
                          <th className="px-6 py-4 text-left font-semibold">Nama Lokasi</th>
                          <th className="px-6 py-4 text-left font-semibold">Rating</th>
                          <th className="px-6 py-4 text-left font-semibold">Ulasan</th>
                          <th className="px-6 py-4 text-left font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((item: any) => (
                          <tr
                            key={item.position}
                            className={`border-b border-gray-100 hover:bg-blue-50 transition ${
                              item.isViva ? 'bg-blue-50' : ''
                            }`}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                  item.position <= 3
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {item.position}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-semibold text-gray-900">{item.title}</p>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      size={16}
                                      className={i < Math.floor(item.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                                    />
                                  ))}
                                </div>
                                <span className="font-semibold text-gray-900">{item.rating || '0'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                                {item.reviews || 0} ulasan
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {item.isViva ? (
                                <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold text-sm">
                                  <MapPin size={14} />
                                  Unit Kita ✓
                                </span>
                              ) : (
                                <span className="text-gray-500 text-sm">Kompetitor</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Tips */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    💡 Tips untuk Meningkatkan Ranking
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Pastikan informasi lokasi dan jam buka selalu update di Google Maps</li>
                    <li>• Dorong pelanggan untuk memberikan ulasan positif</li>
                    <li>• Respons ulasan pelanggan secara cepat dan profesional</li>
                    <li>• Update foto dan deskripsi lokasi secara berkala</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && results.length === 0 && keyword && !error && (
              <div className="bg-white rounded-2xl shadow-lg p-12 border border-gray-100 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="text-gray-400" size={32} />
                </div>
                <p className="text-gray-600 mb-2">Belum ada hasil untuk pencarian Anda</p>
                <p className="text-gray-500 text-sm">Coba gunakan kata kunci yang berbeda</p>
              </div>
            )}

            {/* Initial State */}
            {!loading && results.length === 0 && !keyword && !error && (
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-lg p-12 border border-blue-200 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MapPin className="text-blue-600" size={40} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Mulai Tracking Sekarang</h2>
                <p className="text-gray-600 max-w-md mx-auto">
                  Ketik nama cabang Anda untuk melihat posisi di Google Maps dibandingkan dengan kompetitor di area yang sama
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
