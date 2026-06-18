'use client'
import { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Shield, AlertCircle, MessageSquare, Zap, TrendingDown, CheckCircle } from 'lucide-react'

export default function AuditPage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)

  const runAudit = async () => {
    setLoading(true)
    // Simulasi fetch
    setTimeout(() => {
      setData({ avg_rating: '4.5', total: 120, bad: 5, good: 115, ai_report: 'Pelayanan secara umum baik, namun antrean sering menjadi keluhan di jam sibuk.' })
      setLoading(false)
    }, 1500)
  }

  return (
    <DashboardLayout>
      {/* HEADER SELARAS */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">AI Review Audit</h1>
        <div className="w-full h-px bg-slate-300 mb-6"></div>
        <h2 className="text-xl font-bold text-blue-600">Analisis Sentimen Ulasan</h2>
      </div>

      {/* INPUT CARD (Putih, Hilangkan gradient ungu) */}
      <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 mb-8 border border-slate-100">
        <div className="grid md:grid-cols-12 gap-4">
          <div className="md:col-span-8">
            <input
              placeholder="Cari nama cabang untuk diaudit..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400 text-slate-900"
            />
          </div>
          {/* TOMBOL EMERALD ROUNDED-FULL */}
          <button
            onClick={runAudit}
            disabled={loading}
            className="md:col-span-4 bg-emerald-400 hover:bg-emerald-500 text-white font-semibold py-3 rounded-full transition-all flex items-center justify-center gap-2"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Zap size={18} />}
            Jalankan Audit
          </button>
        </div>
      </div>

      {/* RESULTS */}
      {data && (
        <div className="space-y-6">
          {/* STATS CARDS */}
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

          {/* AI REPORT CARD (Putih, Hilangkan gradient) */}
          <div className="bg-white rounded-3xl shadow-sm p-8 border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Shield className="text-emerald-500" size={20} /> Ringkasan Auditor AI
            </h3>
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <p className="text-slate-700 text-sm leading-relaxed">{data.ai_report}</p>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}