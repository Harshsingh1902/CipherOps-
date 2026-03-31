'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Moon, LayoutDashboard, Calendar, Smile, Salad,
  BedDouble, MessageCircle, Settings, LogOut, User
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import type { User as SupabaseUser } from '@supabase/supabase-js';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/cycle', label: 'My Cycle', icon: Calendar },
  { href: '/dashboard/mood', label: 'Mood & Symptoms', icon: Smile },
  { href: '/dashboard/nutrition', label: 'Nutrition', icon: Salad },
  { href: '/dashboard/sleep', label: 'Sleep', icon: BedDouble },
  { href: '/assistant', label: 'Luna AI', icon: MessageCircle, highlight: true },
];

const bottomItems = [
  { href: '/dashboard/profile', label: 'Profile', icon: User },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  user: SupabaseUser;
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success('Signed out');
    router.push('/');
  };

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 flex-col z-20"
      style={{ background: 'var(--surface-1)', borderRight: '1px solid var(--border-subtle)' }}>

      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/5">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-400 to-fuchsia-500 flex items-center justify-center shadow-glow-sm">
            <Moon className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-display text-lg text-white leading-none">Luna</p>
            <p className="text-[10px] text-white/30 mt-0.5">Health</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <div className={`relative flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-rose-500/15 to-fuchsia-500/10 text-white'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/4'
              } ${item.highlight && !isActive ? 'border border-rose-500/20' : ''}`}>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 w-0.5 h-5 bg-gradient-to-b from-rose-400 to-fuchsia-500 rounded-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className={`w-4.5 h-4.5 flex-shrink-0 ${item.highlight && !isActive ? 'text-rose-400' : ''}`} size={18} />
                <span className="text-sm font-medium">{item.label}</span>
                {item.highlight && !isActive && (
                  <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-medium">24/7</span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-white/5 space-y-1">
        {bottomItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <div className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all text-white/40 hover:text-white/70 hover:bg-white/4`}>
              <item.icon size={16} />
              <span className="text-sm">{item.label}</span>
            </div>
          </Link>
        ))}

        {/* User info */}
        <div className="px-4 py-3 mt-2 rounded-2xl bg-white/3 border border-white/6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-fuchsia-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user.user_metadata?.full_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">
              {user.user_metadata?.full_name || 'Luna User'}
            </p>
            <p className="text-[10px] text-white/30 truncate">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-white/30 hover:text-rose-400 transition-colors"
            title="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
