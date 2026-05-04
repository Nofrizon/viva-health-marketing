'use client'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* 1. NAVBAR / MENU ATAS */}
      <nav className="flex justify-between items-center p-6 border-b">
        <div className="text-2xl font-bold text-blue-600">Viva Health Marketing</div>
        <div className="flex gap-6 items-center">
          <Link href="/seo" className="hover:text-blue-600 font-medium">SEO Tracker</Link>
          <Link href="/audit" className="hover:text-blue-600 font-medium">Audit System</Link>
          {/* Tombol Login */}
          <button className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700 transition">
            Log In
          </button>
        </div>
      </nav>

      {/* 2. HERO SECTION / BAGIAN UTAMA */}
      <main className="max-w-6xl mx-auto mt-20 px-6 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
          Kelola Reputasi Apotek <br />
          <span className="text-blue-600">Secara Otomatis dengan AI</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Pantau ranking Google Maps dan audit ulasan pelanggan di seluruh cabang Viva Apotek menggunakan teknologi kecerdasan buatan.
        </p>

        {/* 3. MENU KARTU PILIHAN */}
        <div className="grid md:grid-cols-2 gap-8 mt-12">
          {/* Kartu SEO */}
          <div className="p-8 border rounded-3xl hover:shadow-xl transition text-left">
            <div className="text-4xl mb-4">📍</div>
            <h3 className="text-2xl font-bold mb-2">Local SEO Tracker</h3>
            <p className="text-gray-600 mb-6">Cek urutan cabang apotek Anda di hasil pencarian Google Maps secara real-time.</p>
            <Link href="/seo" className="text-blue-600 font-bold hover:underline">Buka Tracker →</Link>
          </div>

          {/* Kartu Audit */}
          <div className="p-8 border rounded-3xl hover:shadow-xl transition text-left">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-2xl font-bold mb-2">AI Review Audit</h3>
            <p className="text-gray-600 mb-6">Analisis ulasan negatif pelanggan secara tajam dengan Senior Auditor berbasis AI.</p>
            <Link href="/audit" className="text-blue-600 font-bold hover:underline">Buka Audit System →</Link>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="mt-20 py-10 border-t text-center text-gray-400 text-sm">
        © 2026 VivaApotek Business Suite. Seluruh Hak Cipta Dilindungi.
      </footer>
    </div>
  )
}