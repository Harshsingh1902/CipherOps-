'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Save, Camera, Bell, Shield, LogOut, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    date_of_birth: '',
    weight_kg: '',
    height_cm: '',
    cycle_length_avg: 28,
    period_length_avg: 5,
    notifications_enabled: true,
  });

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('user_profiles').select('*').eq('user_id', user.id).single();
    if (data) {
      setProfile(data);
      setForm({
        full_name: data.full_name || '',
        date_of_birth: data.date_of_birth || '',
        weight_kg: data.weight_kg || '',
        height_cm: data.height_cm || '',
        cycle_length_avg: data.cycle_length_avg || 28,
        period_length_avg: data.period_length_avg || 5,
        notifications_enabled: data.notifications_enabled ?? true,
      });
    }
    setLoading(false);
  };

  const saveProfile = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('user_profiles').upsert({
      user_id: user.id,
      ...form,
      weight_kg: form.weight_kg ? parseFloat(form.weight_kg as string) : null,
      height_cm: form.height_cm ? parseFloat(form.height_cm as string) : null,
    }, { onConflict: 'user_id' });

    if (error) toast.error('Failed to save profile');
    else toast.success('Profile updated!');
    setSaving(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const update = (key: string, value: any) => setForm(p => ({ ...p, [key]: value }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-rose-400/30 border-t-rose-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-4xl font-light text-white mb-1">Profile</h1>
        <p className="text-white/50 text-sm">Manage your personal information and health settings</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 space-y-5">
          {/* Personal Info */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <User className="w-4 h-4 text-rose-400" />
              <h2 className="text-lg font-semibold text-white">Personal information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-white/60 mb-2 block">Full name</label>
                <input
                  value={form.full_name}
                  onChange={e => update('full_name', e.target.value)}
                  className="input-dark w-full px-4 py-3 text-sm"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="text-sm text-white/60 mb-2 block">Date of birth</label>
                <input
                  type="date"
                  value={form.date_of_birth}
                  onChange={e => update('date_of_birth', e.target.value)}
                  className="input-dark w-full px-4 py-3 text-sm"
                  style={{ colorScheme: 'dark' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Weight (kg)</label>
                  <input
                    type="number"
                    value={form.weight_kg}
                    onChange={e => update('weight_kg', e.target.value)}
                    className="input-dark w-full px-4 py-3 text-sm"
                    placeholder="e.g. 60"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Height (cm)</label>
                  <input
                    type="number"
                    value={form.height_cm}
                    onChange={e => update('height_cm', e.target.value)}
                    className="input-dark w-full px-4 py-3 text-sm"
                    placeholder="e.g. 165"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Cycle Settings */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-white mb-5">Cycle settings</h2>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between mb-3">
                  <label className="text-sm text-white/60">Average cycle length</label>
                  <span className="text-sm text-white font-medium">{form.cycle_length_avg} days</span>
                </div>
                <input
                  type="range" min={21} max={45}
                  value={form.cycle_length_avg}
                  onChange={e => update('cycle_length_avg', parseInt(e.target.value))}
                  className="w-full accent-rose-400"
                />
                <div className="flex justify-between text-xs text-white/30 mt-1">
                  <span>21 days</span><span>45 days</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-3">
                  <label className="text-sm text-white/60">Average period length</label>
                  <span className="text-sm text-white font-medium">{form.period_length_avg} days</span>
                </div>
                <input
                  type="range" min={2} max={10}
                  value={form.period_length_avg}
                  onChange={e => update('period_length_avg', parseInt(e.target.value))}
                  className="w-full accent-rose-400"
                />
                <div className="flex justify-between text-xs text-white/30 mt-1">
                  <span>2 days</span><span>10 days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <Bell className="w-4 h-4 text-violet-400" />
              <h2 className="text-lg font-semibold text-white">Notifications</h2>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/3 border border-white/6">
              <div>
                <p className="text-sm font-medium text-white">Enable notifications</p>
                <p className="text-xs text-white/40 mt-0.5">Period predictions, ovulation alerts, daily reminders</p>
              </div>
              <button
                onClick={() => update('notifications_enabled', !form.notifications_enabled)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  form.notifications_enabled ? 'bg-gradient-to-r from-rose-400 to-fuchsia-500' : 'bg-white/10'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  form.notifications_enabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>

          <button
            onClick={saveProfile}
            disabled={saving}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><Save className="w-4 h-4" /> Save changes</>
            )}
          </button>
        </div>

        {/* Right panel */}
        <div className="space-y-5">
          {/* Avatar */}
          <div className="card p-5 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-400 to-fuchsia-500 flex items-center justify-center text-3xl font-bold text-white mx-auto mb-4">
              {form.full_name?.[0]?.toUpperCase() || '?'}
            </div>
            <p className="text-sm font-medium text-white">{form.full_name || 'Luna User'}</p>
            <p className="text-xs text-white/40 mt-1">Member since {new Date().getFullYear()}</p>
          </div>

          {/* Privacy */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-emerald-400" />
              <p className="text-sm font-medium text-white/70">Privacy & Security</p>
            </div>
            <div className="space-y-2 text-xs text-white/40 leading-relaxed">
              <p>✓ End-to-end encrypted health data</p>
              <p>✓ Never sold to third parties</p>
              <p>✓ Row-level security enforced</p>
              <p>✓ Delete your data anytime</p>
            </div>
          </div>

          {/* Danger zone */}
          <div className="card p-5 border-rose-500/15">
            <p className="text-sm font-medium text-white/70 mb-4">Account</p>
            <div className="space-y-3">
              <button
                onClick={handleLogout}
                className="w-full btn-ghost py-2.5 flex items-center justify-center gap-2 text-sm text-white/60"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
              <button className="w-full py-2.5 rounded-xl border border-rose-500/20 text-rose-400/70 hover:text-rose-400 hover:border-rose-500/40 transition-all flex items-center justify-center gap-2 text-sm">
                <Trash2 className="w-4 h-4" />
                Delete account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
