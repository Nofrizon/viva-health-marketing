'use client';
import { useState } from 'react';

export default function ContentWriterPage() {
  const [focusKeyword, setFocusKeyword] = useState('');
  const [toneVoice, setToneVoice] = useState('Formal');
  const [htmlOutput, setHtmlOutput] = useState('');
  const [seoMeta, setSeoMeta] = useState<{ title: string; density: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const hasResult = !!htmlOutput;
  const wordCount = htmlOutput ? htmlOutput.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length : 0;

  const generate = async () => {
    if (!focusKeyword.trim()) {
      setError('Silakan masukkan Focus Keyword terlebih dahulu');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          focusKeyword: focusKeyword.trim(),
          toneVoice,
          contentType: 'Artikel Informatif',
          targetWords: '~1500 Kata',
          h2Count: 5,
          brandVoice: 'Profesional & Ahli',
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Gagal generate konten');
      }
      setHtmlOutput(json.htmlContent || '');
      setSeoMeta(json.seoMeta || null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan');
      setHtmlOutput('');
      setSeoMeta(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">AutoWrite SEO PRO</h1>
        <div className="w-full h-px bg-slate-300 mb-6"></div>
        <h2 className="text-xl font-bold text-blue-600">Generator Artikel E-E-A-T</h2>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <section className="w-full lg:w-1/3 bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Focus Keyword</label>
            <input 
              type="text" 
              value={focusKeyword} 
              onChange={e => setFocusKeyword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && generate()}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none text-slate-800" 
            />
          </div>
          <div>
             <label className="block text-sm font-bold text-slate-700 mb-2">Tone & Voice</label>
             <select 
               value={toneVoice}
               onChange={e => setToneVoice(e.target.value)}
               className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none text-slate-800"
             >
                <option value="Formal">Formal</option>
                <option value="Santai">Santai</option>
             </select>
          </div>

          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

          <button 
            onClick={generate} 
            disabled={isLoading} 
            className="w-full bg-emerald-400 hover:bg-emerald-500 text-white font-bold py-3.5 px-4 rounded-full transition-all mt-6 flex justify-center items-center gap-2 disabled:opacity-60"
          >
            {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : null}
            {isLoading ? 'Generating...' : 'Generate Content'}
          </button>
        </section>

        <section className="w-full lg:w-2/3 bg-white rounded-3xl shadow-sm border border-slate-100 p-6 min-h-[400px]">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
            <h3 className="text-lg font-bold text-slate-900">Preview Hasil & SEO Meta</h3>
            {hasResult && <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">{wordCount} Kata</span>}
          </div>
          
          {isLoading ? (
             <div className="flex items-center justify-center h-64 text-slate-400">
               <p>AI Sedang Menganalisis & Menulis...</p>
             </div>
          ) : hasResult && seoMeta ? (
             <div className="space-y-6">
               <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs font-bold text-slate-500 mb-1">Judul SEO</span>
                    <span className="text-sm font-medium text-blue-600">{seoMeta.title}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-500 mb-1">Keyword Density</span>
                    <span className="text-sm font-medium text-emerald-600">{seoMeta.density}%</span>
                  </div>
               </div>
               <div className="prose prose-sm max-w-none text-slate-700" dangerouslySetInnerHTML={{ __html: htmlOutput }} />
             </div>
          ) : (
             <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
               Isi form di sebelah kiri lalu klik "Generate Content"
             </div>
          )}
        </section>
      </div>
    </>
  )
}
