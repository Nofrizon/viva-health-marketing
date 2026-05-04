'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AuditPage() {
  const [query, setQuery] = useState('');
  const [days, setDays] = useState(30);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [unitList, setUnitList] = useState<string[]>([]);

  // Mengambil daftar nama unit untuk Autocomplete
  useEffect(() => {
    const fetchUnits = async () => {
      const { data } = await supabase.from('audit_results').select('nama_unit');
      if (data) {
        const unique = Array.from(new Set(data.map(i => i.nama_unit)));
        setUnitList(unique);
      }
    };
    fetchUnits();
  }, []);

  const runAudit = async () => {
    if (!query) return;
    setLoading(true);
    const res = await fetch('/api/audit', {
      method: 'POST',
      body: JSON.stringify({ query, days })
    });
    const result = await res.json();
    setData(result);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] p-4 md:p-8 text-black">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-700">Viva Audit AI</h1>
          <a href="/seo" className="text-sm font-bold bg-blue-100 text-blue-700 px-4 py-2 rounded-lg">Rank Tracker 🚀</a>
        </div>

        {/* Input Form Berbasis Card */}
        <div className="bg-white p-4 rounded-2xl shadow-sm mb-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-6 relative">
              <input 
                list="units"
                className="w-full border-none bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan Nama Cabang..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <datalist id="units">
                {unitList.map(u => <option key={u} value={u} />)}
              </datalist>
            </div>
            <div className="md:col-span-3">
              <select 
                className="w-full bg-gray-50 p-3 rounded-xl outline-none border-none"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
              >
                <option value={30}>30 Hari</option>
                <option value={90}>3 Bulan</option>
              </select>
            </div>
            <button 
              onClick={runAudit}
              disabled={loading}
              className="md:col-span-3 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Analisis...' : 'Audit'}
            </button>
          </div>
        </div>

        {data && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Rating', val: data.avg_rating, color: 'text-gray-800' },
                { label: 'Total', val: data.total, color: 'text-gray-800' },
                { label: 'Buruk', val: data.bad, color: 'text-red-500' },
                { label: 'Baik', val: data.good, color: 'text-green-500' },
              ].map((s, i) => (
                <div key={i} className="bg-white p-4 rounded-2xl shadow-sm text-center border border-gray-100">
                  <p className="text-xs text-gray-400 uppercase font-bold mb-1">{s.label}</p>
                  <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
                </div>
              ))}
            </div>

            {/* Review Slider (Horizontal Scroll) */}
            <h3 className="font-bold mb-3 text-gray-700 ml-1">Keluhan (1-3★)</h3>
            <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
              {data.raw_reviews.length > 0 ? data.raw_reviews.map((r: any, i: number) => (
                <div key={i} className="min-w-[280px] bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                  <p className="text-sm italic text-gray-600 line-clamp-3">"{r.text}"</p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full">{r.rating} ★</span>
                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{r.author}</span>
                  </div>
                </div>
              )) : <div className="text-green-600 font-medium p-4 bg-green-50 rounded-xl w-full">Tidak ada ulasan negatif. ✨</div>}
            </div>

            {/* AI Report */}
            <h3 className="font-bold mt-6 mb-3 text-gray-700 ml-1">Analisis Senior Auditor</h3>
            <div className="bg-[#fffdf0] border-l-4 border-amber-400 p-5 rounded-2xl shadow-sm">
              <p className="text-sm text-amber-900 leading-relaxed whitespace-pre-wrap">{data.ai_report}</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}