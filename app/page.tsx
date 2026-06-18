'use client';

import { useState, useEffect, useCallback } from 'react';

// ==================== TIPE DATA ====================
interface SettingItem {
  id: string;
  name: string;
  desc: string;
}

interface HashtagItem {
  tag: string;
  desc: string;
  campaign: string;
  platforms: string[];
}

interface Draft {
  id: string;
  platform: string;
  topic: string;
  text: string;
  date: string;
  time: string;
}

interface ScheduledPost {
  id: string;
  platform: string;
  topic: string;
  text: string;
  date: string;
  time: string;
  status: string;
}

interface CalendarEvent {
  date: string;
  name: string;
  msg: string;
}

// ==================== DATA STATIS ====================
const EVENTS_DB: Record<string, CalendarEvent[]> = {
  june: [
    { date: '06 Jun', name: 'Promo Payday Awal Bulan / Double Date 6.6', msg: 'Manfaatkan gratis ongkir dan diskon tebus murah produk kesehatan harian.' },
    { date: '14 Jun', name: 'Hari Donor Darah Sedunia', msg: 'Apresiasi pahlawan darah & info suplemen zat besi yang tepat pasca donor.' },
  ],
  july: [
    { date: '07 Jul', name: 'Promo Double Date 7.7', msg: 'Flash sale perlengkapan P3K rumah tangga & multivitamin.' },
  ],
};

const DEFAULT_CTA: SettingItem[] = [
  { id: '1', name: 'Klik link di bio', desc: 'Arahkan audiens untuk mengklik tautan yang ada di profil bio.' },
  { id: '2', name: 'Kunjungi apotek terdekat', desc: 'Arahkan audiens untuk melakukan kunjungan fisik ke outlet/cabang terdekat.' },
  { id: '3', name: 'Tanya di kolom komentar', desc: 'Minta audiens berinteraksi dengan bertanya langsung di kolom komentar postingan.' },
];
const DEFAULT_BRAND: SettingItem[] = [
  { id: '1', name: 'Edukatif & Profesional', desc: 'Gaya bahasa medis yang akurat, informatif, dan terpercaya.' },
  { id: '2', name: 'Empatik & Hangat', desc: 'Menunjukkan kepedulian yang tinggi layaknya keluarga sendiri.' },
  { id: '3', name: 'Asyik & Kekinian', desc: 'Gaya bahasa gaul yang mengikuti tren generasi milenial/Z.' },
];
const DEFAULT_TONE: SettingItem[] = [
  { id: '1', name: 'Santai / Friendly', desc: 'Bahasa santai, layaknya teman yang sedang mengobrol atau curhat.' },
  { id: '2', name: 'Serius / Berwibawa', desc: 'Penyampaian tegas, sangat cocok untuk peringatan dini atau info darurat.' },
  { id: '3', name: 'Antusias / Promo', desc: 'Penuh energi untuk menarik perhatian pada diskon atau kampanye baru.' },
];

export default function WorkspacePage() {
  // ==================== STATE ====================
  const [currentView, setCurrentView] = useState('generator');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentPlatform, setCurrentPlatform] = useState('instagram');
  const [currentAlt, setCurrentAlt] = useState('alt1');
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [hashtagsInput, setHashtagsInput] = useState('');
  const [greeting, setGreeting] = useState('Sobat Sehat');
  const [useEmoji, setUseEmoji] = useState(true);
  const [altTexts, setAltTexts] = useState({ alt1: '', alt2: '', alt3: '' });
  const [isGenerating, setIsGenerating] = useState(false);

  // Settings
  const [ctaList] = useState<SettingItem[]>(DEFAULT_CTA);
  const [brandList] = useState<SettingItem[]>(DEFAULT_BRAND);
  const [toneList] = useState<SettingItem[]>(DEFAULT_TONE);
  const [selectedCta, setSelectedCta] = useState(DEFAULT_CTA[0]?.name || '');
  const [selectedVoice, setSelectedVoice] = useState(DEFAULT_BRAND[0]?.name || '');
  const [selectedTone, setSelectedTone] = useState(DEFAULT_TONE[0]?.name || '');

  // Hashtag DB (local state)
  const [hashtagDB, setHashtagDB] = useState<HashtagItem[]>([]);
  const [hashtagForm, setHashtagForm] = useState({ tag: '', desc: '', campaign: '', platforms: [] as string[], editIndex: -1 });

  // Drafts & Scheduled (local state)
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [scheduled, setScheduled] = useState<ScheduledPost[]>([]);

  // Events
  const [eventMonth, setEventMonth] = useState('june');
  const events = EVENTS_DB[eventMonth] || [];

  // ==================== FUNCTIONS ====================
  const switchView = (view: string) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
  };

  const generateCaption = async () => {
    if (!topic.trim() || !message.trim()) {
      alert('Topik dan Key Message wajib diisi!');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: currentPlatform,
          topic,
          message,
          greeting,
          cta: selectedCta,
          brandVoice: selectedVoice,
          tone: selectedTone,
          useEmoji,
          hashtags: hashtagsInput,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAltTexts({ alt1: data.alt1, alt2: data.alt2, alt3: data.alt3 });
        setCurrentAlt('alt1');
      } else {
        alert('Error: ' + data.error);
      }
    } catch (err: any) {
      alert('Gagal generate: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const resetGenerator = () => {
    setTopic('');
    setMessage('');
    setHashtagsInput('');
    setGreeting('Sobat Sehat');
    setUseEmoji(true);
    setAltTexts({ alt1: '', alt2: '', alt3: '' });
  };

  const copyActiveCaption = () => {
    const text = altTexts[currentAlt as keyof typeof altTexts];
    if (!text) {
      alert('Belum ada caption untuk disalin.');
      return;
    }
    navigator.clipboard.writeText(text);
    alert('Caption disalin!');
  };

  const sendToScheduler = () => {
    const text = altTexts[currentAlt as keyof typeof altTexts];
    if (!text) {
      alert('Tidak ada teks untuk dikirim.');
      return;
    }
    const newDraft: Draft = {
      id: Date.now().toString(),
      platform: currentPlatform,
      topic: topic || 'No Topic',
      text,
      date: '',
      time: '',
    };
    setDrafts(prev => [...prev, newDraft]);
    alert('Berhasil dikirim ke Drafts Scheduler!');
    switchView('scheduler');
  };

  const approveDraft = (draftId: string) => {
    const draftIndex = drafts.findIndex(d => d.id === draftId);
    if (draftIndex === -1) return;
    const draft = drafts[draftIndex];
    if (!draft.date || !draft.time) {
      alert('Isi tanggal dan jam terlebih dahulu!');
      return;
    }
    const newScheduled: ScheduledPost = {
      ...draft,
      status: 'Approved',
    };
    setScheduled(prev => [...prev, newScheduled]);
    setDrafts(prev => prev.filter(d => d.id !== draftId));
  };

  const deleteDraft = (id: string) => setDrafts(prev => prev.filter(d => d.id !== id));
  const deleteScheduled = (id: string) => setScheduled(prev => prev.filter(p => p.id !== id));

  const updateDraftField = (id: string, field: string, value: string) => {
    setDrafts(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const useEventInGenerator = (eventName: string, eventMsg: string) => {
    setTopic(eventName);
    setMessage(eventMsg);
    switchView('generator');
  };

  const handleHashtagSave = () => {
    if (!hashtagForm.tag.trim()) {
      alert('Tag wajib diisi!');
      return;
    }
    if (hashtagForm.platforms.length === 0) {
      alert('Pilih minimal satu platform!');
      return;
    }
    if (hashtagForm.editIndex >= 0) {
      setHashtagDB(prev => prev.map((h, i) => i === hashtagForm.editIndex ? {
        tag: hashtagForm.tag,
        desc: hashtagForm.desc,
        campaign: hashtagForm.campaign,
        platforms: hashtagForm.platforms,
      } : h));
    } else {
      setHashtagDB(prev => [...prev, {
        tag: hashtagForm.tag,
        desc: hashtagForm.desc,
        campaign: hashtagForm.campaign,
        platforms: hashtagForm.platforms,
      }]);
    }
    setHashtagForm({ tag: '', desc: '', campaign: '', platforms: [], editIndex: -1 });
  };

  const editHashtag = (index: number) => {
    const h = hashtagDB[index];
    setHashtagForm({ tag: h.tag, desc: h.desc, campaign: h.campaign, platforms: h.platforms, editIndex: index });
  };

  const deleteHashtag = (index: number) => {
    if (confirm('Hapus hashtag ini?')) {
      setHashtagDB(prev => prev.filter((_, i) => i !== index));
    }
  };

  const useSelectedHashtags = () => {
    // For simplicity, we'll just alert to remind the UI is not yet connected to checkboxes (you can add checkboxes state)
    alert('Silakan gunakan input hashtag manual atau pilih dari database (fitur seleksi multiple akan disempurnakan).');
  };

  // ==================== RENDER HELPERS ====================
  const characterLimit = currentPlatform === 'facebook' ? 5000 : 2200;
  const activeText = altTexts[currentAlt as keyof typeof altTexts];
  const charsLeft = characterLimit - activeText.length;

  const pageTitles: Record<string, string> = {
    generator: 'Generator AI',
    scheduler: 'Post Scheduler',
    insights: 'Event Insight',
    hashtag: 'Hashtag Management',
    cta: 'CTA Setting',
    brand: 'Brand Voice Setting',
    tone: 'Tone Setting',
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans text-slate-700">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-white shadow-sm z-50 flex justify-between items-center px-4 py-3 border-b border-slate-200">
        <div className="flex items-center gap-2 font-bold text-lg text-slate-800">
          <i className="fa-solid fa-pills text-emerald-600" /> VivaSocial Pro
        </div>
        <button onClick={() => setMobileMenuOpen(true)} className="text-slate-600">
          <i className="fa-solid fa-bars text-xl" />
        </button>
      </div>
      {mobileMenuOpen && <div className="fixed inset-0 bg-slate-900/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />}

      {/* Sidebar */}
      <aside className={`w-64 bg-white border-r border-slate-200 flex flex-col h-full fixed md:relative z-50 transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 shadow-lg md:shadow-none`}>
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
            <i className="fa-solid fa-layer-group text-xl" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight text-slate-800">VivaSocial</h1>
            <p className="text-xs text-slate-500 font-medium tracking-wide">WORKSPACE</p>
          </div>
        </div>
        <nav className="flex-1 py-4 flex flex-col gap-1 overflow-y-auto">
          <span className="px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Features</span>
          {['generator', 'scheduler', 'insights', 'hashtag'].map(view => (
            <button key={view} onClick={() => switchView(view)}
              className={`sidebar-link text-left px-5 py-3 text-sm flex items-center gap-3 w-full ${currentView === view ? 'active bg-emerald-50 text-emerald-600 border-r-2 border-emerald-600 font-semibold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
            >
              <i className={`fa-solid ${view === 'generator' ? 'fa-pen-nib' : view === 'scheduler' ? 'fa-calendar-check' : view === 'insights' ? 'fa-lightbulb' : 'fa-hashtag'} w-5 text-center`} />
              {view === 'generator' ? 'Generator AI' : view === 'scheduler' ? 'Post Scheduler' : view === 'insights' ? 'Event Insight' : 'Hashtag Management'}
            </button>
          ))}
          <span className="px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-4">Settings</span>
          {['cta', 'brand', 'tone'].map(view => (
            <button key={view} onClick={() => switchView(view)}
              className={`sidebar-link text-left px-5 py-3 text-sm flex items-center gap-3 w-full ${currentView === view ? 'active bg-emerald-50 text-emerald-600 border-r-2 border-emerald-600 font-semibold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
            >
              <i className={`fa-solid ${view === 'cta' ? 'fa-bullhorn' : view === 'brand' ? 'fa-copyright' : 'fa-masks-theater'} w-5 text-center`} />
              {view === 'cta' ? 'CTA Setting' : view === 'brand' ? 'Brand Voice' : 'Tone Setting'}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden pt-14 md:pt-0">
        <header className="bg-white border-b border-slate-100 px-6 py-4 flex justify-between items-center shrink-0 shadow-sm">
          <h2 className="font-bold text-lg text-slate-800">{pageTitles[currentView]}</h2>
          <span className="text-slate-500 text-sm"><i className="fa-regular fa-calendar-days mr-1" /> {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:px-8 bg-gray-50">
          {/* ===== GENERATOR VIEW ===== */}
          {currentView === 'generator' && (
            <div className="grid lg:grid-cols-12 gap-6 animate-fadeIn">
              <div className="lg:col-span-5 flex flex-col gap-5">
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">1. Platform Target</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['instagram', 'tiktok', 'facebook'].map(p => (
                      <button key={p} onClick={() => setCurrentPlatform(p)}
                        className={`platform-btn rounded-lg py-2 flex flex-col items-center gap-1 text-sm ${currentPlatform === p ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                      >
                        <i className={`fa-brands fa-${p === 'instagram' ? 'instagram' : p === 'tiktok' ? 'tiktok' : 'facebook-f'} text-lg`} />
                        <span>{p.charAt(0).toUpperCase() + p.slice(1)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-4 shadow-sm">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">2. Content Brief</label>
                  <input type="text" placeholder="Topik / Event / Trend" value={topic} onChange={e => setTopic(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm" />
                  <textarea rows={2} placeholder="Key Message (Pesan Utama)" value={message} onChange={e => setMessage(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm" />
                  <input type="text" placeholder="#Tambahkan #Hashtag" value={hashtagsInput} onChange={e => setHashtagsInput(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm text-indigo-600 font-mono" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="Sapaan Audiens" value={greeting} onChange={e => setGreeting(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2 text-sm" />
                    <select value={selectedCta} onChange={e => setSelectedCta(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2 text-sm bg-white">
                      {ctaList.map(cta => <option key={cta.id} value={cta.name}>{cta.name}</option>)}
                    </select>
                    <select value={selectedVoice} onChange={e => setSelectedVoice(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2 text-sm bg-white">
                      {brandList.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                    </select>
                    <select value={selectedTone} onChange={e => setSelectedTone(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2 text-sm bg-white">
                      {toneList.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                    </select>
                    <label className="col-span-2 flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={useEmoji} onChange={e => setUseEmoji(e.target.checked)} className="w-4 h-4 text-emerald-600 rounded" /> Gunakan Emoji
                    </label>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={generateCaption} disabled={isGenerating} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3.5 rounded-xl shadow-sm flex items-center justify-center gap-2 disabled:opacity-70">
                    {isGenerating ? <i className="fa-solid fa-circle-notch fa-spin" /> : <i className="fa-solid fa-wand-magic-sparkles" />}
                    {isGenerating ? 'Processing...' : 'Generate 3 Alternatives'}
                  </button>
                  <button onClick={resetGenerator} className="px-5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-medium py-3.5 rounded-xl"><i className="fa-solid fa-rotate-right" /></button>
                </div>
              </div>

              <div className="lg:col-span-7 flex flex-col gap-5">
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col h-full min-h-[550px]">
                  <div className="border-b border-slate-100 px-5 pt-4 flex gap-4 bg-slate-50 rounded-t-xl">
                    {['alt1', 'alt2', 'alt3'].map(alt => (
                      <button key={alt} onClick={() => setCurrentAlt(alt)}
                        className={`alt-tab pb-3 px-2 text-sm font-medium ${currentAlt === alt ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-slate-500'}`}
                      >Alternatif {alt.slice(-1)}</button>
                    ))}
                  </div>
                  <div className="p-6 flex-1">
                    {['alt1', 'alt2', 'alt3'].map(alt => (
                      <textarea key={alt} value={altTexts[alt as keyof typeof altTexts]} onChange={e => setAltTexts(prev => ({ ...prev, [alt]: e.target.value }))}
                        className={`w-full h-full min-h-[300px] resize-none border-none focus:ring-0 text-slate-700 leading-relaxed bg-transparent ${currentAlt === alt ? '' : 'hidden'}`}
                        placeholder="Silakan isi brief dan klik Generate..." />
                    ))}
                  </div>
                  <div className="border-t border-slate-100 bg-slate-50 p-4 rounded-b-xl flex justify-between items-center">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${charsLeft < 0 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                      <i className="fa-solid fa-keyboard mr-1" /> Characters left: {charsLeft} / {characterLimit}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={copyActiveCaption} className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50"><i className="fa-regular fa-copy mr-1" /> Copy</button>
                      <button onClick={sendToScheduler} className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700"><i className="fa-solid fa-share-from-square mr-1" /> Send to Scheduler</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== SCHEDULER VIEW ===== */}
          {currentView === 'scheduler' && (
            <div className="grid lg:grid-cols-2 gap-6 h-full animate-fadeIn">
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col max-h-[800px]">
                <div className="p-5 border-b bg-slate-50 rounded-t-xl flex justify-between items-center">
                  <h3 className="font-bold text-slate-800"><i className="fa-solid fa-file-pen text-orange-500 mr-2" />Drafts</h3>
                  <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2 py-1 rounded-full">{drafts.length} Item</span>
                </div>
                <div className="p-5 flex-1 overflow-y-auto space-y-4">
                  {drafts.length === 0 ? <div className="text-center text-slate-400 text-sm mt-10 italic">Tidak ada draft.</div> : drafts.map((draft, idx) => (
                    <div key={draft.id} className="border border-slate-200 p-4 rounded-lg bg-white shadow-sm flex flex-col gap-3">
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="font-semibold text-sm"><i className={`fa-brands fa-${draft.platform} mr-1`} /> {draft.topic}</span>
                        <button onClick={() => deleteDraft(draft.id)} className="text-red-400 hover:text-red-600"><i className="fa-solid fa-trash" /></button>
                      </div>
                      <textarea className="w-full text-sm border border-slate-200 rounded p-2 h-24" value={draft.text} onChange={e => updateDraftField(draft.id, 'text', e.target.value)} />
                      <div className="flex flex-wrap gap-2 items-end">
                        <input type="date" className="border border-slate-300 rounded p-1.5 text-xs flex-1 min-w-[120px]" value={draft.date} onChange={e => updateDraftField(draft.id, 'date', e.target.value)} />
                        <input type="time" className="border border-slate-300 rounded p-1.5 text-xs w-24" value={draft.time} onChange={e => updateDraftField(draft.id, 'time', e.target.value)} />
                        <button onClick={() => approveDraft(draft.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 px-4 rounded">Approve</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col max-h-[800px]">
                <div className="p-5 border-b bg-slate-50 rounded-t-xl">
                  <h3 className="font-bold text-slate-800"><i className="fa-solid fa-list-check text-emerald-600 mr-2" />Upcoming Posts</h3>
                </div>
                <div className="p-5 flex-1 overflow-y-auto space-y-3">
                  {scheduled.length === 0 ? <div className="text-center text-slate-400 text-sm mt-10 italic">Belum ada post dijadwalkan.</div> : scheduled.map(post => (
                    <div key={post.id} className="p-3 border border-slate-200 rounded-lg flex items-start gap-3 bg-white hover:bg-slate-50 relative group">
                      <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100 text-center min-w-[60px]">
                        <div className="text-[10px] text-emerald-600 font-bold uppercase">DATE</div>
                        <div className="text-sm font-bold text-emerald-700">{post.date || '?'}</div>
                        <div className="text-[11px] font-medium text-emerald-600 mt-1"><i className="fa-regular fa-clock" /> {post.time || '00:00'}</div>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <h4 className="text-sm font-bold text-slate-800">{post.topic}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{post.text}</p>
                        <span className="text-[10px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full mt-1 inline-block">✅ {post.status}</span>
                      </div>
                      <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 flex gap-1.5 transition">
                        <button onClick={() => deleteScheduled(post.id)} className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 px-2.5 py-1.5 rounded text-xs"><i className="fa-solid fa-trash" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===== EVENT INSIGHT VIEW ===== */}
          {currentView === 'insights' && (
            <div className="animate-fadeIn">
              <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 flex flex-wrap items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-800"><i className="fa-solid fa-calendar-star text-blue-600 mr-2" />Monthly Event Insight</h2>
                  <p className="text-xs text-slate-500 mt-1">Jelajahi momen tahunan, hari nasional, atau event spesial.</p>
                </div>
                <select value={eventMonth} onChange={e => setEventMonth(e.target.value)} className="border border-slate-200 rounded-lg p-2 text-sm min-w-[150px]">
                  <option value="june">Juni 2026</option>
                  <option value="july">Juli 2026</option>
                </select>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b text-xs uppercase text-slate-500">
                      <th className="p-4 font-semibold w-24">Tanggal</th>
                      <th className="p-4 font-semibold w-64">Nama Event</th>
                      <th className="p-4 font-semibold">Key Message</th>
                      <th className="p-4 font-semibold w-32 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-slate-700 divide-y divide-slate-50">
                    {events.map((ev, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="p-4 font-semibold">{ev.date}</td>
                        <td className="p-4 font-bold text-blue-700">{ev.name}</td>
                        <td className="p-4">{ev.msg}</td>
                        <td className="p-4 text-center">
                          <button onClick={() => useEventInGenerator(ev.name, ev.msg)} className="bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 text-[11px] font-bold px-3 py-1.5 rounded">
                            <i className="fa-solid fa-arrow-up-right-from-square mr-1" /> Use
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===== HASHTAG MANAGEMENT VIEW ===== */}
          {currentView === 'hashtag' && (
            <div className="animate-fadeIn">
              <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
                <h2 className="text-lg font-bold"><i className="fa-solid fa-hashtag text-indigo-500 mr-2" />Hashtag Management</h2>
                <p className="text-xs text-slate-500 mt-1">Kelola database hashtag. Gunakan di Generator.</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl">
                <div className="p-4 border-b bg-slate-50 font-bold flex justify-between items-center">
                  <span><i className="fa-solid fa-database text-indigo-600 mr-2" />Database Hashtag</span>
                  <button onClick={useSelectedHashtags} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] px-3 py-1.5 rounded">Use Selected</button>
                </div>
                <div className="p-4 border-b bg-slate-50/30 space-y-3">
                  <input type="hidden" value={hashtagForm.editIndex} />
                  <input type="text" placeholder="#ContohHashtag" value={hashtagForm.tag} onChange={e => setHashtagForm(prev => ({ ...prev, tag: e.target.value }))} className="w-full border border-slate-200 rounded p-2 text-sm" />
                  <input type="text" placeholder="Deskripsi" value={hashtagForm.desc} onChange={e => setHashtagForm(prev => ({ ...prev, desc: e.target.value }))} className="w-full border border-slate-200 rounded p-2 text-sm" />
                  <input type="text" placeholder="Nama Campaign" value={hashtagForm.campaign} onChange={e => setHashtagForm(prev => ({ ...prev, campaign: e.target.value }))} className="w-full border border-slate-200 rounded p-2 text-sm" />
                  <div className="flex flex-wrap gap-4">
                    {['instagram', 'tiktok', 'facebook'].map(p => (
                      <label key={p} className="flex items-center gap-1.5 text-sm">
                        <input type="checkbox" checked={hashtagForm.platforms.includes(p)} onChange={e => {
                          if (e.target.checked) setHashtagForm(prev => ({ ...prev, platforms: [...prev.platforms, p] }));
                          else setHashtagForm(prev => ({ ...prev, platforms: prev.platforms.filter(x => x !== p) }));
                        }} className="w-4 h-4 text-emerald-600 rounded" /> {p}
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleHashtagSave} className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded text-sm font-medium flex-1">
                      {hashtagForm.editIndex >= 0 ? 'Update' : 'Tambah'} Hashtag
                    </button>
                    {hashtagForm.editIndex >= 0 && (
                      <button onClick={() => setHashtagForm({ tag: '', desc: '', campaign: '', platforms: [], editIndex: -1 })} className="border border-slate-200 text-slate-600 px-4 py-2 rounded text-sm hover:bg-slate-50">Batal</button>
                    )}
                  </div>
                </div>
                <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
                  {hashtagDB.length === 0 ? <div className="text-center text-slate-400 text-sm mt-6 italic">Belum ada hashtag.</div> : hashtagDB.map((h, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                      <div>
                        <span className="text-sm font-bold text-indigo-600 font-mono">{h.tag}</span>
                        <p className="text-[11px] text-slate-500">{h.desc || '-'}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">Campaign: {h.campaign || '-'}</span>
                          {h.platforms.map(p => <span key={p} className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{p}</span>)}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => editHashtag(i)} className="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-1.5 rounded"><i className="fa-solid fa-pen text-xs" /></button>
                        <button onClick={() => deleteHashtag(i)} className="text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 p-1.5 rounded"><i className="fa-solid fa-trash text-xs" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===== SETTINGS VIEWS (static) ===== */}
          {['cta', 'brand', 'tone'].map(type => {
            const list = type === 'cta' ? ctaList : type === 'brand' ? brandList : toneList;
            const title = type === 'cta' ? 'Call to Action (CTA)' : type === 'brand' ? 'Brand Voice' : 'Tone Penyampaian';
            if (currentView !== type) return null;
            return (
              <div key={type} className="bg-white border border-slate-200 rounded-xl p-6 max-w-3xl animate-fadeIn">
                <h2 className="text-lg font-bold text-slate-800 mb-4"><i className={`fa-solid ${type === 'cta' ? 'fa-bullhorn' : type === 'brand' ? 'fa-copyright' : 'fa-masks-theater'} text-emerald-600 mr-2`} />Customize {title}</h2>
                <div className="space-y-3">
                  {list.map(item => (
                    <div key={item.id} className="flex justify-between items-start p-4 border border-slate-100 rounded-lg bg-white shadow-sm">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{item.name}</h4>
                        <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                      </div>
                      <button className="text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded" onClick={() => alert('Fitur edit/delete settings akan datang.')}><i className="fa-solid fa-trash" /></button>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex flex-col gap-3 bg-slate-50 p-4 border border-slate-100 rounded-lg">
                  <input type="text" placeholder={`Nama ${title}`} className="w-full border border-slate-200 rounded-lg p-2 text-sm" />
                  <textarea rows={2} placeholder="Deskripsi" className="w-full border border-slate-200 rounded-lg p-2 text-sm" />
                  <div className="flex justify-end">
                    <button onClick={() => alert('Coming soon')} className="bg-slate-800 text-white px-5 py-2 rounded-lg text-sm">Tambah</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}