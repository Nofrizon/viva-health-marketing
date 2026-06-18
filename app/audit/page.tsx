'use client'
import { useState } from 'react'
import { Shield, Zap } from 'lucide-react'

export default function AuditPage() {
  const [query, setQuery] = useState('')
  const [days, setDays] = useState(30)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState<{ avg_rating: string; total: number; bad: number; good: number; ai_report: string } | null>(null)

  const runAudit = async () => {
    if (!query.trim()) {
      setError('Silakan masukkan nama unit / cabang terlebih dahulu')
      return
    }
    setLoading(true)
    setError('')
    setData(null)
    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim(), days }),
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.message || json.error || 'Gagal menjalankan audit')
      }
      setData(json)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan')
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') runAudit()
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">AI Review Audit</h1>
        <div className="w-full h-px bg-slate-300 mb-6"></div>
        <h2 className="text-xl font-bold text-blue-600">Analisis Sentimen Ulasan</h2>
      </div>

      <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 mb-8 border border-slate-100">
        <div className="grid md:grid-cols-12 gap-4">
          <div className="md:col-span-6">
            <input
              placeholder="Ketik nama unit / cabang (misal: Viva Apotek X)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400 text-slate-900"
            />
          </div>
          <div className="md:col-span-3">
             <select 
               value={days} 
               onChange={e => setDays(Number(e.target.value))}
               className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none text-slate-900"
             >
               <option value={30}>30 Hari Terakhir</option>
               <option value={90}>90 Hari Terakhir</option>
             </select>
          </div>
          <button
            onClick={runAudit}
            disabled={loading}
            className="md:col-span-3 bg-emerald-400 hover:bg-emerald-500 text-white font-semibold py-3 rounded-full transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Zap size={18} />}
            {loading ? 'Memproses...' : 'Jalankan Audit'}
          </button>
        </div>
        {error && <p className="text-red-500 text-sm mt-3 font-medium">{error}</p>}
      </div>

      {loading && (
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-3" />
                <div className="h-8 bg-slate-200 rounded w-1/3" />
              </div>
            ))}
          </div>
          <div className="bg-white rounded-3xl shadow-sm p-8 border border-slate-100">
            <div className="h-6 bg-slate-200 rounded w-1/4 mb-4" />
            <div className="h-32 bg-slate-100 rounded-2xl" />
          </div>
        </div>
      )}

      {data && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <p className="text-slate-500 text-sm font-medium mb-2">Rating Rata-rata</p>
              <p className="text-3xl font-bold text-slate-900">{data.avg_rating}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <p className="text-slate-500 text-sm font-medium mb-2">Total Ulasan</p>
              <p className="text-3xl font-bold text-blue-600">{data.total}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <p className="text-slate-500 text-sm font-medium mb-2">Ulasan Negatif</p>
              <p className="text-3xl font-bold text-red-500">{data.bad}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <p className="text-slate-500 text-sm font-medium mb-2">Ulasan Positif</p>
              <p className="text-3xl font-bold text-emerald-500">{data.good}</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm p-8 border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Shield className="text-emerald-500" size={20} /> AI Audit Report
            </h3>
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">
                 {data.ai_report}
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && !data && !error && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-12 text-center">
          <Shield className="mx-auto text-slate-300 mb-3" size={40} />
          <p className="text-slate-500">Masukkan nama unit dan klik "Jalankan Audit" untuk memulai analisis</p>
        </div>
      )}
    </>
  )
}
