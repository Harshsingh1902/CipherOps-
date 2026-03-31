'use client';

import { useState } from 'react';
import { Settings, Moon, Globe, Palette, Download, HelpCircle, MessageCircle } from 'lucide-react';
import Link from 'next/link';

const THEMES = [
  { id: 'dark', label: 'Dark (Default)', preview: 'bg-surface-1' },
];

const LANGUAGES = ['English', 'Hindi', 'Spanish', 'French', 'German', 'Portuguese'];

export default function SettingsPage() {
  const [language, setLanguage] = useState('English');
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-4xl font-light text-white mb-1">Settings</h1>
        <p className="text-white/50 text-sm">Configure your Luna experience</p>
      </div>

      <div className="max-w-2xl space-y-5">
        {/* Appearance */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Palette className="w-4 h-4 text-fuchsia-400" />
            <h2 className="text-lg font-semibold text-white">Appearance</h2>
          </div>
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/3 border border-white/6">
            <div className="flex items-center gap-3">
              <Moon className="w-4 h-4 text-violet-400" />
              <div>
                <p className="text-sm font-medium text-white">Dark mode</p>
                <p className="text-xs text-white/40">Premium dark theme — always on</p>
              </div>
            </div>
            <div className="px-3 py-1 rounded-full bg-fuchsia-500/20 text-fuchsia-400 text-xs font-medium">Active</div>
          </div>
        </div>

        {/* Regional */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Globe className="w-4 h-4 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Regional</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-white/60 mb-2 block">Language</label>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="input-dark w-full px-4 py-3 text-sm"
              >
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm text-white/60 mb-3 block">Units</label>
              <div className="flex gap-3">
                {(['metric', 'imperial'] as const).map(u => (
                  <button
                    key={u}
                    onClick={() => setUnits(u)}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                      units === u
                        ? 'border-rose-400/50 bg-rose-500/10 text-white'
                        : 'border-white/10 text-white/40 hover:border-white/20'
                    }`}
                  >
                    {u === 'metric' ? 'Metric (kg, cm)' : 'Imperial (lb, in)'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Data & Export */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Download className="w-4 h-4 text-emerald-400" />
            <h2 className="text-lg font-semibold text-white">Data & Export</h2>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Export health data (CSV)', desc: 'Download all your logs and cycle history' },
              { label: 'Export to PDF report', desc: 'Generate a health summary for your doctor' },
            ].map(item => (
              <button
                key={item.label}
                className="w-full p-4 rounded-2xl bg-white/3 border border-white/6 text-left hover:border-white/15 transition-all"
              >
                <p className="text-sm font-medium text-white">{item.label}</p>
                <p className="text-xs text-white/40 mt-0.5">{item.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Help */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <h2 className="text-lg font-semibold text-white">Help & Support</h2>
          </div>

          <div className="space-y-3">
            {[
              { icon: MessageCircle, label: 'Chat with Luna AI', desc: 'Ask health questions 24/7', href: '/assistant' },
              { icon: HelpCircle, label: 'Help center', desc: 'FAQs and guides', href: '#' },
              { icon: Settings, label: 'Send feedback', desc: 'Help us improve Luna', href: '#' },
            ].map(item => (
              <Link key={item.label} href={item.href}
                className="flex items-center gap-4 p-4 rounded-2xl bg-white/3 border border-white/6 hover:border-white/15 transition-all group">
                <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4 h-4 text-white/40 group-hover:text-white/70" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <p className="text-xs text-white/40">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* App info */}
        <div className="text-center py-4">
          <p className="text-xs text-white/20">Luna Health v1.0.0 · Built with ❤️ · Powered by Claude AI</p>
        </div>
      </div>
    </div>
  );
}
