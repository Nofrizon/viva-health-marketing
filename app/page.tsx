// app/page.tsx
import DashboardLayout from '@/components/DashboardLayout';

export default function DashboardPage() {
  return (
    <DashboardLayout>
      {/* Header Halaman (Mirip "Employee Management" di gambar) */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">SaaS Management Dashboard</h1>
        <div className="w-full h-px bg-slate-300 mb-6"></div>
        {/* Sub-judul biru (Mirip "Employees Slots") */}
        <h2 className="text-xl font-bold text-blue-600">Quick Access & Status</h2>
      </div>

      {/* Main Card (Mirip tabel putih di gambar) */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead>
            <tr className="text-sm font-bold text-slate-900 border-b border-slate-100">
              <th className="pb-4 px-4">Fitur Utama</th>
              <th className="pb-4 px-4">Deskripsi</th>
              <th className="pb-4 px-4">Status Penggunaan</th>
              <th className="pb-4 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-sm text-slate-600">
            {/* Baris 1 */}
            <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
              <td className="py-4 px-4 font-semibold text-slate-800">AutoWrite SEO</td>
              <td className="py-4 px-4">Generate konten artikel standar SEO</td>
              <td className="py-4 px-4">25 Artikel Dibuat</td>
              <td className="py-4 px-4 text-right">
                {/* Tombol hijau (Mirip "Invite Employee") */}
                <a href="/generate-content" className="inline-block bg-emerald-400 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-full text-xs transition-colors">
                  Buka Fitur
                </a>
              </td>
            </tr>
            {/* Baris 2 */}
            <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
              <td className="py-4 px-4 font-semibold text-slate-800">Workspace Socmed</td>
              <td className="py-4 px-4">Generator & Scheduler Caption</td>
              <td className="py-4 px-4">12 Draft Tersimpan</td>
              <td className="py-4 px-4 text-right">
                <a href="/generate-caption" className="inline-block bg-emerald-400 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-full text-xs transition-colors">
                  Buka Fitur
                </a>
              </td>
            </tr>
            {/* Baris 3 */}
            <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
              <td className="py-4 px-4 font-semibold text-slate-800">Local SEO Tracker</td>
              <td className="py-4 px-4">Tracking posisi Gmaps Viva Health</td>
              <td className="py-4 px-4">Terakhir update: Hari ini</td>
              <td className="py-4 px-4 text-right">
                <a href="/seo" className="inline-block bg-emerald-400 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-full text-xs transition-colors">
                  Buka Fitur
                </a>
              </td>
            </tr>
            {/* Baris 4 */}
            <tr className="hover:bg-slate-50 transition-colors">
              <td className="py-4 px-4 font-semibold text-slate-800">Review Audit</td>
              <td className="py-4 px-4">Analisis ulasan dengan AI</td>
              <td className="py-4 px-4">Free Limits</td>
              <td className="py-4 px-4 text-right">
                <a href="/audit" className="inline-block bg-emerald-400 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-full text-xs transition-colors">
                  Buka Fitur
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}