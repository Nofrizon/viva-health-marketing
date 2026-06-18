'use client';
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { Menu, UserCircle } from 'lucide-react';
import './globals.css'; // Pastikan CSS global Anda terhubung

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <html lang="id">
      <body>
        <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-800">
          {/* Mengimpor Sidebar dari folder components */}
          <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
          
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Header / TopBar terintegrasi */}
            <header className="flex items-center justify-between h-20 px-6 lg:px-10 bg-slate-50">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 -ml-2 text-slate-600 rounded-md lg:hidden hover:bg-slate-200"
              >
                <Menu size={24} />
              </button>
              <div className="flex items-center gap-4 ml-auto">
                 <span className="text-sm font-semibold text-slate-700">Admin User</span>
                 <UserCircle size={32} className="text-slate-400" />
              </div>
            </header>

            {/* Area Konten Utama yang otomatis memuat page.tsx */}
            <main className="flex-1 overflow-y-auto px-6 lg:px-10 pb-10">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}