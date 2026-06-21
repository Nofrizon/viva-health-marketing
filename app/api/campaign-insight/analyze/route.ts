// app/api/campaign-insight/analyze/route.ts
// DeepSeek-powered Campaign Blueprint & Insight Generator
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      campaignName,
      campaignGoal,
      campaignDesc,
      campaignMonth,
      campaignYear,
      selectedKeyword,
      selectedEventName,
      selectedEventDate,
      trendContext,
    } = body;

    const apiKey = process.env.SUMOPOD_API_KEY;
    const baseUrl = process.env.SUMOPOD_BASE_URL;

    if (!apiKey || !baseUrl) {
      return NextResponse.json(
        { error: 'Server configuration error: SUMOPOD_API_KEY or SUMOPOD_BASE_URL missing.' },
        { status: 500 }
      );
    }

    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ];

    const campaignPeriod = `${monthNames[(campaignMonth || 1) - 1]} ${campaignYear || new Date().getFullYear()}`;
    const trendInfo = selectedKeyword
      ? `Keyword Trend yang dipilih: "${selectedKeyword}". ${trendContext || ''}`
      : 'Tidak ada keyword trend spesifik yang dipilih.';
    const eventInfo = selectedEventName
      ? `Event/Momentum: "${selectedEventName}" (${selectedEventDate || 'TBD'}).`
      : 'Tidak ada event spesifik yang dipilih.';

    const systemPrompt = `Anda adalah Senior Digital Campaign Manager & Content Strategist dengan 12+ tahun pengalaman di industri kesehatan dan farmasi. Anda merancang campaign untuk brand apotek dan klinik kesehatan.

TUGAS: Buat BLUEPRINT CAMPAIGN profesional dan komprehensif dalam Bahasa Indonesia.

Format respons WAJIB (gunakan Markdown):

## 📋 BLUEPRINT CAMPAIGN
### Ringkasan Eksekutif
[1-2 paragraf singkat menjelaskan esensi campaign, unique value proposition, dan target audiens. Tone: profesional dan strategis]

### SMART Goals
- **Specific:** [tujuan spesifik]
- **Measurable:** [metrik yang bisa diukur: reach, engagement, conversion, dll]
- **Achievable:** [mengapa realistis]
- **Relevant:** [relevansi dengan brand & momentum]
- **Time-bound:** [timeline pencapaian]

### Key Message & USP
[Pesan utama campaign dan unique selling proposition yang membedakan dari kompetitor]

---

## 🎨 CONTENT PLAN
| Fase | Durasi | Konten | Platform | Objective | KPI |
|------|--------|--------|----------|-----------|-----|
| **Phase 1: Awareness** | [hari] | [jenis konten spesifik] | Instagram, TikTok | Reach & brand awareness | [KPI] |
| **Phase 2: Engagement** | [hari] | [jenis konten spesifik] | Instagram, TikTok, Facebook | Engagement & interaction | [KPI] |
| **Phase 3: Conversion** | [hari] | [jenis konten spesifik] | WhatsApp, Website | Lead & conversion | [KPI] |
| **Phase 4: Retention** | [hari] | [jenis konten spesifik] | Email, WhatsApp | Loyalty & repeat | [KPI] |

### Content Pillars
1. **Edukasi** – [topik konten edukasi]
2. **Inspirasi** – [topik konten inspirasi]
3. **Promosi** – [topik konten promosi]
4. **Entertainment** – [topik konten entertainment/relatable]

### 5 Ide Konten Utama
1. [Ide konten 1 – detail singkat, platform, format]
2. [Ide konten 2 – detail singkat, platform, format]
3. [Ide konten 3 – detail singkat, platform, format]
4. [Ide konten 4 – detail singkat, platform, format]
5. [Ide konten 5 – detail singkat, platform, format]

---

## 📊 EXECUTION PLAYBOOK
### Timeline
[Timeline detail per minggu dalam periode campaign]

### Budget Allocation (estimasi)
- Content Production: [%]
- Paid Ads / Boost: [%]
- Influencer / KOL: [%]
- Tools & Platform: [%]
- Contingency: [%]

### Channel Strategy
- **Instagram:** [strategi spesifik, format konten, frekuensi posting]
- **TikTok:** [strategi spesifik, format konten, frekuensi posting]
- **WhatsApp:** [strategi broadcast/community]
- **Website/Landing Page:** [strategi konversi]

---

## 🔮 AI INSIGHT & REKOMENDASI
### Analisis Momentum
[Analisis bagaimana keyword trend dan event kalender bisa dimanfaatkan maksimal. Data-driven insight.]

### Prediksi Performance
[Proyeksi realistis dengan estimasi metrik: reach, engagement rate, conversion rate]

### Risk & Mitigasi
| Risiko | Probability | Impact | Mitigasi |
|--------|-------------|--------|----------|
| [Risiko 1] | [Tinggi/Medium/Rendah] | [Tinggi/Medium/Rendah] | [Cara mitigasi] |

### Quick Wins (7 Hari Pertama)
- [ ] [Quick win 1]
- [ ] [Quick win 2]
- [ ] [Quick win 3]

---

### Rekomendasi Final
[3-5 rekomendasi strategis final sebagai penutup blueprint]`;

    const userMessage = `Tolong buatkan blueprint campaign profesional dengan detail berikut:

NAMA CAMPAIGN: ${campaignName || 'Campaign Kesehatan'}
GOAL CAMPAIGN: ${campaignGoal || 'Meningkatkan brand awareness dan penjualan'}
DESKRIPSI: ${campaignDesc || 'Campaign marketing untuk brand kesehatan'}
PERIODE: ${campaignPeriod}
${trendInfo}
${eventInfo}

Buat blueprint yang actionable dan realistis untuk brand apotek/klinik kesehatan di Indonesia. Gunakan data-driven insight.`;

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-v4-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
      signal: AbortSignal.timeout(60000),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`SumoPod AI error (${response.status}): ${errorData.error?.message || 'Unknown'}`);
    }

    const result = await response.json();
    if (!result.choices || !result.choices[0]?.message?.content) {
      throw new Error('Respons AI tidak valid.');
    }

    const aiContent = result.choices[0].message.content.trim();

    return NextResponse.json({
      success: true,
      campaignName: campaignName || 'Campaign Kesehatan',
      trendName: selectedKeyword || 'tren terkini',
      eventName: selectedEventName || null,
      blueprint: aiContent,
    });
  } catch (error: any) {
    console.error('[Campaign Analyzer] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}