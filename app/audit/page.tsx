'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import { supabase } from '@/lib/supabase'
import { Shield, TrendingDown, AlertCircle, CheckCircle, Clock, MessageSquare, Zap } from 'lucide-react'

interface AuditResult {
  name: string
  avg_rating: string
  total: number
  bad: number
  good: number
  ai_report: string
  raw_reviews: any[]
  timestamp: string
  audit_period: string
}

export default function AuditPage() {
  const [query, setQuery] = useState('')
  const [days, setDays] = useState(30)
  const [data, setData] = useState<AuditResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [unitList, setUnitList] = useState<string[]>([])

  // Fetch unit list for autocomplete
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const { data } = await supabase.from('audit_results').select('nama_unit')
        if (data) {
          const unique = Array.from(new Set(data.map((i: any) => i.nama_unit)))
          setUnitList(unique as string[])
        }
      } catch (err) {
        console.error('Failed to fetch units:', err)
      }
    }
    fetchUnits()
  }, [])

  const runAudit = async () => {
    if (!query.trim()) {
      setError('Masukkan nama cabang terlebih dahulu')
      return
    }
    setError('')
    setLoading(true)
    setData(null)

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        body: JSON.stringify({ query, days })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Audit gagal')
      }

      const result = await res.json()
      setData(result)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Terjadi kesalahan'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') runAudit()
  }

  const getReportSummary = (report: string) => {
    const lines = report.split('\n')
    return lines.slice(0, 2).join('\n')
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
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Shield className="text-purple-600" size={32} />
                AI Review Audit
              </h1>
              <p className="text-gray-600">Senior Auditor AI menganalisis ulasan pelanggan dan memberikan rekomendasi</p>
            </div>

            {/* Input Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
              <div className="grid md:grid-cols-12 gap-4 mb-4">
                <div className="md:col-span-5 relative">
                  <input
                    list="units"
                    placeholder="Cari nama cabang..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                  />
                  <datalist id="units">
                    {unitList.map((u) => (
                      <option key={u} value={u} />
                    ))}
                  </datalist>
                </div>

                <div className="md:col-span-3">
                  <select
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white cursor-pointer"
                  >
                    <option value={30}>30 Hari Terakhir</option>
                    <option value={90}>90 Hari Terakhir</option>
                  </select>
                </div>

                <button
                  onClick={runAudit}
                  disabled={loading}
                  className="md:col-span-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Menganalisis...
                    </>
                  ) : (
                    <>
                      <Zap size={18} />
                      Jalankan Audit
                    </>
                  )}
                </button>
              </div>

              {/* Info */}
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <AlertCircle size={16} />
                Audit menganalisis ulasan dari Google Maps dan memberikan insight mendalam
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
            {data && (
              <div className="space-y-6 animate-in fade-in">
                {/* Stats */}
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <p className="text-gray-600 text-sm font-medium mb-2 flex items-center gap-2">
                      <span className="text-xl">⭐</span>
                      Rating Rata-rata
                    </p>
                    <p className="text-4xl font-bold text-gray-900">{data.avg_rating}</p>
                  </div>

                  <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <p className="text-gray-600 text-sm font-medium mb-2 flex items-center gap-2">
                      <MessageSquare size={16} />
                      Total Ulasan
                    </p>
                    <p className="text-4xl font-bold text-blue-600">{data.total}</p>
                  </div>

                  <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <p className="text-gray-600 text-sm font-medium mb-2 flex items-center gap-2">
                      <TrendingDown size={16} />
                      Negatif
                    </p>
                    <p className="text-4xl font-bold text-red-600">{data.bad}</p>
                  </div>

                  <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <p className="text-gray-600 text-sm font-medium mb-2 flex items-center gap-2">
                      <CheckCircle size={16} />
                      Positif
                    </p>
                    <p className="text-4xl font-bold text-green-600">{data.good}</p>
                  </div>
                </div>

                {/* Negative Reviews */}
                {data.raw_reviews.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <AlertCircle className="text-red-500" size={24} />
                      Ulasan Negatif ({data.raw_reviews.length})
                    </h2>

                    <div className="grid md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                      {data.raw_reviews.map((review, idx) => (
                        <div
                          key={idx}
                          className="p-4 border border-red-200 bg-red-50 rounded-lg hover:shadow-md transition"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex gap-1">
                              {[...Array(5)].map((_, i) => (
                                <span
                                  key={i}
                                  className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-semibold">
                              {review.rating}★
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mb-2 italic">"{review.text}"</p>
                          <p className="text-xs text-gray-500">— {review.author || 'Anonim'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Report */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-8 border border-purple-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Zap className="text-purple-600" size={24} />
                    Analisis Senior Auditor AI
                  </h2>

                  <div className="bg-white rounded-xl p-6 border border-purple-100">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm font-medium">
                      {data.ai_report}
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="mt-4 flex gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      <span>{new Date(data.timestamp).toLocaleDateString('id-ID')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield size={14} />
                      <span>{data.audit_period}</span>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl shadow-lg p-8 border border-emerald-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">💡 Action Items</h2>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                        1
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Review & Respons Ulasan Negatif</p>
                        <p className="text-sm text-gray-600 mt-1">Respons cepat dalam 24 jam bisa meningkatkan kepuasan pelanggan hingga 30%</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                        2
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Identifikasi Masalah Root Cause</p>
                        <p className="text-sm text-gray-600 mt-1">Tinjau laporan AI di atas untuk memahami pola masalah yang berulang</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                        3
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Implementasi Improvement</p>
                        <p className="text-sm text-gray-600 mt-1">Follow up rekomendasi AI dan track progress dengan audit berkala</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && !data && !error && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-12 border border-purple-200 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="text-purple-600" size={40} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Mulai Audit Sekarang</h2>
                <p className="text-gray-600 max-w-md mx-auto">
                  Ketik nama cabang untuk menganalisis ulasan pelanggan dengan AI dan dapatkan insight mendalam untuk improvement
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
