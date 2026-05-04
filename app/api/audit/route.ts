import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  const { query, days } = await request.json();
  const SERPAPI_KEY = process.env.SERPAPI_KEY;
  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  try {
    const fullQuery = query.toLowerCase().startsWith("viva apotek") ? query : "Viva Apotek " + query;
    const searchRes = await fetch(`https://serpapi.com/search.json?engine=google_maps&q=${encodeURIComponent(fullQuery)}&api_key=${SERPAPI_KEY}`);
    const searchData = await searchRes.json();
    const place = searchData.place_results || (searchData.local_results ? searchData.local_results[0] : null);

    if (!place) return NextResponse.json({ error: "Cabang tidak ditemukan" }, { status: 404 });

    // Mengambil reviews (support pagination untuk data lebih banyak)
    const reviewsRes = await fetch(`https://serpapi.com/search.json?engine=google_maps_reviews&data_id=${place.data_id}&api_key=${SERPAPI_KEY}&sort_by=newest&hl=id`);
    const reviewsData = await reviewsRes.json();
    const allReviews = reviewsData.reviews || [];

    let metrics = { total: 0, bad: 0, good: 0, sum: 0 };
    let textForAi: string[] = [];
    let rawReviews: any[] = [];

    allReviews.forEach((r: any) => {
      const rating = parseInt(r.rating || 0);
      const dateLabel = (r.date || "").toLowerCase();

      // Logika Filter Waktu Dinamis (mirip code.gs)
      const isRecent = /jam|hari|minggu|baru|week|day|hour/.test(dateLabel);
      const isOneMonth = /1 bulan|1 month/.test(dateLabel);
      const isThreeMonths = /(2|3) (bulan|month)/.test(dateLabel);
      
      let inRange = (days === 30) ? (isRecent || isOneMonth) : (isRecent || isOneMonth || isThreeMonths);

      if (inRange) {
        metrics.total++;
        metrics.sum += rating;
        if (rating <= 3) {
          metrics.bad++;
          rawReviews.push({ rating, text: r.text || "(Tanpa teks)", author: r.user?.name });
          if (r.text) textForAi.push(`[${rating}*] ${r.text}`);
        } else {
          metrics.good++;
        }
      }
    });

    const avg = metrics.total > 0 ? (metrics.sum / metrics.total).toFixed(1) : "0.0";

    // AI Analysis (Groq)
    let aiReport = "Kinerja aman.";
    if (textForAi.length > 0) {
      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: "Anda Senior Auditor Viva Apotek. Analisis ulasan negatif secara tajam. Fokus pada kegagalan staf. FORMAT: Masalah Utama: ... Rekomendasi: ..." },
            { role: "user", content: `UNIT: ${place.title}\nULASAN:\n${textForAi.join("\n")}` }
          ],
          temperature: 0.1
        })
      });
      const groqData = await groqRes.json();
      aiReport = groqData.choices[0].message.content;
    }

    // Simpan ke database sesuai nama toko (Audit_DB)
    await supabase.from('audit_results').insert([{
      nama_unit: place.title,
      avg_rating: parseFloat(avg),
      total_review: metrics.total,
      jumlah_negatif: metrics.bad,
      jumlah_positif: metrics.good,
      analisis_ai: aiReport
    }]);

    return NextResponse.json({
      name: place.title,
      avg_rating: avg,
      total: metrics.total,
      bad: metrics.bad,
      good: metrics.good,
      ai_report: aiReport,
      raw_reviews: rawReviews
    });
  } catch (error) {
    return NextResponse.json({ error: "Gagal audit" }, { status: 500 });
  }
}