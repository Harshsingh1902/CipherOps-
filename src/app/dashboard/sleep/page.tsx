'use client';

import { useState, useEffect } from 'react';
import { BedDouble, Moon, Sun, TrendingUp, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from 'recharts';
import { formatDuration } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function SleepPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bedtime, setBedtime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [quality, setQuality] = useState(7);
  const [notes, setNotes] = useState('');
  const [showForm, setShowForm] = useState(false);

  const supabase = createClient();

  useEffect(() => { fetchLogs(); }, []);

  const fetchLogs = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('sleep_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(14);
    setLogs(data || []);
    setLoading(false);
  };

  const calculateDuration = (bed: string, wake: string) => {
    const [bh, bm] = bed.split(':').map(Number);
    const [wh, wm] = wake.split(':').map(Number);
    let duration = (wh * 60 + wm) - (bh * 60 + bm);
    if (duration < 0) duration += 24 * 60;
    return duration / 60;
  };

  const saveSleep = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const duration = calculateDuration(bedtime, wakeTime);
    const today = format(new Date(), 'yyyy-MM-dd');

    const { error } = await supabase.from('sleep_logs').upsert({
      user_id: user.id,
      date: today,
      sleep_start: bedtime,
      sleep_end: wakeTime,
      duration_hours: duration,
      quality,
      notes,
    }, { onConflict: 'user_id,date' });

    if (error) toast.error('Failed to save');
    else { toast.success('Sleep logged! 😴'); fetchLogs(); setShowForm(false); }
    setSaving(false);
  };

  const chartData = eachDayOfInterval({ start: subDays(new Date(), 13), end: new Date() }).map(day => {
    const log = logs.find(l => l.date === format(day, 'yyyy-MM-dd'));
    return {
      date: format(day, 'EEE'),
      hours: log?.duration_hours ? parseFloat(log.duration_hours.toFixed(1)) : null,
      quality: log?.quality || null,
    };
  });

  const avgDuration = logs.length ? logs.reduce((s, l) => s + (l.duration_hours || 0), 0) / logs.length : 0;
  const avgQuality = logs.length ? logs.reduce((s, l) => s + (l.quality || 0), 0) / logs.length : 0;
  const lastLog = logs[0];

  const previewDuration = calculateDuration(bedtime, wakeTime);

  const QUALITY_LABELS = ['', 'Very poor', 'Poor', 'Fair', 'Fair', 'Average', 'Average', 'Good', 'Good', 'Excellent', 'Perfect'];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-4xl font-light text-white mb-1">Sleep</h1>
        <p className="text-white/50 text-sm">Track your rest — understand how your cycle affects sleep quality</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 space-y-5">
          {/* Chart */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <p className="text-sm font-medium text-white/70">14-day sleep duration</p>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 10]} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  formatter={(val: any) => [`${val}h`, 'Sleep']}
                />
                <ReferenceLine y={8} stroke="rgba(96,165,250,0.3)" strokeDasharray="4 4" />
                <Bar dataKey="hours" fill="url(#sleepGrad)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-[10px] text-white/25 text-center mt-2">Blue dashed line = recommended 8h</p>
          </div>

          {/* Log form */}
          {showForm ? (
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-white mb-5">Log last night's sleep</h3>

              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="text-sm text-white/60 mb-2 flex items-center gap-2 block">
                    <Moon className="w-3.5 h-3.5 text-blue-400" /> Bedtime
                  </label>
                  <input
                    type="time"
                    value={bedtime}
                    onChange={e => setBedtime(e.target.value)}
                    className="input-dark w-full px-4 py-3 text-sm"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-2 flex items-center gap-2 block">
                    <Sun className="w-3.5 h-3.5 text-amber-400" /> Wake up
                  </label>
                  <input
                    type="time"
                    value={wakeTime}
                    onChange={e => setWakeTime(e.target.value)}
                    className="input-dark w-full px-4 py-3 text-sm"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
              </div>

              <div className="mb-5 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-3">
                <BedDouble className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-white">{previewDuration.toFixed(1)} hours</p>
                  <p className="text-xs text-white/40">{formatDuration(previewDuration)} of sleep</p>
                </div>
              </div>

              <div className="mb-5">
                <div className="flex justify-between mb-3">
                  <label className="text-sm text-white/60">Sleep quality</label>
                  <span className="text-sm text-white font-medium">{quality}/10 — {QUALITY_LABELS[quality]}</span>
                </div>
                <input
                  type="range" min={1} max={10} value={quality}
                  onChange={e => setQuality(+e.target.value)}
                  className="w-full accent-blue-400"
                />
                <div className="flex justify-between text-xs text-white/30 mt-1">
                  <span>Terrible</span><span>Perfect</span>
                </div>
              </div>

              <div className="mb-5">
                <label className="text-sm text-white/60 mb-2 block">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Did you wake up during the night? Any dreams?"
                  rows={2}
                  className="input-dark w-full px-4 py-3 text-sm resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowForm(false)} className="btn-ghost flex-1 py-3 text-sm">Cancel</button>
                <button onClick={saveSleep} disabled={saving} className="btn-primary flex-1 py-3 text-sm font-medium disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save sleep log'}
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowForm(true)} className="card p-6 w-full text-left group hover:border-blue-500/30 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/15 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Plus className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-base font-semibold text-white">Log last night's sleep</p>
                  <p className="text-xs text-white/40">Track bedtime, wake time, and sleep quality</p>
                </div>
              </div>
            </button>
          )}
        </div>

        {/* Right panel */}
        <div className="space-y-5">
          {/* Stats */}
          <div className="card p-5">
            <p className="text-sm font-medium text-white/70 mb-4">Sleep stats</p>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-white/40 mb-1">Average duration</p>
                <p className="text-2xl font-bold text-white">{formatDuration(avgDuration)}</p>
                <p className={`text-xs mt-0.5 ${avgDuration >= 7 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {avgDuration >= 7 ? '✓ Within healthy range' : '⚠ Below recommended 7h'}
                </p>
              </div>

              <div>
                <p className="text-xs text-white/40 mb-1">Average quality</p>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`flex-1 h-2 rounded-full ${i <= Math.round(avgQuality / 2) ? 'bg-blue-400' : 'bg-white/8'}`} />
                    ))}
                  </div>
                  <span className="text-sm text-white font-medium">{avgQuality.toFixed(1)}/10</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent logs */}
          <div className="card p-5">
            <p className="text-sm font-medium text-white/70 mb-4">Recent nights</p>
            <div className="space-y-3">
              {logs.slice(0, 5).map(log => (
                <div key={log.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/60">{format(new Date(log.date), 'EEE, MMM d')}</p>
                    <p className="text-xs text-white/30">{log.sleep_start} – {log.sleep_end}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${log.duration_hours >= 7 ? 'text-blue-400' : 'text-amber-400'}`}>
                      {log.duration_hours?.toFixed(1)}h
                    </p>
                    <p className="text-xs text-white/30">{log.quality}/10</p>
                  </div>
                </div>
              ))}
              {logs.length === 0 && <p className="text-xs text-white/30">No sleep logs yet</p>}
            </div>
          </div>

          {/* Sleep tip */}
          <div className="card p-5" style={{ background: 'linear-gradient(135deg, rgba(96,165,250,0.08) 0%, rgba(99,102,241,0.08) 100%)' }}>
            <p className="text-xs text-white/40 mb-2">😴 Sleep tip</p>
            <p className="text-sm text-white/70 leading-relaxed">
              During the luteal phase, progesterone rises which can make you sleepier. Aim for 8-9 hours and avoid caffeine after 2pm to support quality sleep.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
