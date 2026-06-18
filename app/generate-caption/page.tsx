'use client';
import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

export default function WorkspacePage() {
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [altTexts, setAltTexts] = useState({ alt1: '' });
  const [isGenerating, setIsGenerating] = useState(false);

  const generateCaption = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setAltTexts({ alt1: '✨ Cek promo menarik dari Viva Health hari ini! Jangan sampai ketinggalan ya sobat sehat! #VivaHealth' });
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <DashboardLayout>
      {/* HEADER SELARAS */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Workspace Socmed</h1>
        <div className="w-full h-px bg-slate-300 mb-6"></div>
        <h2 className="text-xl font-bold text-blue-600">Caption Generator & Scheduler</h2>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* KOLOM KIRI (Briefing) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-4">1. Content Brief</label>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Topik / Event / Trend" 
                value={topic} 
                onChange={e => setTopic(e.target.value)} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" 
              />
              <textarea 
                rows={3} 
                placeholder="Key Message (Pesan Utama)" 
                value={message} 
                onChange={e => setMessage(e.target.value)} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" 
              />
            </div>
          </div>
          
          {/* TOMBOL EMERALD ROUNDED-FULL */}
          <button 
            onClick={generateCaption} 
            disabled={isGenerating} 
            className="w-full bg-emerald-400 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-full transition-all"
          >
            {isGenerating ? 'Processing...' : 'Generate Alternatives'}
          </button>
        </div>

        {/* KOLOM KANAN (Hasil Teks) */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col h-full min-h-[400px] overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 p-4">
              <span className="font-bold text-sm text-slate-700">Hasil Draft Caption</span>
            </div>
            <div className="p-6 flex-1">
              <textarea 
                value={altTexts.alt1} 
                onChange={e => setAltTexts({ alt1: e.target.value })}
                className="w-full h-full min-h-[250px] resize-none border-none focus:ring-0 text-slate-700 leading-relaxed bg-transparent"
                placeholder="Silakan isi brief dan klik Generate untuk melihat hasil..." 
              />
            </div>
            <div className="bg-slate-50 border-t border-slate-100 p-4 flex justify-end gap-3">
              <button className="px-5 py-2 border border-slate-200 text-slate-600 text-sm font-bold rounded-full hover:bg-slate-100">Copy</button>
              <button className="px-5 py-2 bg-slate-800 text-white text-sm font-bold rounded-full hover:bg-slate-900">Send to Scheduler</button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}