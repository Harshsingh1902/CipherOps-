'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, Smile, Salad, BedDouble, MessageCircle } from 'lucide-react';

const mobileNav = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/dashboard/cycle', label: 'Cycle', icon: Calendar },
  { href: '/assistant', label: 'Luna AI', icon: MessageCircle, highlight: true },
  { href: '/dashboard/mood', label: 'Mood', icon: Smile },
  { href: '/dashboard/nutrition', label: 'Food', icon: Salad },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 px-2 pb-safe"
      style={{ background: 'rgba(13,13,26,0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center justify-around py-2">
        {mobileNav.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all ${
                isActive ? 'text-white' : 'text-white/40'
              } ${item.highlight ? 'relative' : ''}`}
            >
              {item.highlight ? (
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center -mt-6 shadow-glow-sm ${
                  isActive
                    ? 'bg-gradient-to-br from-rose-400 to-fuchsia-600'
                    : 'bg-gradient-to-br from-rose-400/80 to-fuchsia-600/80'
                }`}>
                  <item.icon className="w-5 h-5 text-white" />
                </div>
              ) : (
                <item.icon size={20} className={isActive ? 'text-rose-400' : ''} />
              )}
              <span className={`text-[10px] font-medium ${item.highlight ? '' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
