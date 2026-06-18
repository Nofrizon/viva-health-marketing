'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  CalendarStar,
  Search,
  RefreshCw,
  Lightbulb,
  Copy,
  Sparkles,
  ChevronRight,
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

// Campaign ideas generator based on event and trend
function generateCampaignIdeas(event: CalendarEvent, trend?: TrendItem) {
  const eventName = event.name;
  const trendName = trend?.query || 'kesehatan';
  const eventType = event.type || 'EVENT';

  const ideas = [
    {
      title: `📢 "${eventName} Sehat" Campaign`,
      desc: `Gabungkan momentum ${eventName} dengan edukasi ${trendName}. Buat konten sosial media dengan tips seputar ${trendName} yang relevan dengan ${eventName.toLowerCase()}.`,
      cta: `Posting Instagram & TikTok: "Rayakan ${eventName} dengan ${trendName} Lebih Sehat"`,
      platform: '📱 Instagram + TikTok',
    },
    {
      title: `🎯 Bundling Promo ${eventName}`,
      desc: `Paket spesial ${eventName} dengan bundling produk ${trendName}. Berikan diskon atau hadiah untuk setiap pembelian selama periode ${eventName}.`,
      cta: `Landing page khusus + WhatsApp blast dengan kode promo eksklusif`,
      platform: '🌐 Website + WhatsApp',
    },
    {
      title: `🎓 Edukasi Interaktif`,
      desc: `Selenggarakan webinar atau live streaming edukasi seputar ${trendName} di momen ${eventName}. Hadirkan ahli untuk meningkatkan kredibilitas brand.`,
      cta: `Live TikTok/Instagram dengan sesi tanya jawab interaktif`,
      platform: '🎵 Live Streaming',
    },
  ];

  return {
    eventName,
    trendName,
    ideas,
    insight: `Momentum ${eventName} bisa dikombinasikan dengan tren ${trendName} yang sedang naik. Fokus pada edukasi dan emotional connection dengan audiens untuk meningkatkan engagement dan konversi.`,
  };
}

// ===== COMPONENT =====
export default function CampaignInsightPage() {
  const [keyword, setKeyword] = useState('kesehatan');
  const [searchInput, setSearchInput] = useState('kesehatan');
  const [timeRange, setTimeRange] = useState('now 1-d');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CampaignInsightData | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [campaignIdeas, setCampaignIdeas] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [notification, setNotification] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/campaign-insight?keyword=${encodeURIComponent(keyword)}&timeRange=${encodeURIComponent(timeRange)}`
      );
      const json = await res.json();
      setData(json);
    } catch {
      setNotification('Gagal mengambil data. Coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  }, [keyword, timeRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyword(searchInput.trim() || 'kesehatan');
    setSelectedEvent(null);
    setCampaignIdeas(null);
  };

  const handleShowCampaign = (event: CalendarEvent) => {
    setGenerating(true);
    setSelectedEvent(event);

    // Pick a trending topic for campaign idea
    const topTrend = data?.trends?.[0];
    setTimeout(() => {
      const ideas = generateCampaignIdeas(event, topTrend);
      setCampaignIdeas(ideas);
      setGenerating(false);
      showNotification('Ide campaign berhasil digenerate!');
    }, 800);
  };

  const handleCopyBrief = () => {
    if (!campaignIdeas) return;
    const brief = campaignIdeas.ideas
      .map(
        (idea: any) =>
          `**${idea.title}**\n${idea.desc}\nCTA: ${idea.cta}\nPlatform: ${idea.platform}`
      )
      .join('\n\n');
    navigator.clipboard.writeText(brief);
    showNotification('Brief campaign disalin ke clipboard!');
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const trends = data?.trends || [];
  const events = data?.events || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Campaign Insight</h1>
          <p className="text-sm text-slate-500 mt-1">
            Radar tren kesehatan & kalender event untuk ide campaign
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-green-700">LIVE DATA</span>
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

      {/* Search & Time Range */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari keyword kesehatan..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-300 focus:border-cyan-400 outline-none bg-slate-50"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-slate-200 rounded-xl text-sm px-4 py-2.5 bg-slate-50 focus:ring-2 focus:ring-cyan-300 outline-none"
            >
              <option value="now 1-d">24 Jam Terakhir</option>
              <option value="now 7-d">Seminggu Terakhir</option>
            </select>
            <button
              type="button"
              onClick={fetchData}
              disabled={loading}
              className="p-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl transition disabled:opacity-50"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* LEFT: Trending Topics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Trending Now */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp size={18} className="text-red-500" />
                Kueri yang Makin Populer
              </h2>
              <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full font-semibold">
                🔥 Trending
              </span>
            </div>

            {loading ? (
              <div className="p-10 flex flex-col items-center justify-center gap-3">
                <RefreshCw size={32} className="text-slate-300 animate-spin" />
                <p className="text-sm text-slate-400">Mengambil data tren...</p>
              </div>
            ) : trends.length === 0 ? (
              <div className="p-10 text-center">
                <TrendingUp size={48} className="text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-400">Tidak ada data tren ditemukan</p>
                <p className="text-xs text-slate-300 mt-1">
                  Coba keyword lain atau refresh halaman
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {trends.filter(t => t.query).map((item, index) => {
                  const heat = getHeatClass(index);
                  return (
                    <div
                      key={index}
                      className={`trend-item flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition ${heat.bg}`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`text-lg font-extrabold ${heat.rank} w-8 shrink-0`}>
                          #{index + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 text-sm truncate">
                            {item.query}
                          </p>
                          {item.articles && item.articles.length > 0 && (
                            <p className="text-xs text-slate-400 mt-0.5">
                              {item.articles.length} artikel terkait
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${heat.badge}`}>
                          {heat.label}
                        </span>
                        {item.formattedValue !== 'N/A' && (
                          <p className="text-xs text-slate-500 mt-1">{item.formattedValue}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Calendar Events & Campaign Ideas */}
        <div className="lg:col-span-3 space-y-6">
          {/* Calendar Events */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <CalendarStar size={18} className="text-purple-500" />
                Kalender Event & Campaign
              </h2>
              <span className="text-xs text-slate-400">{events.length} event mendatang</span>
            </div>

            {events.length === 0 ? (
              <div className="p-10 text-center">
                <CalendarStar size={48} className="text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-400">Tidak ada event tersedia</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto">
                {events.map((event, index) => {
                  const typeColor = getEventTypeColor(event.type);
                  const isSelected = selectedEvent?.name === event.name;
                  return (
                    <div
                      key={index}
                      onClick={() => handleShowCampaign(event)}
                      className={`px-5 py-3 hover:bg-slate-50 transition cursor-pointer group ${
                        isSelected ? 'bg-purple-50 border-l-4 border-l-purple-500' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${typeColor.bg} ${typeColor.text}`}>
                            {typeColor.label}
                          </span>
                          <h3 className="font-semibold text-slate-800 mt-1 text-sm">{event.name}</h3>
                          {event.description && (
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                              {event.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          <span className="text-sm font-bold text-purple-500">
                            {formatDate(event.date)}
                          </span>
                          <ChevronRight
                            size={16}
                            className="text-slate-300 group-hover:text-purple-500 transition"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Campaign Ideas Result */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[200px]">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <Lightbulb size={18} className="text-amber-500" />
                Insight Campaign
              </h2>
            </div>

            {!selectedEvent && !generating && (
              <div className="p-10 flex flex-col items-center justify-center text-slate-400">
                <Lightbulb size={48} className="text-slate-200 mb-3" />
                <h3 className="text-sm font-semibold text-slate-500 mb-1">
                  Klik Event di Kalender
                </h3>
                <p className="text-xs text-center">
                  Pilih event dari kalender di atas untuk melihat ide campaign
                </p>
              </div>
            )}

            {generating && (
              <div className="p-10 flex flex-col items-center justify-center gap-3">
                <Sparkles size={32} className="text-purple-400 animate-pulse" />
                <p className="text-sm text-slate-400">Generating campaign ideas...</p>
              </div>
            )}

            {campaignIdeas && !generating && (
              <div className="p-5 space-y-4">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-800">
                      Ide Campaign: {campaignIdeas.eventName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Trending: {campaignIdeas.trendName}
                    </p>
                  </div>
                  <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold shrink-0">
                    📈 {campaignIdeas.trendName}
                  </span>
                </div>

                {/* Ideas */}
                <div className="space-y-3">
                  {campaignIdeas.ideas.map((idea: any, i: number) => (
                    <div
                      key={i}
                      className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition bg-white"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-slate-800 text-sm">{idea.title}</h4>
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full shrink-0 ml-2">
                          {idea.platform}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{idea.desc}</p>
                      <p className="text-xs text-cyan-700 bg-cyan-50 p-2 rounded-lg">
                        <strong>CTA:</strong> {idea.cta}
                      </p>
                    </div>
                  ))}
                </div>

                {/* AI Insight */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={16} className="text-purple-600" />
                    <span className="text-xs font-semibold text-purple-700">AI INSIGHT</span>
                  </div>
                  <p className="text-sm text-slate-700">{campaignIdeas.insight}</p>
                </div>

                {/* Copy Brief Button */}
                <button
                  onClick={handleCopyBrief}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2.5 rounded-xl font-semibold hover:shadow-lg transition text-sm flex items-center justify-center gap-2"
                >
                  <Copy size={16} />
                  Copy Brief untuk Tim Kreatif
                </button>
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

      {/* CSS Animations (injected via style tag) */}
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
          animation: float-up 0.4s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}