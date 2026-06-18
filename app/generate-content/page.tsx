'use client';

import { useState } from 'react';

export default function ContentWriterPage() {
  // Form state
  const [contentType, setContentType] = useState('Artikel Informatif');
  const [focusKeyword, setFocusKeyword] = useState('');
  const [lsiKeywords, setLsiKeywords] = useState('');
  const [ctaGoal, setCtaGoal] = useState('');
  const [brandVoice, setBrandVoice] = useState('Profesional & Ahli');
  const [toneVoice, setToneVoice] = useState('Formal');
  const [greeting, setGreeting] = useState('');
  const [targetWords, setTargetWords] = useState('~1500 Kata');
  const [h2Count, setH2Count] = useState(5);
  const [needH3, setNeedH3] = useState(false);
  const [h3PerH2, setH3PerH2] = useState(3);
  const [h2WithH3, setH2WithH3] = useState(2);
  const [addFaq, setAddFaq] = useState(true);
  const [addPlaceholder, setAddPlaceholder] = useState(true);

  // Output state
  const [htmlOutput, setHtmlOutput] = useState('');
  const [seoMeta, setSeoMeta] = useState({ title: '', slug: '', density: '0' });
  const [isLoading, setIsLoading] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  // Hitung kata dari HTML
  const countWords = (html: string) => {
    const text = html.replace(/<[^>]*>/g, ' ');
    return text.split(/\s+/).filter(w => w.length > 0).length;
  };

  const generate = async () => {
    if (!focusKeyword.trim()) {
      alert('Focus Keyword wajib diisi!');
      return;
    }
    setIsLoading(true);
    setHasResult(false);
    try {
      const res = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
        }),
      });
      const data = await res.json();
      if (data.success) {
        setHtmlOutput(data.htmlContent);
        setSeoMeta(data.seoMeta);
        setHasResult(true);
        setWordCount(countWords(data.htmlContent));
      } else {
        alert('Error: ' + data.message);
        setHasResult(false);
      }
    } catch (err: any) {
      alert('Gagal: ' + err.message);
      setHasResult(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Format word count
  const getWordCountText = () => {
    if (wordCount >= 1000) return `~${Math.round(wordCount / 100) * 100}+ Kata`;
    return `~${wordCount} Kata`;
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100 font-sans text-gray-800">
      {/* Header */}
      <header className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-pen-nib text-blue-600 text-2xl"></i>
          <h1 className="text-xl font-bold">AutoWrite <span className="text-blue-600">SEO PRO</span></h1>
        </div>
        <div className="text-sm text-gray-500">
          <i className="fa-solid fa-user-circle text-lg align-middle mr-1"></i> Guest Mode
        </div>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {/* LEFT PANEL */}
        <section className="w-full md:w-1/2 lg:w-5/12 bg-white border-r overflow-y-auto p-6 space-y-8">
          {/* Content Setup */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2"><i className="fa-solid fa-layer-group text-blue-500 mr-2"></i>1. Pengaturan Konten</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Konten</label>
              <select value={contentType} onChange={e => setContentType(e.target.value)} className="w-full border border-gray-300 rounded-md p-2 text-sm bg-gray-50">
                <option>Artikel Listing (5 Produk, dll)</option>
                <option>Artikel Informatif</option>
                <option>Artikel Tutorial (How-To)</option>
                <option>Press Release</option>
                <option>Review Produk</option>
                <option>Deskripsi Produk</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Focus Keyword</label>
                <input type="text" value={focusKeyword} onChange={e => setFocusKeyword(e.target.value)} placeholder="Contoh: skincare lokal terbaik" className="w-full border border-gray-300 rounded-md p-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LSI Keywords</label>
                <input type="text" value={lsiKeywords} onChange={e => setLsiKeywords(e.target.value)} placeholder="Pisahkan dengan koma" className="w-full border border-gray-300 rounded-md p-2 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tujuan Call-to-Action (CTA)</label>
              <textarea value={ctaGoal} onChange={e => setCtaGoal(e.target.value)} rows={2} placeholder="Contoh: Ajak pembaca klik link promo..." className="w-full border border-gray-300 rounded-md p-2 text-sm"></textarea>
            </div>
          </div>

          {/* Voice & Tone */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2"><i className="fa-solid fa-bullhorn text-blue-500 mr-2"></i>2. Gaya Bahasa & Persona</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand Voice</label>
                <select value={brandVoice} onChange={e => setBrandVoice(e.target.value)} className="w-full border border-gray-300 rounded-md p-2 text-sm bg-gray-50">
                  <option>Profesional & Ahli</option>
                  <option>Edukasi & Informatif</option>
                  <option>Inspiratif</option>
                  <option>Santai & Kasual</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tone of Voice</label>
                <select value={toneVoice} onChange={e => setToneVoice(e.target.value)} className="w-full border border-gray-300 rounded-md p-2 text-sm bg-gray-50">
                  <option>Formal</option>
                  <option>Friendly / Hangat</option>
                  <option>Humoris</option>
                  <option>Empatik</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kata Sapaan Audiens</label>
              <input type="text" value={greeting} onChange={e => setGreeting(e.target.value)} placeholder="Contoh: Halo Sobat, Hai Moms, dll" className="w-full border border-gray-300 rounded-md p-2 text-sm" />
            </div>
          </div>

          {/* Structure */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2"><i className="fa-solid fa-list-ol text-blue-500 mr-2"></i>3. Struktur Artikel</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Jumlah Kata</label>
                <select value={targetWords} onChange={e => setTargetWords(e.target.value)} className="w-full border border-gray-300 rounded-md p-2 text-sm bg-gray-50">
                  <option>~700 Kata</option>
                  <option>~1000 Kata</option>
                  <option>~1500 Kata</option>
                  <option>2000+ Kata (Long Form)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Heading 2 (H2)</label>
                <input type="number" min={2} max={15} value={h2Count} onChange={e => setH2Count(parseInt(e.target.value) || 5)} className="w-full border border-gray-300 rounded-md p-2 text-sm" />
              </div>
            </div>

            <div className="border border-gray-200 p-3 rounded-md bg-gray-50">
              <div className="flex items-center mb-2">
                <input type="checkbox" id="needH3" checked={needH3} onChange={e => setNeedH3(e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
                <label htmlFor="needH3" className="ml-2 text-sm font-medium text-gray-700">Gunakan Heading 3 (H3)</label>
              </div>
              {needH3 && (
                <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-gray-200">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Jml H3 per H2</label>
                    <input type="number" min={1} value={h3PerH2} onChange={e => setH3PerH2(parseInt(e.target.value) || 3)} className="w-full border border-gray-300 rounded-md p-1.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Jml H2 yg dipecah ke H3</label>
                    <input type="number" min={1} value={h2WithH3} onChange={e => setH2WithH3(parseInt(e.target.value) || 2)} className="w-full border border-gray-300 rounded-md p-1.5 text-sm" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="flex items-center">
                <input type="checkbox" checked={addFaq} onChange={e => setAddFaq(e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
                <span className="ml-2 text-sm text-gray-700">Tambahkan FAQ (Q&A) di akhir artikel</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" checked={addPlaceholder} onChange={e => setAddPlaceholder(e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
                <span className="ml-2 text-sm text-gray-700">Sisipkan Placeholder Internal/External Link</span>
              </label>
            </div>
          </div>

          <div className="pt-4 pb-10">
            <button onClick={generate} disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md shadow-lg transition flex justify-center items-center gap-2 disabled:opacity-70">
              {isLoading ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin"></i> Generating...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-wand-magic-sparkles"></i> Generate Content
                </>
              )}
            </button>
          </div>
        </section>

        {/* RIGHT PANEL */}
        <section className="w-full md:w-1/2 lg:w-7/12 bg-gray-50 flex flex-col relative overflow-hidden">
          {/* Empty State */}
          {!hasResult && !isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-8 text-center z-10">
              <i className="fa-regular fa-file-lines text-6xl mb-4 text-gray-300"></i>
              <h3 className="text-xl font-medium text-gray-500 mb-2">Area Preview & Hasil</h3>
              <p className="text-sm">Isi form pengaturan di sebelah kiri lalu klik "Generate Content" untuk melihat hasil tulisan AI dan analisis SEO Yoast di sini.</p>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center z-20">
              <i className="fa-solid fa-circle-notch fa-spin text-5xl text-blue-600 mb-4"></i>
              <h3 className="text-lg font-semibold text-gray-800">AI Sedang Menulis...</h3>
              <p className="text-sm text-gray-500 mt-2">Menerapkan E-E-A-T dan Standar SEO Yoast</p>
            </div>
          )}

          {/* Results */}
          {hasResult && !isLoading && (
            <div className="flex-1 flex flex-col h-full z-30 bg-white">
              <div className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center shrink-0 shadow-sm">
                <h2 className="font-bold text-gray-800"><i className="fa-solid fa-check-circle text-green-500 mr-2"></i>Hasil Generasi</h2>
                <button onClick={() => { navigator.clipboard.writeText(htmlOutput); alert('HTML disalin!'); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition flex items-center gap-2 shadow-sm">
                  <i className="fa-regular fa-copy"></i> Copy HTML
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Editor */}
                <div className="xl:col-span-2 flex flex-col border border-gray-200 rounded-md shadow-sm bg-white overflow-hidden">
                  <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 text-xs font-semibold text-gray-600 flex justify-between">
                    <span>RICH TEXT EDITOR</span>
                    <span>{getWordCountText()}</span>
                  </div>
                  <div
                    className="p-6 focus:outline-none flex-1 overflow-y-auto prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: htmlOutput }}
                  />
                </div>

                {/* SEO Panel */}
                <div className="xl:col-span-1 space-y-4">
                  <div className="bg-white border border-gray-200 rounded-md shadow-sm p-4">
                    <h3 className="font-bold text-gray-800 mb-3 text-sm flex items-center gap-2">
                      <span className="text-lg">🔴🟡🟢</span> Analisis SEO
                    </h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2"><span className="w-3 h-3 rounded-full bg-green-500 mt-1 shrink-0"></span><span>Konten berhasil dibuat.</span></li>
                      <li className="flex items-start gap-2"><span className="w-3 h-3 rounded-full bg-yellow-500 mt-1 shrink-0"></span><span>Periksa kembali penempatan keyword.</span></li>
                    </ul>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-md shadow-sm p-4">
                    <h3 className="font-bold text-gray-800 mb-3 text-sm flex items-center gap-2">
                      <i className="fa-solid fa-shield-halved text-blue-500"></i> E-E-A-T Checklist
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      {['Experience', 'Expertise', 'Authoritativeness', 'Trustworthiness'].map(item => (
                        <div key={item} className="flex justify-between items-center border-b py-1 last:border-0">
                          <span>{item}</span>
                          <i className="fa-solid fa-check text-green-500"></i>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-md shadow-sm p-4">
                    <h3 className="font-bold text-gray-800 mb-3 text-sm flex items-center gap-2">
                      <i className="fa-solid fa-tags text-orange-500"></i> Rekomendasi Meta
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Judul SEO</label>
                        <div className="bg-gray-50 border border-gray-200 p-2 rounded text-sm text-blue-700">{seoMeta.title}</div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Slug URL</label>
                        <div className="bg-gray-50 border border-gray-200 p-2 rounded text-sm text-green-700">{seoMeta.slug}</div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Keyword Density</label>
                        <div className="flex items-center gap-2 text-xs">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${parseFloat(seoMeta.density) * 10 || 25}%` }}></div>
                          </div>
                          <span className="font-medium">{seoMeta.density}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}