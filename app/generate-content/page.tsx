'use client';
import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

export default function ContentWriterPage() {
  const [focusKeyword, setFocusKeyword] = useState('');
  const [htmlOutput, setHtmlOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generate = () => {
    setIsLoading(true);
    setTimeout(() => {
      setHtmlOutput('<h2>Hasil Generate Konten</h2><p>Artikel SEO tentang ' + focusKeyword + '</p>');
      setIsLoading(false);
    }, 2000);
  };

  return (
    <DashboardLayout>
      {/* HEADER SELARAS */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">AutoWrite SEO PRO</h1>
        <div className="w-full h-px bg-slate-300 mb-6"></div>
        <h2 className="text-xl font-bold text-blue-600">Generator Artikel E-E-A-T</h2>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* LEFT PANEL: Form Pengaturan */}
        <section className="w-full lg:w-1/3 bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Focus Keyword</label>
            <input 
              type="text" 
              value={focusKeyword} 
              onChange={e => setFocusKeyword(e.target.value)} 
              placeholder="Contoh: skincare lokal terbaik" 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none" 
            />
          </div>
          <div>
             <label className="block text-sm font-bold text-slate-700 mb-2">Tipe Konten</label>
             <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none">
                <option>Artikel Informatif</option>
                <option>Review Produk</option>
             </select>
          </div>

          {/* TOMBOL EMERALD ROUNDED-FULL */}
          <button 
            onClick={generate} 
            disabled={isLoading} 
            className="w-full bg-emerald-400 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-full transition-all mt-4"
          >
            {isLoading ? 'Generating...' : 'Generate Content'}
          </button>
        </section>

        {/* RIGHT PANEL: Hasil Preview */}
        <section className="w-full lg:w-2/3 bg-white rounded-3xl shadow-sm border border-slate-100 p-6 min-h-[400px]">
          <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Preview Hasil & SEO Meta</h3>
          
          {isLoading ? (
             <div className="flex items-center justify-center h-64 text-slate-400">
               <p>AI Sedang Menulis...</p>
             </div>
          ) : htmlOutput ? (
             <div className="prose prose-sm max-w-none text-slate-700" dangerouslySetInnerHTML={{ __html: htmlOutput }} />
          ) : (
             <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
               Isi form di sebelah kiri lalu klik "Generate Content"
             </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}