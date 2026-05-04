'use client'
import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts'
import { 
  Activity, Users, AlertTriangle, CheckCircle, 
  MapPin, TrendingUp, Search, Bell 
} from 'lucide-react'

export default function ExecutiveDashboard() {
  const [stats, setStats] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({ total: 0, avg: 0, critical: 0, healthy: 0 });

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from('audit_results').select('*').order('tanggal_audit', { ascending: false });
      if (data) {
        setStats(data);
        // Hitung metrik ringkasan
        const total = data.length;
        const avg = data.reduce((acc, curr) => acc + Number(curr.avg_rating), 0) / total;
        const critical = data.filter(d => Number(d.avg_rating) < 3.5).length;
        const healthy = data.filter(d => Number(d.avg_rating) >= 4.0).length;
        setMetrics({ total, avg: Number(avg.toFixed(1)), critical, healthy });
      }
    };
    fetchData();
  }, []);

  const pieData = [
    { name: 'Kritis (<3.5)', value: metrics.critical, color: '#ef4444' },
    { name: 'Sehat (>4.0)', value: metrics.healthy, color: '#10b981' },
    { name: 'Normal', value: metrics.total - (metrics.critical + metrics.healthy), color: '#6366f1' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      {/* SIDEBAR MOCKUP (Left) & MAIN CONTENT (Right) */}
      <div className="flex">
        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-10">
          
          {/* HEADER */}
          <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">Viva Command Center</h1>
              <p className="text-slate-500 font-medium">Monitoring Reputasi Nasional • Real-time Data</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-xl border shadow-sm cursor-pointer hover:bg-slate-50">
                <Bell size={20} className="text-slate-600" />
              </div>
              <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:shadow-lg transition-all">
                <Activity size={18} /> Ekspor Laporan
              </button>
            </div>
          </header>

          {/* TOP STATS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatCard label="Total Cabang Diaudit" val={metrics.total} icon={<MapPin className="text-indigo-600" />} />
            <StatCard label="Rating Nasional" val={`${metrics.avg} / 5.0`} icon={<TrendingUp className="text-emerald-600" />} />
            <StatCard label="Cabang Kritis" val={metrics.critical} icon={<AlertTriangle className="text-rose-500" />} trend="Perlu Tindakan" />
            <StatCard label="Cabang Sehat" val={metrics.healthy} icon={<CheckCircle className="text-emerald-500" />} trend="Good Job!" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* CHART 1: RATING PER CABANG */}
            <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <Activity size={20} className="text-indigo-600" /> Performa Rating Cabang
              </h3>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="nama_unit" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                    <Tooltip 
                      cursor={{fill: '#f8fafc'}}
                      contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                    />
                    <Bar dataKey="avg_rating" radius={[6, 6, 0, 0]} barSize={40}>
                      {stats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={Number(entry.avg_rating) < 3.5 ? '#f43f5e' : '#6366f1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* CHART 2: SENTIMEN PIE */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <h3 className="font-bold text-lg mb-6">Distribusi Status</h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3 mt-4">
                {pieData.map(item => (
                  <div key={item.name} className="flex justify-between items-center text-sm font-medium">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></span>
                      {item.name}
                    </span>
                    <span className="text-slate-400">{item.value} Unit</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RECENT AI AUDITS TABLE */}
          <div className="mt-10 bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-lg">Laporan AI Terbaru</h3>
              <button className="text-indigo-600 text-sm font-bold hover:underline">Lihat Semua</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-slate-400 text-[11px] uppercase tracking-widest font-bold">
                  <tr>
                    <th className="px-6 py-4">Cabang</th>
                    <th className="px-6 py-4">Rating</th>
                    <th className="px-6 py-4">Status AI</th>
                    <th className="px-6 py-4">Tanggal</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium">
                  {stats.slice(0, 5).map((row, i) => (
                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold">{row.nama_unit}</td>
                      <td className="px-6 py-4">
                         <span className={`px-3 py-1 rounded-full text-[12px] ${Number(row.avg_rating) < 3.5 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                           ★ {row.avg_rating}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 max-w-[300px] truncate">{row.analisis_ai}</td>
                      <td className="px-6 py-4 text-slate-400 text-xs">{new Date(row.tanggal_audit).toLocaleDateString('id-ID')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}

function StatCard({ label, val, icon, trend }: any) {
  return (
    <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-slate-50 rounded-xl">{icon}</div>
        {trend && <span className="text-[10px] font-black uppercase tracking-wider text-rose-500 bg-rose-50 px-2 py-1 rounded-lg">{trend}</span>}
      </div>
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
      <h4 className="text-2xl font-black text-slate-800">{val}</h4>
    </div>
  )
}