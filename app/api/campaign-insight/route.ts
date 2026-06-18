// app/api/campaign-insight/route.ts
// Server-side proxy for Google Trends Daily, Related Searches & Calendar Events
import { NextResponse } from 'next/server';

interface TrendItem {
  query: string;
  value: string;
  formattedValue: string;
  extracted_value: number;
  hasData: boolean;
  link: string;
  articles?: any[];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('keyword')?.trim() || '';
  const timeRange = searchParams.get('timeRange') || 'now 1-d';

  try {
    let relatedQueries: TrendItem[] = [];

    // ===== 1. Fetch ALL trending queries from Google Trends Daily (Indonesia) =====
    // This fetches the daily trending page: https://trends.google.com/trending?geo=ID
    try {
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
        const trendingSearchesDays = dailyData?.default?.trendingSearchesDays || [];

        for (const day of trendingSearchesDays) {
          const searches = day?.trendingSearches || [];
          for (const ts of searches) {
            const q = ts.title?.query || '';
            if (q && !relatedQueries.some((r) => r.query === q)) {
              relatedQueries.push({
                query: q,
                value: ts.formattedTraffic || 'N/A',
                formattedValue: ts.formattedTraffic || 'N/A',
                extracted_value:
                  typeof ts.formattedTraffic === 'string'
                    ? parseInt(ts.formattedTraffic.replace(/[^0-9]/g, '')) || 0
                    : 0,
                hasData: true,
                link: '',
                articles: ts.articles || [],
              });
            }
          }
        }
      }
    } catch (e) {
      console.warn('Gagal fetch daily trends, coba fallback explore');
    }

    // ===== 2. If keyword given, fetch related queries for that keyword =====
    if (keyword && timeRange) {
      try {
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

        if (exploreRes.ok) {
          const raw = await exploreRes.text();
          const jsonText = raw.replace(/^\)\]\}',?\n?/, '');
          const exploreData = JSON.parse(jsonText);
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
                      const queryName = item.query;
                      if (queryName && !relatedQueries.some((r) => r.query === queryName)) {
                        relatedQueries.push({
                          query: queryName,
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
          }
        }
      } catch (e) {
        console.warn('Gagal fetch related queries untuk keyword:', keyword);
      }
    }

    // ===== 3. Fetch Calendar Events =====
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
            const eventDate = new Date(
              event.date || event.tanggal || event.tanggal_perayaan
            );
            return (
              eventDate >=
              new Date(now.getFullYear(), now.getMonth(), now.getDate())
            );
          })
          .slice(0, 30)
          .map((event: any) => ({
            name:
              event.nama ||
              event.name ||
              event.perayaan ||
              event.keterangan ||
              'Unknown Event',
            date:
              event.date || event.tanggal || event.tanggal_perayaan || '',
            type:
              event.jenis ||
              event.type ||
              (event.is_national_holiday
                ? 'LIBUR NASIONAL'
                : 'PERINGATAN'),
            description: event.keterangan || event.description || '',
            isHoliday:
              event.is_national_holiday || event.is_holiday || false,
          }));
      }
    } catch {
      console.warn('Gagal fetch kalender event');
    }

    return NextResponse.json({
      keyword,
      timeRange,
      trends: relatedQueries.slice(0, 30),
      events: calendarEvents,
    });
  } catch (error) {
    console.error('Campaign Insight API Error:', error);
    return NextResponse.json(
      {
        error: 'Gagal mengambil data tren atau kalender',
        trends: [],
        events: [],
      },
      { status: 500 }
    );
  }
}