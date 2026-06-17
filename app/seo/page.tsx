'use client'
import { useState, useEffect, useCallback } from 'react'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import {
  Search,
  TrendingUp,
  AlertCircle,
  MapPin,
  Star,
  Filter,
  Download,
  ChevronDown,
  Award,
  BarChart3,
  Building2,
  Users,
  Clock,
  Save,
  Lightbulb,
  X,
  History,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react'

// ===== TYPES =====
interface SearchResult {
  position: number
  title: string
  rating: number
  reviews: number
  isViva: boolean
}

interface SavedItem {
  id: string
  keyword: string
  date: string
  results: SearchResult[]
  vivaPosition: number | null
  vivaRating: number | null
  vivaReviews: number | null
}

// ===== KOMPONEN SKELETON =====
const TableSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 animate-pulse">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-gray-700 dark:to-gray-800">
          <tr>{[...Array(5)].map((_, i) => (<th key={i} className="px-6 py-4"><div className="h-4 bg-gray-600 rounded w-20"></div></th>))}</tr>
        </thead>
        <tbody>
          {[...Array(6)].map((_, i) => (
            <tr key={i} className="border-b border-gray-100 dark:border-gray-700">
              {[...Array(5)].map((_, j) => (<td key={j} className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div></td>))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

// ===== KOMPONEN STAT CARD =====
const StatCard = ({ icon: Icon, label, value, color = 'blue' }: any) => {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
  }
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-full ${colorMap[color]}`}>
          <Icon size={20} />
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  )
}

// ===== BADGE POSISI =====
const PositionBadge = ({ position }: { position: number }) => {
  if (position === 1) return <span className="inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full text-sm font-bold">🥇 #1</span>
  if (position === 2) return <span className="inline-flex items-center gap-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm font-bold">🥈 #2</span>
  if (position === 3) return <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full text-sm font-bold">🥉 #3</span>
  return <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-sm font-medium">#{position}</span>
}

// ===== INSIGHT MODAL =====
const InsightModal = ({ results, onClose }: { results: SearchResult[]; onClose: () => void }) => {
  const viva = results.find((r) => r.isViva)
  const top3 = results.filter((r) => r.position <= 3)
  const top3AvgRating = top3.length ? top3.reduce((acc, r) => acc + r.rating, 0) / top3.length : 0
  const top3AvgReviews = top3.length ? top3.reduce((acc, r) => acc + r.reviews, 0) / top3.length : 0

  let reasons: string[] = []
  let recommendations: string[] = []

  if (!viva) {
    reasons.push('❌ Tidak ada cabang Viva ditemukan dalam 10 hasil teratas.')
    recommendations.push('🔍 Periksa kembali kata kunci atau coba gunakan lokasi yang lebih spesifik.')
  } else {
    if (viva.position > 3) {
      reasons.push(`📉 Posisi Viva saat ini #${viva.position}, di luar 3 besar.`)
      if (viva.rating < top3AvgRating) {
        reasons.push(`⭐ Rating Viva (${viva.rating}) lebih rendah dari rata-rata 3 besar (${top3AvgRating.toFixed(1)}).`)
        recommendations.push('🌟 Tingkatkan rating dengan meminta pelanggan memberikan ulasan bintang 5.')
      }
      if (viva.reviews < top3AvgReviews) {
        reasons.push(`💬 Jumlah ulasan Viva (${viva.reviews}) lebih sedikit dari rata-rata 3 besar (${Math.round(top3AvgReviews)}).`)
        recommendations.push('📢 Dorong pelanggan untuk menulis ulasan setelah berkunjung.')
      }
      if (viva.rating >= top3AvgRating && viva.reviews >= top3AvgReviews) {
        reasons.push('✅ Rating dan jumlah ulasan sudah kompetitif, namun posisi masih di luar 3 besar.')
        recommendations.push('📌 Pastikan informasi lokasi (alamat, jam buka, foto) selalu lengkap dan akurat.')
        recommendations.push('📱 Respons cepat terhadap ulasan negatif untuk meningkatkan reputasi.')
      }
    } else {
      reasons.push('🎉 Cabang Viva sudah berada di 3 besar! Pertahankan dengan konsistensi.')
      recommendations.push('📈 Terus pantau dan respons ulasan, jaga kualitas layanan.')
    }
  }

  // Tambahan saran umum
  if (reasons.length === 0) {
    reasons.push('✅ Tidak ada masalah signifikan terdeteksi.')
    recommendations.push('💡 Tetap update informasi dan foto secara berkala.')
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Lightbulb className="text-yellow-500" size={24} />
            Insight & Rekomendasi
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition">
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          {/* Stat perbandingan */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">Posisi Viva</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{viva ? `#${viva.position}` : '-'}</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">Rata-rata Rating Top 3</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{top3AvgRating.toFixed(1)}</p>
            </div>
          </div>

          {/* Alasan */}
          <div>
            <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">📋 Analisis</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              {reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-2 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <span className="text-base">{r.slice(0, 2)}</span>
                  <span>{r.slice(3)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Rekomendasi */}
          <div>
            <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">💡 Rekomendasi</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              {recommendations.map((r, i) => (
                <li key={i} className="flex items-start gap-2 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                  <span className="text-base">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

// ===== HISTORY PANEL (di sidebar) =====
const HistoryPanel = ({
  history,
  onLoad,
  onClear,
}: {
  history: SavedItem[]
  onLoad: (item: SavedItem) => void
  onClear: () => void
}) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
      >
        <span className="flex items-center gap-2">
          <History size={16} />
          Riwayat
        </span>
        <span className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full text-xs">{history.length}</span>
      </button>
      {isOpen && (
        <div className="mt-2 space-y-1 max-h-60 overflow-y-auto">
          {history.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 px-3 py-2">Belum ada riwayat</p>
          ) : (
            <>
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer group"
                  onClick={() => onLoad(item)}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.keyword}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(item.date).toLocaleDateString()}</p>
                  </div>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                    #{item.vivaPosition || '-'}
                  </span>
                </div>
              ))}
              <button
                onClick={(e) => { e.stopPropagation(); onClear(); }}
                className="text-xs text-red-500 hover:text-red-700 px-3 py-1 mt-2"
              >
                Hapus semua
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ===== MAIN COMPONENT =====
export default function SEOPage() {
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'viva'>('all')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [history, setHistory] = useState<SavedItem[]>([])
  const [showInsight, setShowInsight] = useState(false)
  const [savedMessage, setSavedMessage] = useState('')

  // ===== LOAD HISTORY =====
  useEffect(() => {
    const stored = localStorage.getItem('seoHistory')
    if (stored) {
      try {
        setHistory(JSON.parse(stored))
      } catch (_) {}
    }
  }, [])

  const saveHistory = (newHistory: SavedItem[]) => {
    setHistory(newHistory)
    localStorage.setItem('seoHistory', JSON.stringify(newHistory))
  }

  // ===== FUNGSI PENCARIAN =====
  const checkRank = useCallback(async () => {
    const trimmed = keyword.trim()
    if (!trimmed) {
      setError('Masukkan nama cabang terlebih dahulu')
      return
    }
    setError('')
    setLoading(true)
    setResults([])

    try {
      const response = await fetch('/api/seo', {
        method: 'POST',
        body: JSON.stringify({ keyword: trimmed }),
      })
      if (!response.ok) throw new Error('Gagal mengambil data')
      const data = await response.json()
      setResults(data)
    } catch (err) {
      setError('Terjadi kesalahan koneksi. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }, [keyword])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') checkRank()
  }

  // ===== SIMPAN DATA =====
  const handleSave = () => {
    if (!results.length) return
    const viva = results.find((r) => r.isViva)
    const newItem: SavedItem = {
      id: Date.now().toString(),
      keyword: keyword.trim(),
      date: new Date().toISOString(),
      results: results,
      vivaPosition: viva ? viva.position : null,
      vivaRating: viva ? viva.rating : null,
      vivaReviews: viva ? viva.reviews : null,
    }
    const updated = [newItem, ...history]
    saveHistory(updated)
    setSavedMessage('✅ Data berhasil disimpan!')
    setTimeout(() => setSavedMessage(''), 3000)
  }

  // ===== LOAD DARI HISTORY =====
  const loadHistoryItem = (item: SavedItem) => {
    setKeyword(item.keyword)
    setResults(item.results)
    setError('')
  }

  const clearHistory = () => {
    if (confirm('Hapus semua riwayat?')) {
      saveHistory([])
    }
  }

  // ===== FILTER DATA =====
  const filteredResults = filter === 'all' ? results : results.filter((r) => r.isViva)

  // ===== STATISTIK =====
  const total = results.length
  const vivaCount = results.filter((r) => r.isViva).length
  const lowestVivaPos = results.filter((r) => r.isViva).length > 0
    ? Math.min(...results.filter((r) => r.isViva).map((r) => r.position))
    : '-'
  const avgRating = results.length > 0
    ? (results.reduce((acc, r) => acc + (r.rating || 0), 0) / results.length).toFixed(1)
    : '0'

  // ===== EFEK UNTUK MENUTUP SIDEBAR SAAT RESIZE =====
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsSidebarOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex">
      {/* ===== SIDEBAR (dengan history) ===== */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          flex flex-col
        `}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <span className="font-bold text-gray-800 dark:text-white">Menu</span>
          <button className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {/* konten sidebar asli dari komponen Sidebar, saya asumsikan ada */}
          {/* Di sini kita tambahkan HistoryPanel */}
          <HistoryPanel history={history} onLoad={loadHistoryItem} onClear={clearHistory} />
        </div>
      </aside>

      {/* ===== OVERLAY MOBILE ===== */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64 transition-all duration-300">
        <TopBar onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {/* ===== HEADER ===== */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
                Local SEO Tracker
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Pantau posisi cabang Anda di Google Maps secara real-time
              </p>
            </div>

            {/* ===== SEARCH CARD ===== */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8 mb-8 border border-gray-100 dark:border-gray-700 transition-colors">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                  <input
                    type="text"
                    placeholder="Cari nama cabang atau lokasi... (contoh: Apotek Semarang)"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                  />
                </div>
                <button
                  onClick={checkRank}
                  disabled={loading}
                  className="md:w-auto w-full bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white font-semibold py-3 px-8 rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
              <div className="flex flex-wrap items-center justify-between mt-4 gap-2">
                <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                  <AlertCircle size={14} />
                  Data diambil dari Google Maps secara real-time (maks. 10 hasil)
                </p>
                {savedMessage && (
                  <span className="text-sm text-green-600 dark:text-green-400 animate-in fade-in duration-300">
                    {savedMessage}
                  </span>
                )}
              </div>
            </div>

            {/* ===== ERROR ===== */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-8 flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
                <AlertCircle className="text-red-500 dark:text-red-400" size={20} flex-shrink="0" />
                <p className="text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            {/* ===== RESULTS ===== */}
            {loading && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm animate-pulse">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    </div>
                  ))}
                </div>
                <TableSkeleton />
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* ===== STATISTIK & TOMBOL AKSI ===== */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard icon={Building2} label="Total Lokasi" value={total} color="blue" />
                  <StatCard icon={MapPin} label="Unit Viva" value={vivaCount} color="green" />
                  <StatCard icon={Award} label="Posisi Terbaik Viva" value={lowestVivaPos} color="amber" />
                  <StatCard icon={Star} label="Rata-rata Rating" value={avgRating} color="purple" />
                </div>

                {/* ===== ACTION BUTTONS ===== */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl px-3 py-2 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <Filter size={18} className="text-gray-500 dark:text-gray-400" />
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value as 'all' | 'viva')}
                      className="bg-transparent border-none focus:ring-0 text-gray-700 dark:text-gray-200 font-medium text-sm outline-none"
                    >
                      <option value="all">Semua hasil</option>
                      <option value="viva">Hanya Viva</option>
                    </select>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleSave}
                      disabled={!results.some(r => r.isViva)}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      <Save size={16} />
                      Simpan Data
                    </button>
                    <button
                      onClick={() => setShowInsight(true)}
                      className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-4 py-2 rounded-xl transition shadow-sm text-sm font-medium"
                    >
                      <Lightbulb size={16} />
                      Insight
                    </button>
                    <button
                      onClick={() => {
                        const csv = [
                          ['Posisi', 'Nama', 'Rating', 'Ulasan', 'Status'],
                          ...filteredResults.map((r) => [
                            r.position,
                            r.title,
                            r.rating || 0,
                            r.reviews || 0,
                            r.isViva ? 'Viva' : 'Kompetitor',
                          ]),
                        ]
                          .map((row) => row.join(','))
                          .join('\n')
                        const blob = new Blob([csv], { type: 'text/csv' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `seo_${keyword}_${new Date().toISOString().slice(0, 10)}.csv`
                        a.click()
                        URL.revokeObjectURL(url)
                      }}
                      className="flex items-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors text-sm font-medium shadow-sm"
                    >
                      <Download size={16} />
                      Ekspor CSV
                    </button>
                  </div>
                </div>

                {/* ===== TABEL ===== */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 transition-colors">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-gray-700 dark:to-gray-800 text-white">
                          <th className="px-6 py-4 text-left font-semibold text-sm">Posisi</th>
                          <th className="px-6 py-4 text-left font-semibold text-sm">Nama Lokasi</th>
                          <th className="px-6 py-4 text-left font-semibold text-sm">Rating</th>
                          <th className="px-6 py-4 text-left font-semibold text-sm">Ulasan</th>
                          <th className="px-6 py-4 text-left font-semibold text-sm">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredResults.map((item) => (
                          <tr
                            key={item.position}
                            className={`border-b border-gray-100 dark:border-gray-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition ${
                              item.isViva ? 'bg-blue-50/30 dark:bg-blue-900/5' : ''
                            }`}
                          >
                            <td className="px-6 py-4">
                              <PositionBadge position={item.position} />
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-semibold text-gray-900 dark:text-white">{item.title}</p>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      size={16}
                                      className={i < Math.floor(item.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}
                                    />
                                  ))}
                                </div>
                                <span className="font-semibold text-gray-900 dark:text-white">{item.rating || '0'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-medium">
                                {item.reviews || 0} ulasan
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {item.isViva ? (
                                <span className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-4 py-2 rounded-full font-semibold text-xs">
                                  <MapPin size={14} />
                                  Unit Kita ✓
                                </span>
                              ) : (
                                <span className="text-gray-500 dark:text-gray-400 text-sm">Kompetitor</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ===== TIPS ===== */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800 transition-colors">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    💡 Tips untuk Meningkatkan Ranking
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">• Pastikan informasi lokasi dan jam buka selalu update di Google Maps</li>
                    <li className="flex items-start gap-2">• Dorong pelanggan untuk memberikan ulasan positif</li>
                    <li className="flex items-start gap-2">• Respons ulasan pelanggan secara cepat dan profesional</li>
                    <li className="flex items-start gap-2">• Update foto dan deskripsi lokasi secara berkala</li>
                  </ul>
                </div>
              </div>
            )}

            {/* ===== EMPTY STATE ===== */}
            {!loading && results.length === 0 && keyword && !error && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 border border-gray-100 dark:border-gray-700 text-center animate-in fade-in duration-300">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="text-gray-400 dark:text-gray-500" size={32} />
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-2">Belum ada hasil untuk pencarian Anda</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm">Coba gunakan kata kunci yang berbeda</p>
              </div>
            )}

            {/* ===== INITIAL STATE ===== */}
            {!loading && results.length === 0 && !keyword && !error && (
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl shadow-lg p-12 border border-blue-200 dark:border-blue-800 text-center transition-colors">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-800 dark:to-purple-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MapPin className="text-blue-600 dark:text-blue-300" size={40} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Mulai Tracking Sekarang</h2>
                <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                  Ketik nama cabang Anda untuk melihat posisi di Google Maps dibandingkan dengan kompetitor di area yang sama
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ===== INSIGHT MODAL ===== */}
      {showInsight && <InsightModal results={results} onClose={() => setShowInsight(false)} />}
    </div>
  )
}