'use client'
import Link from 'next/link'
import { ArrowRight, MapPin, Shield, BarChart3, Zap, CheckCircle } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center text-white font-bold">
              VA
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Viva Suite</h1>
          </div>
          <div className="flex items-center gap-8">
            <Link href="/seo" className="text-gray-700 hover:text-blue-600 font-medium transition">
              SEO Tracker
            </Link>
            <Link href="/audit" className="text-gray-700 hover:text-blue-600 font-medium transition">
              AI Audit
            </Link>
            <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition">
              Log In
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <div className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              🚀 Powered by AI
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Kelola Reputasi Apotek <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">Secara Otomatis</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Pantau ranking Google Maps, analisis ulasan pelanggan, dan tingkatkan reputasi digital Anda dengan AI Senior Auditor. Satu platform untuk seluruh kebutuhan marketing Anda.
            </p>
            <div className="flex gap-4">
              <Link href="/seo" className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-xl transition flex items-center gap-2">
                Mulai Tracking <ArrowRight size={18} />
              </Link>
              <Link href="/audit" className="border-2 border-gray-300 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:border-blue-600 hover:bg-blue-50 transition">
                Lihat AI Audit
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl opacity-20 blur-3xl"></div>
            <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-transparent rounded-lg">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MapPin className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">SEO Ranking</p>
                    <p className="text-sm text-gray-600">Real-time tracking</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-transparent rounded-lg">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Shield className="text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">AI Audit</p>
                    <p className="text-sm text-gray-600">Smart analysis</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-50 to-transparent rounded-lg">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Analytics</p>
                    <p className="text-sm text-gray-600">Detailed reports</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mb-6">
              <MapPin className="text-blue-600" size={28} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Local SEO Tracker</h3>
            <p className="text-gray-600 mb-6">Cek posisi cabang Anda di Google Maps secara real-time. Ketahui di mana Anda berada dibandingkan kompetitor.</p>
            <Link href="/seo" className="text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-2">
              Akses Tracker <ArrowRight size={16} />
            </Link>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mb-6">
              <Shield className="text-purple-600" size={28} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">AI Review Audit</h3>
            <p className="text-gray-600 mb-6">Senior Auditor AI menganalisis ulasan negatif dan memberikan rekomendasi actionable untuk improvement.</p>
            <Link href="/audit" className="text-purple-600 font-semibold hover:text-purple-700 flex items-center gap-2">
              Jalankan Audit <ArrowRight size={16} />
            </Link>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center mb-6">
              <Zap className="text-emerald-600" size={28} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Automation</h3>
            <p className="text-gray-600 mb-6">Semua proses berjalan otomatis. Dapatkan insights dan rekomendasi tanpa perlu monitoring manual.</p>
            <Link href="/audit" className="text-emerald-600 font-semibold hover:text-emerald-700 flex items-center gap-2">
              Explore <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12 text-white mb-20">
          <h2 className="text-4xl font-bold mb-12">Mengapa Viva Suite?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              'Monitor semua cabang dari satu dashboard',
              'AI-powered insights untuk decision making',
              'Real-time Google Maps ranking tracking',
              'Automated review analysis & recommendations',
              'Detailed audit reports untuk setiap branch',
              'Easy integration dengan workflow existing'
            ].map((benefit, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                  <CheckCircle size={20} />
                </div>
                <p className="text-lg">{benefit}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Siap meningkatkan reputasi digital Anda?</h2>
          <p className="text-xl text-gray-600 mb-8">Mulai sekarang dan rasakan perbedaannya dalam 24 jam.</p>
          <Link href="/seo" className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white px-10 py-4 rounded-lg font-bold text-lg hover:shadow-xl transition">
            Mulai Gratis Sekarang
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-gray-400 py-12 mt-20 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold mb-4">Viva Suite</h3>
              <p className="text-sm">Platform manajemen reputasi digital untuk apotek modern.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/seo" className="hover:text-white transition">SEO Tracker</Link></li>
                <li><Link href="/audit" className="hover:text-white transition">AI Audit</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm">
            <p>© 2026 Viva Suite. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
