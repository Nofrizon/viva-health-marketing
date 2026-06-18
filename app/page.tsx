import Link from 'next/link';

export default function DashboardPage() {
  const features = [
    {
      title: 'Audit Reputasi',
      desc: 'Analisis ulasan Google Maps unit apotek.',
      href: '/audit',
      icon: '🔍',
    },
    {
      title: 'SEO Analyzer',
      desc: 'Periksa SEO dan performa halaman.',
      href: '/seo',
      icon: '📈',
    },
    {
      title: 'Caption Generator',
      desc: 'Buat caption sosmed dengan AI.',
      href: '/generate-caption',
      icon: '✍️',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Viva Health Marketing</h1>
      <p className="text-gray-500 mb-10">Pilih alat yang ingin digunakan</p>
      <div className="grid gap-6 md:grid-cols-3 max-w-4xl w-full">
        {features.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition flex flex-col items-center text-center gap-3"
          >
            <span className="text-4xl">{f.icon}</span>
            <h2 className="text-lg font-semibold text-gray-800">{f.title}</h2>
            <p className="text-sm text-gray-500">{f.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}