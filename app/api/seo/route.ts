import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { keyword } = await request.json();
  const apiKey = process.env.SERPAPI_KEY; // Diambil dari file .env.local

  try {
    const response = await fetch(
      `https://serpapi.com/search.json?engine=google_maps&q=${encodeURIComponent(keyword)}&api_key=${apiKey}`
    );
    const data = await response.json();
    const results = data.local_results || [];

    // Format data agar sama seperti versi AppScript lama Anda
    const rankingData = results.map((item: any, index: number) => ({
      position: index + 1,
      title: item.title,
      rating: item.rating,
      reviews: item.reviews,
      isViva: item.title.toLowerCase().includes("viva apotek")
    }));

    return NextResponse.json(rankingData);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal ambil data Maps' }, { status: 500 });
  }
}