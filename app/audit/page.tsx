'use client'
import { useState } from 'react'

export default function AuditPage() {
  const [query, setQuery] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const jalankanAudit = async () => {
    if (!query) return;
    setLoading(true);
    const res = await fetch('/api/audit', {
      method: 'POST',
      body: JSON.stringify({ query, days: 30 })
    });
    const result = await res.json();
    setData(result);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-black">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-extrabold text-blue-600 mb-6">VIVA AUDIT SYSTEM</h1>
        
        {/* Input Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm mb-6 flex gap-3">
          <input 
            className="flex-1 border p-3 rounded-xl outline-none"
            placeholder="Ketik Nama Cabang (Contoh: Cibinong)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button 
            onClick={jalankanAudit}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold"
            disabled={loading}
          >
            {loading ? 'Menganalisis...' : 'Mulai Audit'}
          </button>
        </div>

        {data && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl shadow-sm text-center">
                <p className="text-gray-500 text-sm">Rating</p>
                <p className="text-2xl font-bold">{data.avg_rating}</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm text-center">
                <p className="text-gray-500 text-sm">Total</p>
                <p className="text-2xl font-bold">{data.total}</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm text-center">
                <p className="text-gray-500 text-sm text-red-500">Buruk</p>
                <p className="text-2xl font-bold text-red-500">{data.bad}</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm text-center">
                <p className="text-gray-500 text-sm text-green-500">Baik</p>
                <p className="text-2xl font-bold text-green-500">{data.good}</p>
              </div>
            </div>

            {/* AI Report Card */}
            <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-xl mb-6">
              <h3 className="font-bold text-amber-800 mb-2">💡 ANALISIS SENIOR AUDITOR</h3>
              <p className="text-amber-900 whitespace-pre-wrap">{data.ai_report}</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}