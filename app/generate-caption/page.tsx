'use client';

import { useState } from 'react';

export default function GenerateCaptionPage() {
  const [platform, setPlatform] = useState('instagram');
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [greeting, setGreeting] = useState('Sobat Sehat');
  const [cta, setCta] = useState('Klik link di bio');
  const [brandVoice, setBrandVoice] = useState('Edukatif & Profesional');
  const [tone, setTone] = useState('Santai / Friendly');
  const [useEmoji, setUseEmoji] = useState(true);
  const [alts, setAlts] = useState({ alt1: '', alt2: '', alt3: '' });
  const [activeAlt, setActiveAlt] = useState('alt1');
  const [loading, setLoading] = useState(false);

  const characterLimit = platform === 'facebook' ? 5000 : 2200;
  const activeText = alts[activeAlt as keyof typeof alts];
  const charsLeft = characterLimit - activeText.length;

  const generate = async () => {
    if (!topic.trim() || !message.trim()) return alert('Topik dan Key Message wajib diisi!');
    setLoading(true);
    try {
      const res = await fetch('/api/generate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          topic,
          message,
          greeting,
          cta,
          brandVoice,
          tone,
          useEmoji,
          hashtags,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAlts({ alt1: data.alt1, alt2: data.alt2, alt3: data.alt3 });
        setActiveAlt('alt1');
      } else {
        alert('Error: ' + data.error);
      }
    } catch (e: any) {
      alert('Gagal: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setTopic('');
    setMessage('');
    setHashtags('');
    setGreeting('Sobat Sehat');
    setUseEmoji(true);
    setAlts({ alt1: '', alt2: '', alt3: '' });
  };

  const copy = () => {
    navigator.clipboard.writeText(activeText);
    alert('Caption disalin!');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-6">
        {/* Form Input */}
        <div className="lg:col-span-5 space-y-5">
          {/* Platform */}
          <div className="bg-white rounded-xl p-5 border shadow-sm">
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Platform</h3>
            <div className="grid grid-cols-3 gap-2">
              {['instagram', 'tiktok', 'facebook'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`py-2 rounded-lg text-sm font-medium border ${platform === p ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl p-5 border shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase">Content Brief</h3>
            <input type="text" placeholder="Topik / Event" value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full border rounded-lg p-2.5 text-sm" />
            <textarea rows={2} placeholder="Key Message" value={message} onChange={(e) => setMessage(e.target.value)} className="w-full border rounded-lg p-2.5 text-sm" />
            <input type="text" placeholder="#Hashtag" value={hashtags} onChange={(e) => setHashtags(e.target.value)} className="w-full border rounded-lg p-2.5 text-sm font-mono text-indigo-600" />
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="Sapaan Audiens" value={greeting} onChange={(e) => setGreeting(e.target.value)} className="border rounded-lg p-2 text-sm" />
              <select value={cta} onChange={(e) => setCta(e.target.value)} className="border rounded-lg p-2 text-sm">
                <option>Klik link di bio</option>
                <option>Kunjungi apotek terdekat</option>
                <option>Tanya di kolom komentar</option>
              </select>
              <select value={brandVoice} onChange={(e) => setBrandVoice(e.target.value)} className="border rounded-lg p-2 text-sm">
                <option>Edukatif & Profesional</option>
                <option>Empatik & Hangat</option>
                <option>Asyik & Kekinian</option>
              </select>
              <select value={tone} onChange={(e) => setTone(e.target.value)} className="border rounded-lg p-2 text-sm">
                <option>Santai / Friendly</option>
                <option>Serius / Berwibawa</option>
                <option>Antusias / Promo</option>
              </select>
              <label className="col-span-2 flex items-center gap-2 text-sm">
                <input type="checkbox" checked={useEmoji} onChange={(e) => setUseEmoji(e.target.checked)} className="w-4 h-4 text-emerald-600 rounded" /> Gunakan Emoji
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={generate} disabled={loading} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-70">
              {loading ? 'Processing...' : '✨ Generate 3 Alternatif'}
            </button>
            <button onClick={reset} className="px-5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl">↺</button>
          </div>
        </div>

        {/* Output */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-xl border shadow-sm flex flex-col min-h-[500px]">
            <div className="border-b px-5 pt-4 flex gap-4 bg-gray-50 rounded-t-xl">
              {['alt1', 'alt2', 'alt3'].map((alt) => (
                <button key={alt} onClick={() => setActiveAlt(alt)} className={`pb-3 px-2 text-sm font-medium ${activeAlt === alt ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-500'}`}>
                  Alternatif {alt.slice(-1)}
                </button>
              ))}
            </div>
            <div className="p-6 flex-1">
              {['alt1', 'alt2', 'alt3'].map((alt) => (
                <textarea
                  key={alt}
                  value={alts[alt as keyof typeof alts]}
                  onChange={(e) => setAlts((prev) => ({ ...prev, [alt]: e.target.value }))}
                  className={`w-full h-full min-h-[300px] resize-none border-none focus:ring-0 bg-transparent ${activeAlt === alt ? '' : 'hidden'}`}
                  placeholder="Caption akan muncul di sini..."
                />
              ))}
            </div>
            <div className="border-t bg-gray-50 p-4 rounded-b-xl flex justify-between items-center">
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${charsLeft < 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                Sisa karakter: {charsLeft} / {characterLimit}
              </span>
              <button onClick={copy} className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">📋 Copy</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}