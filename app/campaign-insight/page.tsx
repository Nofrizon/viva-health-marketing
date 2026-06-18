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

// ===== TIME RANGE OPTIONS (Google Trends style) =====
const TIME_RANGE_OPTIONS = [
  { value: 'now 1-H', label: '4 jam terakhir' },
  { value: 'now 4-H', label: '1 hari terakhir' },
  { value: 'now 1-d', label: '1 hari terakhir' },
  { value: 'now 7-d', label: '7 hari terakhir' },
  { value: 'today 1-m', label: '30 hari terakhir' },
  { value: 'today 3-m', label: '90 hari terakhir' },
  { value: 'today 12-m', label: '12 bulan terakhir' },
  { value: 'today 5-y', label: '5 tahun terakhir' },
];

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

  // Keyword search state (Google Trends style)
  const [searchKeyword, setSearchKeyword] = useState('');
  const [timeRange, setTimeRange] = useState('now 7-d');

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
  const fetchData = useCallback(async (keyword?: string, tr?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (keyword) params.set('keyword', keyword);
      params.set('timeRange', tr || timeRange);
      const res = await fetch(`/api/campaign-insight?${params.toString()}`);
      const json = await res.json();
      setData(json);
    } catch {
      showNotification('Gagal mengambil data. Coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

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

  // ===== HANDLE KEYWORD SEARCH (Google Trends style) =====
  const handleKeywordSearch = () => {
    if (!searchKeyword.trim()) {
      showNotification('Masukkan keyword terlebih dahulu!');
      return;
    }
    fetchData(searchKeyword.trim(), timeRange);
  };

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
      {/* ===== HEADER (matching other pages style) ===== */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Campaign Insight</h1>
        <div className="w-full h-px bg-slate-300 mb-6"></div>
        <h2 className="text-xl font-bold text-blue-600">Radar tren Google Trends & kalender event untuk ide campaign</h2>
      </div>

      {/* ===== TRENDING GOOGLE INDONESIA - FULL WIDTH (Google Trends style) ===== */}
      <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <TrendingUp size={22} className="text-red-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Trending Google Indonesia</h2>
            <p className="text-sm text-slate-500">Pantau trending topic & cari keyword spesifik seperti Google Trends</p>
          </div>
        </div>

        {/* Search Row - Google Trends style: keyword input + time range dropdown + search button */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Telusuri keyword trending... (contoh: kesehatan, viva health, obat herbal)"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleKeywordSearch()}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-400 text-slate-900 text-sm"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-400 text-slate-700 text-sm min-w-[180px]"
            >
              {TIME_RANGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              onClick={handleKeywordSearch}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl font-semibold hover:shadow-lg transition text-sm flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Mencari...
                </>
              ) : (
                <>
                  <Search size={18} />
                  Jelajahi
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results info */}
        {searchKeyword && (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm text-slate-500">Hasil untuk:</span>
            <span className="text-sm font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-full">
              &ldquo;{searchKeyword}&rdquo;
            </span>
            <span className="text-xs text-slate-400">({trends.length} topik terkait)</span>
          </div>
        )}

        {/* Trending List */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <RefreshCw size={40} className="text-slate-300 animate-spin" />
            <p className="text-sm text-slate-400">Mengambil data tren dari Google Trends...</p>
          </div>
        ) : trends.length === 0 ? (
          <div className="py-12 text-center">
            <TrendingUp size={64} className="text-slate-200 mx-auto mb-4" />
            <p className="text-lg font-semibold text-slate-400 mb-2">Belum ada data tren</p>
            <p className="text-sm text-slate-400">
              {searchKeyword
                ? `Tidak ditemukan tren untuk "${searchKeyword}". Coba keyword lain atau ubah rentang waktu.`
                : 'Masukkan keyword di atas untuk mencari tren spesifik, atau klik "Jelajahi" tanpa keyword untuk tren harian.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {trends.map((item, index) => {
              const heat = getHeatClass(index);
              const isSelected = selectedKeyword?.query === item.query;
              return (
                <div
                  key={index}
                  onClick={() =>
                    setSelectedKeyword(isSelected ? null : item)
                  }
                  className={`trend-item flex items-center justify-between p-4 rounded-xl cursor-pointer transition border hover:shadow-md ${
                    isSelected
                      ? 'bg-cyan-50 border-cyan-400 ring-2 ring-cyan-200 shadow-md'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className={`text-base font-extrabold ${heat.rank} w-10 shrink-0`}>
                      #{index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">
                        {item.query}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${heat.badge}`}>
                          {heat.label}
                        </span>
                        {item.articles && item.articles.length > 0 && (
                          <span className="text-[11px] text-slate-400">
                            {item.articles.length} artikel terkait
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 ml-3 flex items-center gap-2">
                    {item.formattedValue !== 'N/A' && (
                      <span className="text-sm font-semibold text-slate-600">{item.formattedValue}</span>
                    )}
                    {isSelected && (
                      <CheckCircle2 size={20} className="text-cyan-500 shrink-0" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ===== KALENDER EVENT - FULL WIDTH ===== */}
      <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <CalendarDays size={22} className="text-purple-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Kalender Event & Campaign</h2>
            <p className="text-sm text-slate-500">{events.length} event mendatang</p>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="py-12 text-center">
            <CalendarDays size={64} className="text-slate-200 mx-auto mb-4" />
            <p className="text-lg font-semibold text-slate-400">Tidak ada event</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {events.map((event, index) => {
              const typeColor = getEventTypeColor(event.type);
              const isSelected = selectedEvent?.name === event.name;
              return (
                <div
                  key={index}
                  onClick={() =>
                    setSelectedEvent(isSelected ? null : event)
                  }
                  className={`p-4 rounded-xl cursor-pointer transition border hover:shadow-md ${
                    isSelected
                      ? 'bg-purple-50 border-purple-400 ring-2 ring-purple-200 shadow-md'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${typeColor.bg} ${typeColor.text}`}
                      >
                        {typeColor.label}
                      </span>
                      <h3 className="font-semibold text-slate-800 mt-2 text-sm">
                        {event.name}
                      </h3>
                      {event.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-bold text-purple-500">
                        {formatDate(event.date)}
                      </span>
                      {isSelected && (
                        <CheckCircle2 size={18} className="text-purple-500" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ===== CAMPAIGN PLANNER + INSIGHT - FULL WIDTH ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaign Planner Form */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div
            className="p-6 md:p-8 cursor-pointer"
            onClick={() => setShowPlanner(!showPlanner)}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <Target size={22} className="text-emerald-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-800">Campaign Planner</h2>
                <p className="text-sm text-slate-500">Rencanakan campaign berdasarkan tren & event terpilih</p>
              </div>
              <div className="flex items-center gap-2">
                {selectedKeyword && (
                  <span className="text-xs bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full font-medium">
                    📈 {selectedKeyword.query}
                  </span>
                )}
                {selectedEvent && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
                    📅 {formatDate(selectedEvent.date)}
                  </span>
                )}
                <ChevronRight
                  size={20}
                  className={`text-slate-400 transition ${showPlanner ? 'rotate-90' : ''}`}
                />
              </div>
            </div>
          </div>

          {showPlanner && (
            <div className="px-6 md:px-8 pb-8 space-y-5">
              {/* Campaign Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">
                    Nama Campaign
                  </label>
                  <input
                    type="text"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="Contoh: Promo Sehat Akhir Tahun"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">
                    Goal Campaign
                  </label>
                  <input
                    type="text"
                    value={campaignGoal}
                    onChange={(e) => setCampaignGoal(e.target.value)}
                    placeholder="Contoh: Meningkatkan penjualan 30%"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none bg-slate-50"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">
                  Deskripsi Campaign
                </label>
                <textarea
                  value={campaignDesc}
                  onChange={(e) => setCampaignDesc(e.target.value)}
                  placeholder="Deskripsikan campaign yang ingin dijalankan..."
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none bg-slate-50 resize-none"
                />
              </div>

              {/* Month & Year */}
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">
                    Bulan Campaign
                  </label>
                  <select
                    value={campaignMonth}
                    onChange={(e) => setCampaignMonth(parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none bg-slate-50"
                  >
                    {MONTHS.map((m, i) => (
                      <option key={i} value={i + 1}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">
                    Tahun
                  </label>
                  <select
                    value={campaignYear}
                    onChange={(e) => setCampaignYear(parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none bg-slate-50"
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
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <p className="text-sm font-semibold text-slate-600">Ringkasan Pilihan:</p>
                {selectedKeyword ? (
                  <p className="text-sm text-slate-500">
                    📈 Keyword Trend:{' '}
                    <span className="font-medium text-cyan-700">{selectedKeyword.query}</span>
                  </p>
                ) : (
                  <p className="text-sm text-slate-400 italic">⚠️ Belum memilih keyword trend</p>
                )}
                {selectedEvent ? (
                  <p className="text-sm text-slate-500">
                    📅 Event:{' '}
                    <span className="font-medium text-purple-700">
                      {selectedEvent.name} ({formatDate(selectedEvent.date)})
                    </span>
                  </p>
                ) : (
                  <p className="text-sm text-slate-400 italic">⚠️ Belum memilih event kalender</p>
                )}
              </div>

              {/* Analyze Button */}
              <button
                onClick={handleAnalyze}
                disabled={generating || (!selectedKeyword && !selectedEvent)}
                className="w-full bg-gradient-to-r from-cyan-500 to-emerald-500 text-white py-3.5 rounded-xl font-semibold hover:shadow-lg transition text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <>
                    <RefreshCw size={20} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Analisis Insight Campaign
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Insight Campaign Results */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <Lightbulb size={22} className="text-amber-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Insight Campaign</h2>
                <p className="text-sm text-slate-500">
                  {generatedIdeas ? 'AI-generated campaign ideas' : 'Pilih keyword & event, lalu klik Analisis'}
                </p>
              </div>
            </div>

            {!generatedIdeas && !generating && (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                <Lightbulb size={64} className="text-slate-200 mb-4" />
                <h3 className="text-lg font-semibold text-slate-500 mb-2">
                  Pilih Keyword & Event
                </h3>
                <p className="text-sm text-center max-w-xs">
                  Pilih keyword trend dan/atau event kalender, isi Campaign Planner, lalu klik Analisis
                </p>
              </div>
            )}

            {generating && (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <Sparkles size={40} className="text-purple-400 animate-pulse" />
                <p className="text-base text-slate-400">Generating campaign ideas...</p>
              </div>
            )}

            {generatedIdeas && !generating && (
              <div className="space-y-5">
                {/* Header */}
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">
                    Campaign: {generatedIdeas.campaignName}
                  </h3>
                  <p className="text-sm text-slate-500">
                    Keyword: {generatedIdeas.trendName}
                    {generatedIdeas.eventName && ` | Event: ${generatedIdeas.eventName}`}
                  </p>
                </div>

                {/* Ideas */}
                <div className="space-y-3">
                  {generatedIdeas.ideas.map((idea: any, i: number) => (
                    <div
                      key={i}
                      className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition bg-white"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-slate-800 text-sm">{idea.title}</h4>
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full shrink-0 ml-2">
                          {idea.platform}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{idea.desc}</p>
                      <p className="text-sm text-cyan-700 bg-cyan-50 p-3 rounded-lg">
                        <strong>CTA:</strong> {idea.cta}
                      </p>
                    </div>
                  ))}
                </div>

                {/* AI Insight */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={16} className="text-purple-600" />
                    <span className="text-sm font-semibold text-purple-700">AI INSIGHT</span>
                  </div>
                  <p className="text-sm text-slate-700">{generatedIdeas.insight}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleSavePlan}
                    disabled={saving}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Save size={18} />
                    {saving ? 'Menyimpan...' : 'Simpan ke Database'}
                  </button>
                  <button
                    onClick={handleCopyBrief}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition text-sm flex items-center justify-center gap-2"
                  >
                    <Copy size={18} />
                    Copy Brief
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== SAVED PLANS - FULL WIDTH ===== */}
      <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <FileText size={22} className="text-indigo-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Campaign Plans Tersimpan</h2>
            <p className="text-sm text-slate-500">{savedPlans.length} plan tersimpan</p>
          </div>
        </div>

        {savedPlans.length === 0 ? (
          <div className="py-12 text-center">
            <FileText size={64} className="text-slate-200 mx-auto mb-4" />
            <p className="text-lg font-semibold text-slate-400 mb-1">Belum ada campaign plan tersimpan</p>
            <p className="text-sm text-slate-400">
              Generate insight lalu klik "Simpan ke Database"
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {savedPlans.map((plan) => (
              <div key={plan.id} className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition bg-white group relative">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800 text-sm">{plan.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {plan.goal || 'Tanpa goal'} &middot;{' '}
                      {MONTHS[(plan.campaign_month || 1) - 1]} {plan.campaign_year}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {plan.selected_keyword && (
                        <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full font-medium">
                          📈 {plan.selected_keyword}
                        </span>
                      )}
                      {plan.selected_event_name && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                          📅 {plan.selected_event_name}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeletePlan(plan.id)}
                    className="p-2 text-slate-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100 absolute top-2 right-2"
                    title="Hapus plan"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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