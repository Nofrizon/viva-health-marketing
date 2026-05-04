'use client'
import { useState } from 'react'

export default function SEOPage() {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const checkRank = async () => {
    if (!keyword) return alert("Masukkan kata kunci!");
    setLoading(true);

    try {
      const response = await fetch('/api/seo', {
        method: 'POST',
        body: JSON.stringify({ keyword }),
      });
      const data = await response.json();
      setResults(data);
    } catch (err) {
      alert("Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 text-black">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">SEO Rank Tracker</h1>
        <p className="text-gray-600 mb-8">Pantau posisi Viva Apotek di Google Maps</p>
        
        <div className="bg-white p-6 rounded-2xl shadow-md flex gap-3 mb-8">
          <input 
            type="text" 
            className="flex-1 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Contoh: Apotek Cibinong"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button 
            onClick={checkRank}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
          >
            {loading ? 'Mencari...' : 'Cek Urutan'}
          </button>
        </div>

        {results.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-900 text-white">
                <tr>
                  <th className="p-4 text-left">Posisi</th>
                  <th className="p-4 text-left">Nama Unit</th>
                  <th className="p-4 text-left">Rating & Ulasan</th>
                </tr>
              </thead>
              <tbody>
                {results.map((item) => (
                  <tr key={item.position} className={`border-b ${item.isViva ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}>
                    <td className="p-4 font-bold">{item.position}</td>
                    <td className="p-4">
                      {item.title} {item.isViva && <span className="ml-2 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">Unit Kita</span>}
                    </td>
                    <td className="p-4">
                      <span className="text-yellow-500">★</span> {item.rating || '0'} 
                      <span className="text-gray-400 text-sm ml-1">({item.reviews || 0})</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}