import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      contentType,
      focusKeyword,
      lsiKeywords,
      targetWords,
      h2Count,
      needH3,
      h3PerH2,
      h2WithH3,
      brandVoice,
      toneVoice,
      greeting,
      ctaGoal,
      addFaq,
      addPlaceholder,
    } = body;

    if (!focusKeyword) {
      return NextResponse.json(
        { success: false, message: 'Focus Keyword wajib diisi.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.SUMOPOD_API_KEY;
    const baseUrl = process.env.SUMOPOD_BASE_URL;
    if (!apiKey || !baseUrl) {
      return NextResponse.json(
        { success: false, message: 'Server configuration error: SUMOPOD_API_KEY or SUMOPOD_BASE_URL missing.' },
        { status: 500 }
      );
    }

    let prompt = `Kamu adalah Copywriter SEO Senior di VivaContentMarketing. Buatlah konten dengan spesifikasi berikut:\n\n`;
    prompt += `- Tipe Konten: ${contentType || 'Artikel Informatif'}\n`;
    prompt += `- Focus Keyword: ${focusKeyword}\n`;
    prompt += `- LSI Keywords: ${lsiKeywords || '-'}\n`;
    prompt += `- Target Kata: ${targetWords || '~1500 Kata'}\n`;
    prompt += `- Jumlah H2 yang dibutuhkan: ${h2Count || 5}\n`;
    if (needH3) {
      prompt += `- Gunakan H3: ${h3PerH2 || 3} sub-heading H3 untuk minimal ${h2WithH3 || 2} heading H2.\n`;
    }
    prompt += `- Brand Voice: ${brandVoice || 'Profesional & Ahli'}\n`;
    prompt += `- Tone of Voice: ${toneVoice || 'Formal'}\n`;
    prompt += `- Sapaan Audiens: ${greeting || ''}\n`;
    prompt += `- Tujuan CTA: ${ctaGoal || ''}\n\n`;
    prompt += `**ATURAN SEO YOAST & E-E-A-T (WAJIB)**:
    1. Letakkan Focus Keyword di paragraf pertama dan di dalam minimal 1 H2.
    2. Panjang paragraf maksimal 3-4 kalimat.
    3. Gunakan kata transisi.
    4. Tunjukkan *Experience* dan *Expertise*.
    5. Tuliskan langsung dalam format HTML (<h1>, <h2>, <p>, <ul>). Jangan bungkus dengan markdown.
    6. ${addPlaceholder ? 'Sisipkan teks [Sisipkan Internal/External Link di sini] pada kata yang relevan.' : 'Tidak perlu placeholder link.'}
    7. ${addFaq ? 'Tambahkan FAQ (Q&A) di akhir dengan tag <h2>FAQ</h2>.' : 'Tidak perlu FAQ.'}`;

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-v4-flash',
        messages: [
          { role: 'system', content: 'Kamu adalah Copywriter SEO Senior yang handal menulis artikel berformat HTML murni.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 8000,
      }),
      signal: AbortSignal.timeout(60000),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`SumoPod AI error (${response.status}): ${errorData.error?.message || 'Unknown'}`);
    }

    const json = await response.json();
    if (!json.choices || json.choices.length === 0) {
      throw new Error('API SumoPod AI gagal mengembalikan respons konten.');
    }

    let htmlContent = json.choices[0].message.content;
    htmlContent = htmlContent.replace(/```html/g, '').replace(/```/g, '').trim();

    const seoMeta = {
      title: `${focusKeyword} Terbaik ${new Date().getFullYear()}`,
      slug: `/${focusKeyword.replace(/\s+/g, '-').toLowerCase()}`,
      density: '2.5',
    };

    return NextResponse.json({
      success: true,
      htmlContent,
      seoMeta,
    });
  } catch (error: any) {
    console.error('[Content Generator] Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}