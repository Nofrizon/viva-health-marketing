import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Type definitions
interface ReviewData {
  rating: number;
  text: string | null;
  author: string | null;
  date: string;
}

interface AuditMetrics {
  total: number;
  bad: number;
  good: number;
  sum: number;
}

interface AuditResult {
  name: string;
  avg_rating: string;
  total: number;
  bad: number;
  good: number;
  ai_report: string;
  raw_reviews: ReviewData[];
  timestamp: string;
  audit_period: string;
}

// Validate environment variables
function validateEnv(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!process.env.SERPAPI_KEY) {
    errors.push('SERPAPI_KEY is not defined');
  }
  if (!process.env.GROQ_API_KEY) {
    errors.push('GROQ_API_KEY is not defined');
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is not defined');
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Helper: Parse date string ke dalam hari
function parseDateToDays(dateStr: string): number | null {
  const lower = dateStr.toLowerCase().trim();
  
  // Pattern: "X jam lalu" / "X hours ago"
  const hourMatch = lower.match(/(\d+)\s*(jam|hour)/);
  if (hourMatch) return 0; // Same day
  
  // Pattern: "X hari lalu" / "X days ago"
  const dayMatch = lower.match(/(\d+)\s*(hari|day)/);
  if (dayMatch) return parseInt(dayMatch[1]);
  
  // Pattern: "1 minggu / minggu lalu" / "week ago"
  if (/minggu|week/.test(lower)) return 7;
  
  // Pattern: "1 bulan lalu" / "1 month ago"
  if (/1\s*(bulan|month)/.test(lower)) return 30;
  
  // Pattern: "2-3 bulan lalu" / "2-3 months ago"
  if (/(2|3)\s*(bulan|month)/.test(lower)) return 60;
  
  // Pattern: "Baru" / "Recently" / "Just now"
  if (/baru|baru saja|just|recently|baru-baru/.test(lower)) return 0;
  
  return null; // Can't parse
}

// Helper: Check if review is within date range
function isReviewInRange(dateStr: string, daysFilter: number): boolean {
  const daysParsed = parseDateToDays(dateStr);
  
  if (daysParsed === null) return false; // Can't determine
  
  if (daysFilter === 30) {
    return daysParsed <= 30;
  } else if (daysFilter === 90) {
    return daysParsed <= 90;
  }
  
  return false;
}

// Helper: Chunk array untuk prevent token overflow
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// Helper: Format review untuk AI consumption
function formatReviewsForAI(reviews: ReviewData[]): string {
  if (reviews.length === 0) {
    return "Tidak ada ulasan negatif.";
  }

  return reviews
    .map((r, idx) => `[${idx + 1}] Rating: ${r.rating}★ | Author: ${r.author || 'Anonim'}\nUlasan: ${r.text}`)
    .join('\n\n');
}

// Helper: Call Groq API dengan error handling
async function callGroqAPI(
  unitName: string,
  reviewsText: string,
  apiKey: string
): Promise<string> {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `Anda adalah Senior Auditor Viva Apotek dengan 10 tahun pengalaman manajemen kualitas layanan farmasi.

Tugas Anda: Analisis ulasan pelanggan negatif untuk mengidentifikasi:
1. ROOT CAUSE masalah (staff, sistem, stok, kebersihan, dll)
2. POLA masalah (berulang atau insiden tunggal)
3. REKOMENDASI AKSI konkret untuk ditindaklanjuti pihak unit

Format Respons WAJIB:
### RINGKASAN MASALAH
[Summary singkat dalam 1-2 baris]

### MASALAH UTAMA (urutkan by severity)
1. [Masalah] - Frekuensi: [berapa kali]/Severity: [tinggi/medium/rendah]
2. [Masalah] - Frekuensi: [berapa kali]/Severity: [tinggi/medium/rendah]

### ANALISIS ROOT CAUSE
- Penyebab 1: [detail]
- Penyebab 2: [detail]

### REKOMENDASI TINDAKAN
1. URGENT (implementasi < 1 minggu):
   - [Tindakan spesifik dengan KPI]
   - [Tindakan spesifik dengan KPI]

2. SHORT-TERM (1-4 minggu):
   - [Tindakan dengan target]

3. LONG-TERM (> 1 bulan):
   - [Tindakan strategis]

### PROGNOSIS
Estimasi improvement setelah implementasi: [%]`
          },
          {
            role: 'user',
            content: `UNIT: ${unitName}\n\nULASAN PELANGGAN NEGATIF:\n${reviewsText}`
          }
        ],
        temperature: 0.3, // Lebih rendah untuk konsistensi format
        max_tokens: 1500
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Groq API error (${response.status}): ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('Invalid Groq response: no choices');
    }

    return data.choices[0].message.content.trim();
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Groq API call failed: ${errorMsg}`);
  }
}

// Helper: Save audit to Supabase
async function saveAuditToDatabase(auditData: any): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('audit_results')
      .insert([{
        nama_unit: auditData.name,
        avg_rating: auditData.avg_rating,
        total_review: auditData.total,
        jumlah_negatif: auditData.bad,
        jumlah_positif: auditData.good,
        analisis_ai: auditData.ai_report,
        audit_date: new Date().toISOString(),
        audit_period_days: auditData.audit_period
      }]);

    if (error) {
      console.error('Supabase insert error:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Database save failed:', error);
    return false;
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  // Validate environment variables
  const envCheck = validateEnv();
  if (!envCheck.valid) {
    return NextResponse.json(
      {
        error: 'Server configuration error',
        details: envCheck.errors,
        message: 'Some required environment variables are missing. Please contact administrator.'
      },
      { status: 500 }
    );
  }

  try {
    // Parse request
    let query: string;
    let days: number;

    try {
      const body = await request.json();
      query = body.query?.trim();
      days = body.days;

      if (!query || !query.length) {
        return NextResponse.json(
          { error: 'Validation error', message: 'Query parameter is required' },
          { status: 400 }
        );
      }

      if (![30, 90].includes(days)) {
        return NextResponse.json(
          { error: 'Validation error', message: 'Days must be 30 or 90' },
          { status: 400 }
        );
      }
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid request body', message: 'Request must be valid JSON' },
        { status: 400 }
      );
    }

    const SERPAPI_KEY = process.env.SERPAPI_KEY!;
    const GROQ_API_KEY = process.env.GROQ_API_KEY!;

    // Step 1: Search for pharmacy branch
    console.log(`[Audit] Searching for: ${query}`);
    
    const fullQuery = query.toLowerCase().includes('viva apotek') 
      ? query 
      : `Viva Apotek ${query}`;

    // ✅ PERBAIKAN: gunakan signal timeout sebagai pengganti timeout
    const searchRes = await fetch(
      `https://serpapi.com/search.json?engine=google_maps&q=${encodeURIComponent(fullQuery)}&api_key=${SERPAPI_KEY}`,
      { signal: AbortSignal.timeout(10000) }
    );

    if (!searchRes.ok) {
      throw new Error(`SerpAPI search failed (${searchRes.status})`);
    }

    const searchData = await searchRes.json();
    const place = searchData.place_results?.at(0) || searchData.local_results?.at(0);

    if (!place || !place.data_id) {
      return NextResponse.json(
        { error: 'Not found', message: `Cabang apotek "${query}" tidak ditemukan di Google Maps` },
        { status: 404 }
      );
    }

    console.log(`[Audit] Found: ${place.title}`);

    // Step 2: Fetch reviews
    console.log(`[Audit] Fetching reviews for: ${place.title}`);
    
    // ✅ PERBAIKAN: gunakan signal timeout sebagai pengganti timeout
    const reviewsRes = await fetch(
      `https://serpapi.com/search.json?engine=google_maps_reviews&data_id=${place.data_id}&api_key=${SERPAPI_KEY}&sort_by=newest&hl=id`,
      { signal: AbortSignal.timeout(10000) }
    );

    if (!reviewsRes.ok) {
      throw new Error(`SerpAPI reviews fetch failed (${reviewsRes.status})`);
    }

    const reviewsData = await reviewsRes.json();
    const allReviews = reviewsData.reviews || [];

    console.log(`[Audit] Retrieved ${allReviews.length} total reviews`);

    // Step 3: Process reviews with time filtering
    const metrics: AuditMetrics = { total: 0, bad: 0, good: 0, sum: 0 };
    const textForAi: string[] = [];
    const rawReviews: ReviewData[] = [];

    allReviews.forEach((r: any) => {
      const rating = parseInt(r.rating, 10) || 0;
      const dateLabel = r.date || 'Unknown';
      const inRange = isReviewInRange(dateLabel, days);

      if (inRange) {
        metrics.total++;
        metrics.sum += rating;

        const reviewData: ReviewData = {
          rating,
          text: r.text || null,
          author: r.user?.name || null,
          date: dateLabel
        };

        if (rating <= 3) {
          metrics.bad++;
          rawReviews.push(reviewData);
          if (r.text) {
            textForAi.push(`[${rating}★] ${r.text}`);
          }
        } else {
          metrics.good++;
        }
      }
    });

    console.log(`[Audit] Filtered to ${metrics.total} reviews (${metrics.bad} negative, ${metrics.good} positive)`);

    const avg = metrics.total > 0 
      ? (metrics.sum / metrics.total).toFixed(2) 
      : '0.00';

    // Step 4: AI Analysis
    let aiReport = `✅ KINERJA BAIK\n\nUnit ${place.title} menunjukkan performa positif dengan tidak ada ulasan negatif dalam periode audit. Teruskan menjaga kualitas layanan!`;

    if (textForAi.length > 0) {
      console.log(`[Audit] Starting AI analysis for ${textForAi.length} negative reviews...`);
      
      try {
        const reviewsText = formatReviewsForAI(rawReviews);
        aiReport = await callGroqAPI(place.title, reviewsText, GROQ_API_KEY);
        console.log('[Audit] AI analysis completed successfully');
      } catch (aiError) {
        const errorMsg = aiError instanceof Error ? aiError.message : 'Unknown error';
        console.error(`[Audit] AI analysis failed: ${errorMsg}`);
        
        // Fallback AI report
        aiReport = `⚠️ ANALISIS AI GAGAL\n\nTerjadi kesalahan saat memproses AI. Namun, kami berhasil mengidentifikasi ${metrics.bad} ulasan negatif:\n\n${textForAi.slice(0, 5).join('\n\n')}\n\nSilakan hubungi administrator untuk mendapatkan analisis lengkap.`;
      }
    }

    // Step 5: Save to database
    const auditPayload = {
      name: place.title,
      avg_rating: parseFloat(avg),
      total: metrics.total,
      bad: metrics.bad,
      good: metrics.good,
      ai_report: aiReport,
      timestamp: new Date().toISOString(),
      audit_period: `${days} hari`
    };

    const dbSaved = await saveAuditToDatabase(auditPayload);
    console.log(`[Audit] Database save: ${dbSaved ? 'SUCCESS' : 'FAILED'}`);

    // Step 6: Return response
    const result: AuditResult = {
      ...auditPayload,
      raw_reviews: rawReviews,
      avg_rating: avg
    };

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Audit] Fatal error: ${errorMsg}`, error);

    return NextResponse.json(
      {
        error: 'Audit failed',
        message: 'Terjadi kesalahan saat melakukan audit. Silakan coba lagi atau hubungi support.',
        details: process.env.NODE_ENV === 'development' ? errorMsg : undefined
      },
      { status: 500 }
    );
  }
}