// app/api/campaign-insight/route.ts
// Server-side proxy for Google Trends & Calendar Events
import { NextResponse } from 'next/server';

interface TrendItem {
  title: string;
  volume: string;
  change: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('keyword')?.trim() || 'kesehatan';
  const timeRange = searchParams.get('timeRange') || 'now 1-d';

  try {
    // ===== 1. Fetch Google Trends =====
    const exploreBody = JSON.stringify({
      comparisonItem: [
        {
          keyword,
          geo: 'ID',
          time: timeRange,
        },
      ],
      category: 0,
      property: '',
    });

    const formData = new URLSearchParams();
    formData.append('hl', 'id');
    formData.append('tz', '-420');
    formData.append('req', exploreBody);

    const exploreRes = await fetch(
      `https://trends.google.com/trends/api/explore?hl=id&tz=-420&req=${encodeURIComponent(exploreBody)}`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Accept: 'application/json, text/plain, */*',
        },
        cache: 'no-store',
      }
    );

    let trendsData: TrendItem[] = [];
    let relatedQueries: any[] = [];

    if (exploreRes.ok) {
      const raw = await exploreRes.text();
      // Google Trends prepends )]}' to prevent JSON hijacking
      const jsonText = raw.replace(/^\)\]\}',?\n?/, '');
      const exploreData = JSON.parse(jsonText);

      // Extract related queries widget token
      const widgets = exploreData?.widgets || [];

      for (const widget of widgets) {
        if (
          widget.id === 'RELATED_QUERIES' ||
          widget.title?.toLowerCase().includes('kueri')
        ) {
          const token = widget.token;
          const reqData = widget.request;

          if (token && reqData) {
            const relatedRes = await fetch(
              `https://trends.google.com/trends/api/widgetdata/relatedsearches?hl=id&tz=-420&req=${encodeURIComponent(JSON.stringify(reqData))}&token=${encodeURIComponent(token)}`,
              {
                headers: {
                  'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                },
                cache: 'no-store',
              }
            );

            if (relatedRes.ok) {
              const relatedRaw = await relatedRes.text();
              const relatedJson = JSON.parse(relatedRaw.replace(/^\)\]\}',?\n?/, ''));
              const ranked = relatedJson?.default?.rankedList || [];

              for (const list of ranked) {
                const items = list?.rankedKeyword || [];
                for (const item of items) {
                  relatedQueries.push({
                    query: item.query,
                    value: item.value || 'N/A',
                    extracted_value: item.extracted_value || 0,
                    formattedValue: item.formattedValue || 'N/A',
                    hasData: item.hasData !== false,
                    link: item.link || '',
                  });
                }
              }
            }
          }
        }
      }

      // Fallback: also try daily trends if no related queries found
      if (relatedQueries.length === 0) {
        const dailyRes = await fetch(
          'https://trends.google.com/trends/api/dailytrends?hl=id&tz=-420&geo=ID&ns=15',
          {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
            cache: 'no-store',
          }
        );
        if (dailyRes.ok) {
          const dailyRaw = await dailyRes.text();
          const dailyData = JSON.parse(dailyRaw.replace(/^\)\]\}',?\n?/, ''));
          const trendingSearches =
            dailyData?.default?.trendingSearchesDays?.[0]?.trendingSearches ||
            [];
          relatedQueries = trendingSearches.map((ts: any) => ({
            query: ts.title?.query || '',
            value: ts.formattedTraffic || 'N/A',
            extracted_value: ts.formattedTraffic || 0,
            formattedValue: ts.formattedTraffic || 'N/A',
            hasData: true,
            link: '',
            articles: ts.articles || [],
          }));
        }
      }
    }

    // ===== 2. Fetch Calendar Events =====
    let calendarEvents: any[] = [];
    try {
      const calRes = await fetch('https://libur.deno.dev/api', {
        cache: 'no-store',
      });
      if (calRes.ok) {
        const calData = await calRes.json();
        const now = new Date();

        calendarEvents = (Array.isArray(calData) ? calData : [])
          .filter((event: any) => {
            // Filter events from today onwards
            const eventDate = new Date(event.date || event.tanggal || event.tanggal_perayaan);
            return eventDate >= new Date(now.getFullYear(), now.getMonth(), now.getDate());
          })
          .slice(0, 20)
          .map((event: any) => ({
            name: event.nama || event.name || event.perayaan || event.keterangan || 'Unknown Event',
            date: event.date || event.tanggal || event.tanggal_perayaan || '',
            type: event.jenis || event.type || (event.is_national_holiday ? 'LIBUR NASIONAL' : 'PERINGATAN'),
            description: event.keterangan || event.description || '',
            isHoliday: event.is_national_holiday || event.is_holiday || false,
          }));
      }
    } catch {
      console.warn('Gagal fetch kalender event, lanjutkan tanpa data kalender');
    }

    return NextResponse.json({
      keyword,
      timeRange,
      trends: relatedQueries.slice(0, 15),
      events: calendarEvents,
    });
  } catch (error) {
    console.error('Campaign Insight API Error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data tren atau kalender', trends: [], events: [] },
      { status: 500 }
    );
  }
}