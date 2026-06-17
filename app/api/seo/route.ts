// app/api/seo/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const keyword = body.keyword?.trim();

    // Validasi input
    if (!keyword) {
      return NextResponse.json(
        { error: 'Keyword tidak boleh kosong' },
        { status: 400 }
      );
    }

    const apiKey = process.env.SERPAPI_KEY;
    if (!apiKey) {
      console.error('SERPAPI_KEY tidak ditemukan di environment variables');
      return NextResponse.json(
        { error: 'Konfigurasi API tidak lengkap' },
        { status: 500 }
      );
    }

    // Panggil SerpAPI
    const url = `https://serpapi.com/search.json?engine=google_maps&q=${encodeURIComponent(keyword)}&api_key=${apiKey}`;
    const response = await fetch(url, {
      next: { revalidate: 60 }, // cache 60 detik
    });

    if (!response.ok) {
      // Tangani kemungkinan error dari SerpAPI
      const errorData = await response.json().catch(() => ({}));
      console.error('SerpAPI error:', response.status, errorData);
      return NextResponse.json(
        { error: `Gagal mengambil data dari Google Maps (HTTP ${response.status})` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const results = data.local_results || [];

    // Ambil maksimal 10 hasil (untuk keperluan tracking)
    const topResults = results.slice(0, 10);

    // Format data
    const rankingData = topResults.map((item: any, index: number) => ({
      position: index + 1,
      title: item.title || 'Tidak diketahui',
      rating: item.rating || 0,
      reviews: item.reviews || 0,
      // Deteksi apakah ini cabang Viva (case insensitive)
      isViva: item.title?.toLowerCase().includes('viva apotek') || false,
    }));

    return NextResponse.json(rankingData);
  } catch (error) {
    console.error('Error di API route:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server' },
      { status: 500 }
    );
  }
}