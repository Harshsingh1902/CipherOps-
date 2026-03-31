'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { signOut } from '@/lib/appwrite';
import { useRouter } from 'next/navigation';
import { Settings, Shield, Bell, Palette, LogOut, Info, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

type ActionItem = {
  icon: any;
  label: string;
  sub: string;
  action: (() => void) | null;
  toggle?: never;
  value?: never;
  onToggle?: never;
};

type ToggleItem = {
  icon: any;
  label: string;
  sub: string;
  toggle: true;
  value: boolean;
  onToggle: () => void;
  action?: never;
};

type SectionItem = ActionItem | ToggleItem;

export default function SettingsView() {
  const router = useRouter();
  const { currentUser, setShowProfile } = useStore();
  const [notifications, setNotifications] = useState(true);
  const [scanlines, setScanlines] = useState(true);

  async function handleLogout() {
    await signOut();
    router.push('/auth');
  }

  const sections: { title: string; items: SectionItem[] }[] = [
    {
      title: 'AGENT',
      items: [
        {
          icon: Shield,
          label: 'PROFILE CONFIGURATION',
          sub: currentUser?.codename || '—',
          action: () => setShowProfile(true),
        },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        {
          icon: Bell,
          label: 'SIGNAL ALERTS',
          sub: notifications ? 'ENABLED' : 'DISABLED',
          toggle: true,
          value: notifications,
          onToggle: () => setNotifications(!notifications),
        },
        {
          icon: Palette,
          label: 'CRT SCANLINES',
          sub: scanlines ? 'ENABLED' : 'DISABLED',
          toggle: true,
          value: scanlines,
          onToggle: () => setScanlines(!scanlines),
        },
      ],
    },
    {
      title: 'INTEL',
      items: [
        { icon: Info, label: 'VERSION', sub: 'CIPHER_OPS v1.0.0', action: null },
        { icon: Info, label: 'PROJECT ID', sub: '69cb6028003d14ece588', action: null },
      ],
    },
  ];

  return (
    <div className="flex-1 bg-cipher-black flex flex-col overflow-hidden">
      <div className="p-4 border-b border-cipher-border bg-cipher-dark">
        <div className="flex items-center gap-2">
          <Settings size={14} className="text-cipher-green" />
          <div className="font-display text-xs tracking-widest text-cipher-green">CONFIGURATION</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {sections.map((section) => (
          <div key={section.title}>
            <div className="text-cipher-muted text-xs tracking-widest mb-2">{section.title}</div>
            <div className="border border-cipher-border rounded overflow-hidden">
              {section.items.map((item, i) => (
                <div
                  key={item.label}
                  onClick={item.action ?? undefined}
                  className={`flex items-center gap-3 px-4 py-3 bg-cipher-dark transition-colors ${
                    i < section.items.length - 1 ? 'border-b border-cipher-border' : ''
                  } ${item.action ? 'cursor-pointer hover:bg-cipher-panel' : ''}`}
                >
                  <item.icon size={14} className="text-cipher-green flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-cipher-text text-xs">{item.label}</div>
                    <div className="text-cipher-muted text-xs">{item.sub}</div>
                  </div>
                  {item.toggle && (
                    <button
                      onClick={(e) => { e.stopPropagation(); item.onToggle?.(); }}
                      className={`w-10 h-5 rounded-full transition-all relative ${item.value ? 'bg-cipher-green' : 'bg-cipher-border'}`}
                    >
                      <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all ${item.value ? 'left-[22px]' : 'left-1'}`} />
                    </button>
                  )}
                  {item.action && !item.toggle && <ChevronRight size={12} className="text-cipher-muted" />}
                </div>
              ))}
            </div>
          </div>
        ))}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 border border-cipher-red bg-cipher-dark text-cipher-red hover:bg-red-950 transition-colors rounded"
        >
          <LogOut size={14} />
          <span className="text-xs font-bold tracking-widest">TERMINATE SESSION</span>
        </button>

        <div className="text-center text-cipher-muted text-xs space-y-1 opacity-50">
          <div>CIPHER_OPS // ENCRYPTED TACTICAL COMM</div>
          <div>EYES ONLY // ALL TRANSMISSIONS SECURED</div>
        </div>
      </div>
    </div>
  );
}
