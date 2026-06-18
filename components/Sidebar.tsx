'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Target, PenTool, Hash, ClipboardCheck, Store, X, TrendingUp } from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const menuItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/campaign-insight', label: 'Campaign Insight', icon: TrendingUp },
  { href: '/mystore', label: 'MyStore', icon: Store },
  { href: '/seo', label: 'SEO Tracker', icon: Target },
  { href: '/generate-content', label: 'AutoWrite SEO', icon: PenTool },
  { href: '/generate-caption', label: 'Workspace Socmed', icon: Hash },
  { href: '/audit', label: 'Review Audit', icon: ClipboardCheck },
];

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />}

      <aside
        className={`fixed top-0 left-0 z-50 w-64 h-full bg-[#1E293B] transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex-shrink-0 lg:rounded-none rounded-r-3xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-20 px-8">
          <span className="text-2xl font-bold text-white tracking-widest">VIVA</span>
          <button onClick={onClose} className="text-slate-400 lg:hidden hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="px-4 mt-6 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <item.icon size={20} className={isActive ? 'text-white' : 'text-slate-400'} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}