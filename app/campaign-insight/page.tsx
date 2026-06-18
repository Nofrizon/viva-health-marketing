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
  Plus,
  Save,
  Target,
  FileText,
  Trash2,
  X,
  CheckCircle2,
  Zap,
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

interface ManualCampaign {
  id: string;
  name: string;
  date: string;
  description: string;
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

// ===== KNOWN MANUAL CAMPAIGNS =====
const KNOWN_CAMPAIGNS: ManualCampaign[] = [
  { id: 'harbolnas', name: 'Harbolnas (Hari Belanja Online Nasional)', date: '2026-12-12', description: 'Momen belanja online terbesar di Indonesia' },
  { id: '1111', name: '11.11 Sale', date: '2026-11-11', description: 'Single Day shopping festival' },
  { id: '99', name: '9.9 Super Shopping Day', date: '2026-09-09', description: 'Super shopping day campaign' },
  { id: 'back-to-school', name: 'Back to School', date: '2026-07-01', description: 'Campaign tahun ajaran baru' },
  { id: 'end-year', name: 'Year End Sale', date: '2026-12-25', description: 'Promo akhir tahun & Natal' },
  { id: 'new-year', name: 'New Year Health Goals', date: '2027-01-01', description: 'Resolusi sehat tahun baru' },
  { id: 'ramadhan', name: 'Ramadhan Sehat', date: '2026-02-17', description: 'Campaign spesial bulan puasa' },
  { id: 'idul-fitri', name: 'Idul Fitri Campaign', date: '2026-03-20', description: 'Healthy Eid celebration' },
  { id: 'kemerdekaan', name: 'Kemerdekaan Sehat', date: '2026-08-17', description: 'HUT RI - Indonesia Sehat' },
  { id: 'valentine', name: 'Valentine Health', date: '2026-02-14', description: 'Healthy love campaign' },
  { id: 'sumpah-pemuda', name: 'Youth Health Day', date: '2026-10-28', description: 'Kesehatan generasi muda' },
  { id: 'hari-ibu', name: 'Hari Ibu Sehat', date: '2026-12-22', description: 'Apresiasi ibu dengan kesehatan' },
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

// ===== MONTHS =====
const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

// ===== COMPONENT =====
export default function CampaignInsightPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CampaignInsightData | null>(null);

  // Keyword search state
  const [searchKeyword, setSearchKeyword] = useState('');
  const [timeRange, setTimeRange] = useState('now 7-d');

  // Selection state
  const [selectedKeyword, setSelectedKeyword] = useState<TrendItem | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Manual Campaign state
  const [selectedManualCampaign, setSelectedManualCampaign] = useState<ManualCampaign | null>(null);
  const [customCampaign, setCustomCampaign] = useState('');
  const [customCampaignDate, setCustomCampaignDate] = useState('');
  const [customCampaignDesc, setCustomCampaignDesc] = useState('');
  const [showCustomCampaign, setShowCustomCampaign] = useState(false);

  // Campaign Planner state
  const [campaignName, setCampaignName] = useState('');
  const [campaignDesc, setCampaignDesc] = useState('');
  const [campaignGoal, setCampaignGoal] = useState('');
  const [campaignMonth, setCampaignMonth] = useState(new Date().getMonth() + 1);
  const [campaignYear, setCampaignYear] = useState(new Date().getFullYear());

  // AI Blueprint state
  const [blueprint, setBlueprint] = useState<string>('');
  const [blueprintMeta, setBlueprintMeta] = useState<{ campaignName: string; trendName: string; eventName: string | null } | null>(null);
  const [generating, setGenerating] = useState(false);

  // Saved plans
  const [savedPlans, setSavedPlans] = useState<CampaignPlan[]>([]);
  const [saving, setSaving] = useState(false);
  const [showPlanner, setShowPlanner] = useState(false);

  // Notification
  const [notification, setNotification] = useState('');

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

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

  // ===== HANDLE KEYWORD SEARCH =====
  const handleKeywordSearch = () => {
    if (!searchKeyword.trim()) {
      showNotification('Masukkan keyword terlebih dahulu!');
      return;
    }
    fetchData(searchKeyword.trim(), timeRange);
  };

  // ===== ANALYZE CAMPAIGN WITH AI (DeepSeek) =====
  const handleAnalyze = async () => {
    if (!selectedKeyword && !selectedEvent && !selectedManualCampaign) {
      showNotification('Pilih minimal keyword trend, event kalender, atau campaign!');
      return;
    }

    // Extract trend context from selected keyword
    const trendContext = selectedKeyword && data?.trends
      ? `Related trends: ${data.trends.slice(0, 5).map(t => t.query).join(', ')}`
      : '';

    setGenerating(true);
    setBlueprint('');
    setBlueprintMeta(null);

    try {
      const effectiveEventName = selectedEvent?.name || selectedManualCampaign?.name || '';
      const effectiveEventDate = selectedEvent?.date || selectedManualCampaign?.date || '';

      const res = await fetch('/api/campaign-insight/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignName: campaignName || `Campaign ${selectedKeyword?.query || effectiveEventName || 'Kesehatan'}`,
          campaignGoal: campaignGoal || 'Meningkatkan brand awareness dan engagement',
          campaignDesc: campaignDesc,
          campaignMonth,
          campaignYear,
          selectedKeyword: selectedKeyword?.query || null,
          selectedEventName: effectiveEventName || null,
          selectedEventDate: effectiveEventDate || null,
          trendContext,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal generate insight');
      }

      setBlueprint(json.blueprint);
      setBlueprintMeta({
        campaignName: json.campaignName,
        trendName: json.trendName,
        eventName: json.eventName,
      });
      showNotification('Insight campaign berhasil digenerate! 🚀');
    } catch (e: any) {
      showNotification(`Gagal generate insight: ${e.message}`);
      setBlueprint('');
    } finally {
      setGenerating(false);
    }
  };

  // ===== SAVE CAMPAIGN PLAN =====
  const handleSavePlan = async () => {
    if (!blueprint) {
      showNotification('Generate insight dulu sebelum menyimpan!');
      return;
    }

    setSaving(true);
    try {
      const effectiveEventName = selectedEvent?.name || selectedManualCampaign?.name || '';
      const effectiveEventDate = selectedEvent?.date || selectedManualCampaign?.date || '';

      const res = await fetch('/api/campaign-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: campaignName || `Campaign ${selectedKeyword?.query || effectiveEventName || 'Baru'}`,
          description: campaignDesc,
          goal: campaignGoal,
          campaign_month: campaignMonth,
          campaign_year: campaignYear,
          selected_keyword: selectedKeyword?.query || null,
          selected_event_name: effectiveEventName || null,
          selected_event_date: effectiveEventDate || null,
          generated_ideas: { blueprint, blueprintMeta },
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
    if (!blueprint) return;
    navigator.clipboard.writeText(blueprint);
    showNotification('Blueprint campaign disalin ke clipboard!');
  };

  // ===== ADD CUSTOM CAMPAIGN =====
  const handleAddCustomCampaign = () => {
    if (!customCampaign.trim()) {
      showNotification('Masukkan nama campaign terlebih dahulu!');
      return;
    }
    const newCampaign: ManualCampaign = {
      id: `custom-${Date.now()}`,
      name: customCampaign.trim(),
      date: customCampaignDate || new Date().toISOString().split('T')[0],
      description: customCampaignDesc || 'Campaign custom',
    };
    setSelectedManualCampaign(newCampaign);
    setCustomCampaign('');
    setCustomCampaignDate('');
    setCustomCampaignDesc('');
    setShowCustomCampaign(false);
    showNotification(`Campaign "${newCampaign.name}" ditambahkan!`);
  };

  const trends = data?.trends || [];
  const events = data?.events || [];

  const years = [];
  for (let y = 2024; y <= 2030; y++) years.push(y);

  // Combine selected info for display
  const hasSelection = selectedKeyword || selectedEvent || selectedManualCampaign;

  return (
    <div className="space-y-6">
      {/* ===== HEADER (matching other pages style) ===== */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Campaign Insight</h1>
        <div className="w-full h-px bg-slate-300 mb-6"></div>
        <h2 className="text-xl font-bold text-blue-600">Radar tren Google Trends & kalender event untuk ide campaign</h2>
      </div>

      {/* ===== TRENDING GOOGLE INDONESIA - FULL WIDTH ===== */}
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

        {/* Search Row */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Telusuri keyword trending... (contoh: kesehatan, viva health, obat herbal)"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleKeywordSearch()}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400 text-slate-900 text-sm"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400 text-slate-700 text-sm min-w-[180px]"
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
              className="px-6 py-3 bg-emerald-400 hover:bg-emerald-500 text-white rounded-2xl font-semibold shadow-sm hover:shadow-md transition text-sm flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
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
            <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
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
                      ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-200 shadow-md'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className={`text-base font-extrabold ${isSelected ? 'text-emerald-500' : heat.rank} w-10 shrink-0`}>
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
                      <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ===== KALENDER EVENT & CAMPAIGN - FULL WIDTH ===== */}
      <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <CalendarDays size={22} className="text-purple-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Kalender Event & Campaign</h2>
            <p className="text-sm text-slate-500">{events.length} event mendatang & campaign</p>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {events.map((event, index) => {
            const typeColor = getEventTypeColor(event.type);
            const isSelected = selectedEvent?.name === event.name;
            return (
              <div
                key={`event-${index}`}
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

          {/* Manual Campaigns (pre-defined + custom) */}
          {KNOWN_CAMPAIGNS.map((campaign) => {
            const isSelected = selectedManualCampaign?.id === campaign.id;
            return (
              <div
                key={`manual-${campaign.id}`}
                onClick={() =>
                  setSelectedManualCampaign(isSelected ? null : campaign)
                }
                className={`p-4 rounded-xl cursor-pointer transition border hover:shadow-md ${
                  isSelected
                    ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-200 shadow-md'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-700">
                      CAMPAIGN
                    </span>
                    <h3 className="font-semibold text-slate-800 mt-2 text-sm">
                      {campaign.name}
                    </h3>
                    {campaign.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {campaign.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-bold text-emerald-500">
                      {formatDate(campaign.date)}
                    </span>
                    {isSelected && (
                      <CheckCircle2 size={18} className="text-emerald-500" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Custom Campaign Section */}
        <div className="border-t border-slate-200 pt-4">
          {showCustomCampaign ? (
            <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">Tambah Campaign Manual</span>
                <button
                  onClick={() => setShowCustomCampaign(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Nama campaign (contoh: Harbolnas)"
                  value={customCampaign}
                  onChange={(e) => setCustomCampaign(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                />
                <input
                  type="date"
                  value={customCampaignDate}
                  onChange={(e) => setCustomCampaignDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Deskripsi singkat"
                  value={customCampaignDesc}
                  onChange={(e) => setCustomCampaignDesc(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                />
              </div>
              <button
                onClick={handleAddCustomCampaign}
                className="px-5 py-2.5 bg-emerald-400 hover:bg-emerald-500 text-white rounded-xl font-semibold text-sm flex items-center gap-2 transition"
              >
                <Plus size={16} />
                Tambahkan Campaign
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowCustomCampaign(true)}
              className="flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 border-2 border-dashed border-emerald-300 hover:border-emerald-400 rounded-xl px-4 py-3 transition w-full justify-center"
            >
              <Plus size={18} />
              Add Campaign Manual (Harbolnas, 11.11, dll)
            </button>
          )}
        </div>
      </div>

      {/* ===== CAMPAIGN PLANNER (TOP) ===== */}
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
              <p className="text-sm text-slate-500">Rencanakan campaign berdasarkan tren, event & campaign terpilih</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {selectedKeyword && (
                <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-medium">
                  📈 {selectedKeyword.query}
                </span>
              )}
              {selectedEvent && (
                <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
                  📅 {formatDate(selectedEvent.date)}
                </span>
              )}
              {selectedManualCampaign && (
                <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-medium">
                  🎯 {selectedManualCampaign.name}
                </span>
              )}
            </div>
          </div>
        </div>

        {showPlanner && (
          <div className="px-6 md:px-8 pb-8 space-y-5">
            {/* Campaign Name & Goal */}
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
                  <span className="font-medium text-emerald-700">{selectedKeyword.query}</span>
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
              {selectedManualCampaign ? (
                <p className="text-sm text-slate-500">
                  🎯 Campaign:{' '}
                  <span className="font-medium text-emerald-700">
                    {selectedManualCampaign.name} ({formatDate(selectedManualCampaign.date)})
                  </span>
                </p>
              ) : (
                <p className="text-sm text-slate-400 italic">💡 Bisa tambah campaign manual di atas</p>
              )}
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={generating || !hasSelection}
              className="w-full bg-emerald-400 hover:bg-emerald-500 text-white py-3.5 rounded-xl font-semibold shadow-sm hover:shadow-md transition text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? (
                <>
                  <RefreshCw size={20} className="animate-spin" />
                  AI Generating Blueprint...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Analisis Insight Campaign (AI)
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* ===== INSIGHT CAMPAIGN (BOTTOM) - Full Width AI Blueprint ===== */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <Lightbulb size={22} className="text-amber-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Insight Campaign</h2>
              <p className="text-sm text-slate-500">
                {blueprint ? 'AI-Generated Campaign Blueprint' : 'Pilih keyword, event, atau campaign lalu klik Analisis'}
              </p>
            </div>
          </div>

          {/* Empty state */}
          {!blueprint && !generating && (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400">
              <Lightbulb size={64} className="text-slate-200 mb-4" />
              <h3 className="text-lg font-semibold text-slate-500 mb-2">
                Siap Generate Insight
              </h3>
              <p className="text-sm text-center max-w-md">
                Pilih keyword trend, event kalender, dan/atau campaign manual &rarr; isi Campaign Planner &rarr; klik Analisis
              </p>
            </div>
          )}

          {/* Generating state */}
          {generating && (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <Sparkles size={40} className="text-emerald-400 animate-pulse" />
              <p className="text-base text-slate-500 font-medium">AI DeepSeek sedang menyusun blueprint campaign...</p>
              <p className="text-sm text-slate-400">Ini mungkin memakan waktu 15-30 detik</p>
            </div>
          )}

          {/* Blueprint result */}
          {blueprint && !generating && (
            <div className="space-y-5">
              {/* Meta info */}
              {blueprintMeta && (
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                    📋 {blueprintMeta.campaignName}
                  </span>
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-medium">
                    📈 {blueprintMeta.trendName}
                  </span>
                  {blueprintMeta.eventName && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
                      📅 {blueprintMeta.eventName}
                    </span>
                  )}
                </div>
              )}

              {/* AI Blueprint content (rendered markdown) */}
              <div className="bg-gradient-to-r from-slate-50 to-emerald-50 border border-slate-200 rounded-2xl p-6 overflow-auto max-h-[800px]">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-emerald-200">
                  <Sparkles size={18} className="text-emerald-600" />
                  <span className="text-sm font-bold text-emerald-700 uppercase tracking-wide">
                    AI DEEPSEEK BLUEPRINT & INSIGHT
                  </span>
                </div>
                <div
                  className="prose prose-sm max-w-none text-slate-700
                    prose-h2:text-lg prose-h2:font-bold prose-h2:text-emerald-700 prose-h2:mt-6 prose-h2:mb-3 prose-h2:pb-2 prose-h2:border-b prose-h2:border-emerald-200
                    prose-h3:text-base prose-h3:font-bold prose-h3:text-slate-800 prose-h3:mt-4 prose-h3:mb-2
                    prose-p:text-sm prose-p:leading-relaxed prose-p:mb-3
                    prose-strong:text-slate-800
                    prose-ul:text-sm prose-ul:my-2
                    prose-li:text-sm prose-li:my-1
                    prose-table:text-sm prose-table:w-full
                    prose-th:bg-emerald-50 prose-th:text-emerald-800 prose-th:font-semibold prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:text-xs
                    prose-td:px-3 prose-td:py-2 prose-td:border-b prose-td:border-slate-100 prose-td:text-xs
                    prose-hr:border-emerald-200
                  "
                  dangerouslySetInnerHTML={{
                    __html: blueprint
                      .replace(/^### /gm, '### ')
                      .replace(/^## /gm, '## ')
                      .replace(/^# /gm, '# ')
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/^- /gm, '• ')
                      .replace(/\n/g, '<br/>')
                      .replace(/<br\/>\s*<br\/>/g, '</p><p>')
                  }}
                />
              </div>


              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSavePlan}
                  disabled={saving}
                  className="flex-1 bg-emerald-400 hover:bg-emerald-500 text-white py-3 rounded-xl font-semibold shadow-sm hover:shadow-md transition text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save size={18} />
                  {saving ? 'Menyimpan...' : 'Simpan ke Database'}
                </button>
                <button
                  onClick={handleCopyBrief}
                  className="flex-1 bg-slate-700 hover:bg-slate-800 text-white py-3 rounded-xl font-semibold shadow-sm hover:shadow-md transition text-sm flex items-center justify-center gap-2"
                >
                  <Copy size={18} />
                  Copy Blueprint
                </button>
              </div>
            </div>
          )}
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
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
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
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg bg-emerald-500 text-white text-sm font-semibold animate-bounce">
          ✅ {notification}
        </div>
      )}

    </div>
  );
}