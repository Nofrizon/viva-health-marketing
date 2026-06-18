'use client';
import { useState } from 'react';

const toneList = [
  { id: '1', name: 'Profesional' },
  { id: '2', name: 'Santai' },
  { id: '3', name: 'Inspiratif' },
  { id: '4', name: 'Humoris' },
  { id: '5', name: 'Edukatif' },
];

export default function WorkspacePage() {
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [selectedTone, setSelectedTone] = useState(toneList[0].name);
  const [platform, setPlatform] = useState('instagram');
  const [altTexts, setAltTexts] = useState<Record<string, string>>({ alt1: '', alt2: '', alt3: '' });
  const [currentAlt, setCurrentAlt] = useState('alt1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const generateCaption = async () => {
    if (!topic.trim() || !message.trim()) {
      setError('Silakan isi Topik dan Key Message terlebih dahulu');
      return;
    }
    setIsGenerating(true);
    setError('');
    setCopySuccess(false);
    try {
      const res = await fetch('/api/generate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          message: message.trim(),
          platform,
          tone: selectedTone,
          useEmoji: true,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal generate caption');
      }
      setAltTexts({
        alt1: json.alt1 || '',
        alt2: json.alt2 || '',
        alt3: json.alt3 || '',
      });
      setCurrentAlt('alt1');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan');
      setAltTexts({ alt1: '', alt2: '', alt3: '' });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyActiveCaption = async () => {
    const text = altTexts[currentAlt];
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      // fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const sendToScheduler = () => {
    alert('Fitur Scheduler akan segera hadir! Caption Anda sudah tersimpan.');
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Workspace Socmed</h1>
        <div className="w-full h-px bg-slate-300 mb-6"></div>
        <h2 className="text-xl font-bold text-blue-600">Caption Generator & Scheduler</h2>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-4">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Brief Konten</label>
            <input 
              type="text" 
              placeholder="Topik / Event / Trend" 
              value={topic} 
              onChange={e => setTopic(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && generateCaption()}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 text-slate-800" 
            />
            <textarea 
              rows={3} 
              placeholder="Key Message (Pesan Utama)" 
              value={message} 
              onChange={e => setMessage(e.target.value)} 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 text-slate-800" 
            />
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Platform</label>
              <select 
                value={platform}
                onChange={e => setPlatform(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none text-slate-800"
              >
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="facebook">Facebook</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Tone</label>
              <select 
                value={selectedTone}
                onChange={e => setSelectedTone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none text-slate-800"
              >
                {toneList.map(tone => (
                  <option key={tone.id} value={tone.name}>{tone.name}</option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm font-medium -mt-3">{error}</p>}
          
          <button 
            onClick={generateCaption} 
            disabled={isGenerating} 
            className="w-full bg-emerald-400 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-full transition-all flex justify-center items-center gap-2 disabled:opacity-60"
          >
            {isGenerating ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : null}
            {isGenerating ? 'Processing...' : 'Generate Alternatives'}
          </button>
        </div>

        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col h-full min-h-[400px] overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 p-4 flex gap-4">
              {['alt1', 'alt2', 'alt3'].map((alt) => (
                <button 
                  key={alt}
                  onClick={() => setCurrentAlt(alt)}
                  className={`text-sm font-bold pb-1 ${currentAlt === alt ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}
                >
                  {alt.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="p-6 flex-1">
              {isGenerating ? (
                <div className="flex items-center justify-center h-full min-h-[250px]">
                  <div className="flex flex-col items-center gap-3 text-slate-400">
                    <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm">AI sedang membuat caption...</p>
                  </div>
                </div>
              ) : (
                <textarea 
                  value={altTexts[currentAlt] || ''} 
                  onChange={e => setAltTexts({ ...altTexts, [currentAlt]: e.target.value })}
                  className="w-full h-full min-h-[250px] resize-none border-none focus:ring-0 text-slate-700 leading-relaxed bg-transparent"
                  placeholder="Silakan isi brief dan klik Generate untuk melihat hasil..." 
                />
              )}
            </div>
            <div className="bg-slate-50 border-t border-slate-100 p-4 flex justify-end gap-3 items-center">
              {copySuccess && <span className="text-emerald-600 text-xs font-medium">Tersalin!</span>}
              <button onClick={copyActiveCaption} className="px-5 py-2 border border-slate-200 text-slate-600 text-sm font-bold rounded-full hover:bg-slate-100 transition-colors">Copy</button>
              <button onClick={sendToScheduler} className="px-5 py-2 bg-slate-800 text-white text-sm font-bold rounded-full hover:bg-slate-900 transition-colors">Send to Scheduler</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
