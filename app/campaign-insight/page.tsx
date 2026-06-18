'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  CalendarDays,
  Search,
  RefreshCw,
  Lightbulb,
  Copy,
  Sparkles,
  ChevronRight,
  Save,
  Target,
  FileText,
  Trash2,
  Plus,
  X,
  CheckCircle2,
} from 'lucide-react';

// ===== TYPES =====
interface TrendItem {
  query: string;
  value: string;
  formattedValue: string;
  extracted_value: number;
  hasData: boolean;
  link: string;
  articles?: any[];
}

interface CalendarEvent {
  name: string;
  date: string;
  type: string;
  description: string;
  isHoliday: boolean;
}

interface CampaignInsightData {
  keyword: string;
  timeRange: string;
  trends: TrendItem[];
  events: CalendarEvent[];
}

interface CampaignPlan {
  id: number;
  name: string;
  description: string;
  goal: string;
  campaign_month: number;
  campaign_year: number;
  selected_keyword: string | null;
  selected_event_name: string | null;
  selected_event_date: string | null;
  generated_ideas: any;
  created_at: string;
}

// ===== HELPER FUNCTIONS =====
function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
    ];
    return `${d.getDate()} ${months[d.getMonth()]}`;
  } catch {
    return dateStr;
  }
}

function getHeatClass(index: number) {
  if (index < 3) return { bg: 'bg-red-50 border-red-200', badge: 'bg-red-100 text-red-700', rank: 'text-red-500', label: 'HIGH' };
  if (index < 6) return { bg: 'bg-orange-50 border-orange-200', badge: 'bg-orange-100 text-orange-700', rank: 'text-orange-500', label: 'MEDIUM' };
  if (index < 9) return { bg: 'bg-yellow-50 border-yellow-200', badge: 'bg-yellow-100 text-yellow-700', rank: 'text-yellow-500', label: 'RISING' };
  return { bg: 'bg-blue-50 border-blue-100', badge: 'bg-blue-100 text-blue-700', rank: 'text-blue-400', label: 'NEW' };
}

function getEventTypeColor(type: string) {
  if (type?.toLowerCase().includes('nasional') || type?.toLowerCase().includes('libur')) {
    return { bg: 'bg-red-100', text: 'text-red-700', label: 'NASIONAL' };
  }
  if (type?.toLowerCase().includes('kesehatan') || type?.toLowerCase().includes('health')) {
    return { bg: 'bg-green-100', text: 'text-green-700', label: 'KESEHATAN' };
  }
  if (type?.toLowerCase().includes('musim') || type?.toLowerCase().includes('seasonal')) {
    return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'MUSIMAN' };
  }
  return { bg: 'bg-purple-100', text: 'text-purple-700', label: 'PERINGATAN' };
}

function generateCampaignIdeas(event?: CalendarEvent, trend?: TrendItem, plan?: { name: string; description: string; goal: string }) {
  const eventName = event?.name || '';
  const trendName = trend?.query || 'tren terkini';
  const campaignName = plan?.name || 'Campaign Sehat';
  const campaignGoal = plan?.goal || 'meningkatkan brand awareness';
  const campaignDesc = plan?.description || '';

  const ideas = [];

  if (eventName) {
    ideas.push({
      title: `📢 "${eventName} - ${campaignName}"`,
      desc: `Gabungkan momentum ${eventName} dengan campaign "${campaignName}". ${campaignDesc || `Fokus pada edukasi ${trendName} yang relevan dengan ${eventName.toLowerCase()}.`}`,
      cta: `Posting Instagram & TikTok: "Rayakan ${eventName} dengan ${campaignName}"`,
      platform: '📱 Instagram + TikTok',
    });
  }

  ideas.push({
    title: `🎯 Tren "${trendName}" x ${campaignName}`,
    desc: `Manfaatkan tren "${trendName}" yang sedang naik untuk campaign "${campaignName}". Buat konten yang menghubungkan ${trendName} dengan goal: ${campaignGoal}.`,
    cta: `Buat konten interaktif seputar ${trendName} dengan hashtag campaign`,
    platform: '📱 Instagram + TikTok',
  });

  ideas.push({
    title: `💡 Brand Awareness ${campaignName}`,
    desc: `Strategi konten untuk mencapai "${campaignGoal}". Gunakan storytelling dan testimoni untuk membangun kepercayaan audiens. Integrasikan keyword "${trendName}" dalam konten.`,
    cta: `Landing page khusus campaign + WhatsApp blast`,
    platform: '🌐 Website + WhatsApp',
  });

  ideas.push({
    title: `🎓 Edukasi Interaktif ${campaignName}`,
    desc: `Selenggarakan webinar atau live streaming edukasi seputar ${trendName} dalam rangka campaign "${campaignName}". Hadirkan ahli untuk meningkatkan kredibilitas.`,
    cta: `Live TikTok/Instagram dengan sesi tanya jawab interaktif`,
    platform: '🎵 Live Streaming',
  });

  const insight = eventName
    ? `Momentum ${eventName} bisa dikombinasikan dengan tren "${trendName}" yang sedang naik untuk campaign "${campaignName}". Fokus pada goal "${campaignGoal}" dengan pendekatan edukatif dan emotional connection.`
    : `Tren "${trendName}" dapat menjadi kunci sukses campaign "${campaignName}". Dengan goal "${campaignGoal}", fokus pada konten yang engaging dan relevan.`;

  return {
    eventName: eventName || trendName,
    trendName,
    campaignName,
    ideas,
    insight,
  };
}

// ===== MONTHS =====
const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

// ===== COMPONENT =====
export default function CampaignInsightPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CampaignInsightData | null>(null);

  // Selection state
  const [selectedKeyword, setSelectedKeyword] = useState<TrendItem | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Campaign Planner state
  const [campaignName, setCampaignName] = useState('');
  const [campaignDesc, setCampaignDesc] = useState('');
  const [campaignGoal, setCampaignGoal] = useState('');
  const [campaignMonth, setCampaignMonth] = useState(new Date().getMonth() + 1);
  const [campaignYear, setCampaignYear] = useState(new Date().getFullYear());

  // Generated ideas
  const [generatedIdeas, setGeneratedIdeas] = useState<any>(null);
  const [generating, setGenerating] = useState(false);

  // Saved plans
  const [savedPlans, setSavedPlans] = useState<CampaignPlan[]>([]);
  const [saving, setSaving] = useState(false);
  const [showPlanner, setShowPlanner] = useState(false);

  // Notification
  const [notification, setNotification] = useState('');

  // ===== FETCH TRENDS & EVENTS =====
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/campaign-insight');
      const json = await res.json();
      setData(json);
    } catch {
      showNotification('Gagal mengambil data. Coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== FETCH SAVED PLANS =====
  const fetchSavedPlans = useCallback(async () => {
    try {
      const res = await fetch('/api/campaign-planner');
      const json = await res.json();
      setSavedPlans(json.plans || []);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchSavedPlans();
  }, [fetchData, fetchSavedPlans]);

  // ===== ANALYZE CAMPAIGN =====
  const handleAnalyze = () => {
    if (!selectedKeyword && !selectedEvent) {
      showNotification('Pilih minimal keyword trend atau event kalender!');
      return;
    }

    setGenerating(true);
    setTimeout(() => {
      const ideas = generateCampaignIdeas(
        selectedEvent || undefined,
        selectedKeyword || undefined,
        { name: campaignName, description: campaignDesc, goal: campaignGoal }
      );
      setGeneratedIdeas(ideas);
      setGenerating(false);
      showNotification('Insight campaign berhasil digenerate!');
    }, 800);
  };

  // ===== SAVE CAMPAIGN PLAN =====
  const handleSavePlan = async () => {
    if (!generatedIdeas) {
      showNotification('Generate insight dulu sebelum menyimpan!');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/campaign-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: campaignName || `Campaign ${selectedKeyword?.query || selectedEvent?.name || 'Baru'}`,
          description: campaignDesc,
          goal: campaignGoal,
          campaign_month: campaignMonth,
          campaign_year: campaignYear,
          selected_keyword: selectedKeyword?.query || null,
          selected_event_name: selectedEvent?.name || null,
          selected_event_date: selectedEvent?.date || null,
          generated_ideas: generatedIdeas,
        }),
      });
      const json = await res.json();
      if (json.plan) {
        setSavedPlans((prev) => [json.plan, ...prev]);
        showNotification('Campaign plan berhasil disimpan! ✅');
      }
    } catch {
      showNotification('Gagal menyimpan campaign plan.');
    } finally {
      setSaving(false);
    }
  };

  // ===== DELETE PLAN =====
  const handleDeletePlan = async (id: number) => {
    try {
      await fetch(`/api/campaign-planner?id=${id}`, { method: 'DELETE' });
      setSavedPlans((prev) => prev.filter((p) => p.id !== id));
      showNotification('Campaign plan dihapus.');
    } catch {
      showNotification('Gagal menghapus campaign plan.');
    }
  };

  // ===== COPY BRIEF =====
  const handleCopyBrief = () => {
    if (!generatedIdeas) return;
    const brief = generatedIdeas.ideas
      .map(
        (idea: any) =>
          `**${idea.title}**\n${idea.desc}\nCTA: ${idea.cta}\nPlatform: ${idea.platform}`
      )
      .join('\n\n');
    navigator.clipboard.writeText(brief);
    showNotification('Brief campaign disalin ke clipboard!');
  };

  // ===== NOTIFICATION =====
  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const trends = data?.trends || [];
  const events = data?.events || [];

  const years = [];
  for (let y = 2024; y <= 2030; y++) years.push(y);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Campaign Insight</h1>
          <p className="text-sm text-slate-500 mt-1">
            Radar tren Google Trends & kalender event untuk ide campaign
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-green-700">LIVE</span>
          </div>
          <span className="text-xs text-slate-500">
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>

      <div className="w-full h-px bg-slate-200" />

      {/* Main Grid: 3 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUMN 1: Trending Queries */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                <TrendingUp size={18} className="text-red-500" />
                Trending Google Indonesia
              </h2>
              <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full font-semibold">
                🔥 {trends.length} topik
              </span>
            </div>

            {loading ? (
              <div className="p-8 flex flex-col items-center justify-center gap-3">
                <RefreshCw size={32} className="text-slate-300 animate-spin" />
                <p className="text-sm text-slate-400">Mengambil data tren...</p>
              </div>
            ) : trends.length === 0 ? (
              <div className="p-8 text-center">
                <TrendingUp size={48} className="text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-400">Tidak ada data tren</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto">
                {trends.map((item, index) => {
                  const heat = getHeatClass(index);
                  const isSelected = selectedKeyword?.query === item.query;
                  return (
                    <div
                      key={index}
                      onClick={() =>
                        setSelectedKeyword(
                          isSelected ? null : item
                        )
                      }
                      className={`trend-item flex items-center justify-between px-4 py-2.5 cursor-pointer transition hover:bg-slate-50 ${
                        isSelected
                          ? 'bg-cyan-50 border-l-4 border-l-cyan-500 ring-1 ring-cyan-200'
                          : 'border-l-4 border-l-transparent'
                      }`}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className={`text-sm font-extrabold ${heat.rank} w-7 shrink-0`}>
                          #{index + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 text-xs truncate">
                            {item.query}
                          </p>
                          {item.articles && item.articles.length > 0 && (
                            <p className="text-[10px] text-slate-400">
                              {item.articles.length} artikel
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0 ml-2 flex items-center gap-1.5">
                        {item.formattedValue !== 'N/A' && (
                          <span className="text-[10px] text-slate-500">{item.formattedValue}</span>
                        )}
                        {isSelected && (
                          <CheckCircle2 size={16} className="text-cyan-500" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 2: Calendar Events */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                <CalendarDays size={18} className="text-purple-500" />
                Kalender Event & Campaign
              </h2>
              <span className="text-xs text-slate-400">{events.length} event</span>
            </div>

            {events.length === 0 ? (
              <div className="p-8 text-center">
                <CalendarDays size={48} className="text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-400">Tidak ada event</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto">
                {events.map((event, index) => {
                  const typeColor = getEventTypeColor(event.type);
                  const isSelected = selectedEvent?.name === event.name;
                  return (
                    <div
                      key={index}
                      onClick={() =>
                        setSelectedEvent(
                          isSelected ? null : event
                        )
                      }
                      className={`px-4 py-3 cursor-pointer transition hover:bg-slate-50 group ${
                        isSelected
                          ? 'bg-purple-50 border-l-4 border-l-purple-500 ring-1 ring-purple-200'
                          : 'border-l-4 border-l-transparent'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${typeColor.bg} ${typeColor.text}`}
                          >
                            {typeColor.label}
                          </span>
                          <h3 className="font-semibold text-slate-800 mt-1 text-xs">
                            {event.name}
                          </h3>
                          {event.description && (
                            <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">
                              {event.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <span className="text-xs font-bold text-purple-500">
                            {formatDate(event.date)}
                          </span>
                          {isSelected && (
                            <CheckCircle2 size={14} className="text-purple-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 3: Campaign Planner + Results */}
        <div className="space-y-4">
          {/* Campaign Planner Form */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div
              className="px-5 py-4 border-b border-slate-100 flex items-center justify-between cursor-pointer"
              onClick={() => setShowPlanner(!showPlanner)}
            >
              <h2 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                <Target size={18} className="text-emerald-500" />
                Campaign Planner
              </h2>
              <div className="flex items-center gap-2">
                {selectedKeyword && (
                  <span className="text-[10px] bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full">
                    📈 {selectedKeyword.query}
                  </span>
                )}
                {selectedEvent && (
                  <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                    📅 {formatDate(selectedEvent.date)}
                  </span>
                )}
                <ChevronRight
                  size={16}
                  className={`text-slate-400 transition ${showPlanner ? 'rotate-90' : ''}`}
                />
              </div>
            </div>

            {showPlanner && (
              <div className="p-4 space-y-4">
                {/* Campaign Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Nama Campaign
                  </label>
                  <input
                    type="text"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="Contoh: Promo Sehat Akhir Tahun"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none bg-slate-50"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Deskripsi Campaign
                  </label>
                  <textarea
                    value={campaignDesc}
                    onChange={(e) => setCampaignDesc(e.target.value)}
                    placeholder="Deskripsikan campaign yang ingin dijalankan..."
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none bg-slate-50 resize-none"
                  />
                </div>

                {/* Goal */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Goal Campaign
                  </label>
                  <input
                    type="text"
                    value={campaignGoal}
                    onChange={(e) => setCampaignGoal(e.target.value)}
                    placeholder="Contoh: Meningkatkan penjualan 30%"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none bg-slate-50"
                  />
                </div>

                {/* Month & Year */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Bulan Campaign
                    </label>
                    <select
                      value={campaignMonth}
                      onChange={(e) => setCampaignMonth(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none bg-slate-50"
                    >
                      {MONTHS.map((m, i) => (
                        <option key={i} value={i + 1}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Tahun
                    </label>
                    <select
                      value={campaignYear}
                      onChange={(e) => setCampaignYear(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none bg-slate-50"
                    >
                      {years.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Selected info */}
                <div className="bg-slate-50 rounded-lg p-3 space-y-1">
                  <p className="text-xs font-semibold text-slate-600">Ringkasan Pilihan:</p>
                  {selectedKeyword ? (
                    <p className="text-xs text-slate-500">
                      📈 Keyword Trend:{' '}
                      <span className="font-medium text-cyan-700">{selectedKeyword.query}</span>
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 italic">⚠️ Belum memilih keyword trend</p>
                  )}
                  {selectedEvent ? (
                    <p className="text-xs text-slate-500">
                      📅 Event:{' '}
                      <span className="font-medium text-purple-700">
                        {selectedEvent.name} ({formatDate(selectedEvent.date)})
                      </span>
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 italic">⚠️ Belum memilih event kalender</p>
                  )}
                </div>

                {/* Analyze Button */}
                <button
                  onClick={handleAnalyze}
                  disabled={generating || (!selectedKeyword && !selectedEvent)}
                  className="w-full bg-gradient-to-r from-cyan-500 to-emerald-500 text-white py-2.5 rounded-xl font-semibold hover:shadow-lg transition text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generating ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Analisis Insight Campaign
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Generated Results */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[200px]">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                <Lightbulb size={18} className="text-amber-500" />
                Insight Campaign
              </h2>
              {generatedIdeas && (
                <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                  Generated
                </span>
              )}
            </div>

            {!generatedIdeas && !generating && (
              <div className="p-8 flex flex-col items-center justify-center text-slate-400">
                <Lightbulb size={48} className="text-slate-200 mb-3" />
                <h3 className="text-sm font-semibold text-slate-500 mb-1">
                  Pilih Keyword & Event
                </h3>
                <p className="text-xs text-center">
                  Pilih keyword trend dan/atau event kalender, isi Campaign Planner, lalu klik Analisis
                </p>
              </div>
            )}

            {generating && (
              <div className="p-8 flex flex-col items-center justify-center gap-3">
                <Sparkles size={32} className="text-purple-400 animate-pulse" />
                <p className="text-sm text-slate-400">Generating campaign ideas...</p>
              </div>
            )}

            {generatedIdeas && !generating && (
              <div className="p-4 space-y-4">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">
                      Campaign: {generatedIdeas.campaignName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Keyword: {generatedIdeas.trendName}
                      {generatedIdeas.eventName && ` | Event: ${generatedIdeas.eventName}`}
                    </p>
                  </div>
                </div>

                {/* Ideas */}
                <div className="space-y-2">
                  {generatedIdeas.ideas.map((idea: any, i: number) => (
                    <div
                      key={i}
                      className="border border-slate-200 rounded-xl p-3 hover:shadow-md transition bg-white"
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <h4 className="font-semibold text-slate-800 text-xs">{idea.title}</h4>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full shrink-0 ml-2">
                          {idea.platform}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mb-2">{idea.desc}</p>
                      <p className="text-[10px] text-cyan-700 bg-cyan-50 p-2 rounded-lg">
                        <strong>CTA:</strong> {idea.cta}
                      </p>
                    </div>
                  ))}
                </div>

                {/* AI Insight */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Sparkles size={14} className="text-purple-600" />
                    <span className="text-[10px] font-semibold text-purple-700">AI INSIGHT</span>
                  </div>
                  <p className="text-xs text-slate-700">{generatedIdeas.insight}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleSavePlan}
                    disabled={saving}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-2 rounded-xl font-semibold hover:shadow-lg transition text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Save size={14} />
                    {saving ? 'Menyimpan...' : 'Simpan ke Database'}
                  </button>
                  <button
                    onClick={handleCopyBrief}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 rounded-xl font-semibold hover:shadow-lg transition text-xs flex items-center justify-center gap-1.5"
                  >
                    <Copy size={14} />
                    Copy Brief
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Saved Plans */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                <FileText size={18} className="text-indigo-500" />
                Campaign Plans Tersimpan
              </h2>
              <span className="text-xs text-slate-400">{savedPlans.length} plan</span>
            </div>

            {savedPlans.length === 0 ? (
              <div className="p-8 text-center">
                <FileText size={48} className="text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-400">Belum ada campaign plan tersimpan</p>
                <p className="text-xs text-slate-300 mt-1">
                  Generate insight lalu klik "Simpan ke Database"
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
                {savedPlans.map((plan) => (
                  <div key={plan.id} className="px-4 py-3 hover:bg-slate-50 transition group">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-800 text-xs">{plan.name}</h3>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {plan.goal || 'Tanpa goal'} &middot;{' '}
                          {MONTHS[(plan.campaign_month || 1) - 1]} {plan.campaign_year}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {plan.selected_keyword && (
                            <span className="text-[10px] bg-cyan-100 text-cyan-700 px-1.5 py-0.5 rounded-full">
                              📈 {plan.selected_keyword}
                            </span>
                          )}
                          {plan.selected_event_name && (
                            <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">
                              📅 {plan.selected_event_name}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeletePlan(plan.id)}
                        className="p-1.5 text-slate-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                        title="Hapus plan"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg bg-green-500 text-white text-sm font-semibold animate-bounce">
          ✅ {notification}
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float-up {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .trend-item {
          animation: float-up 0.3s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}