'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Smile, Plus, TrendingUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import toast from 'react-hot-toast';

const MOODS = [
  { emoji: '🤩', label: 'Amazing', value: 5, color: '#fbbf24' },
  { emoji: '😊', label: 'Happy', value: 4, color: '#34d399' },
  { emoji: '😐', label: 'Okay', value: 3, color: '#94a3b8' },
  { emoji: '😔', label: 'Sad', value: 2, color: '#818cf8' },
  { emoji: '😤', label: 'Irritable', value: 1, color: '#fb923c' },
  { emoji: '😰', label: 'Anxious', value: 2, color: '#f472b6' },
  { emoji: '😴', label: 'Tired', value: 2, color: '#a78bfa' },
];

const SYMPTOM_TAGS = [
  'Cramps', 'Bloating', 'Headache', 'Back pain', 'Breast tenderness',
  'Acne', 'Fatigue', 'Nausea', 'Mood swings', 'Insomnia', 'Hot flashes', 'Food cravings'
];

export default function MoodPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [energy, setEnergy] = useState(5);
  const [anxiety, setAnxiety] = useState(3);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => { fetchLogs(); }, []);

  const fetchLogs = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const start = format(subDays(new Date(), 30), 'yyyy-MM-dd');
    const { data } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', start)
      .order('date', { ascending: true });
    setLogs(data || []);
    setLoading(false);
  };

  const chartData = eachDayOfInterval({ start: subDays(new Date(), 14), end: new Date() }).map(day => {
    const log = logs.find(l => l.date === format(day, 'yyyy-MM-dd'));
    return {
      date: format(day, 'MMM d'),
      energy: log?.energy_level || null,
      anxiety: log?.anxiety_level || null,
    };
  });

  const saveLog = async () => {
    if (selectedMoods.length === 0) {
      toast.error('Please select at least one mood');
      return;
    }
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const today = format(new Date(), 'yyyy-MM-dd');
    const { error } = await supabase.from('daily_logs').upsert({
      user_id: user.id,
      date: today,
      mood: selectedMoods,
      symptoms: selectedSymptoms,
      energy_level: energy,
      anxiety_level: anxiety,
      notes,
    }, { onConflict: 'user_id,date' });

    if (error) toast.error('Failed to save');
    else { toast.success('Mood logged! 💜'); fetchLogs(); }
    setSaving(false);
  };

  const toggleMood = (label: string) => {
    setSelectedMoods(prev => prev.includes(label) ? prev.filter(m => m !== label) : [...prev, label]);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-4xl font-light text-white mb-1">Mood & Symptoms</h1>
        <p className="text-white/50 text-sm">Track how you feel — discover patterns across your cycle</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Log form */}
        <div className="xl:col-span-2 space-y-5">
          <div className="card p-6">
            <p className="text-sm text-white/60 mb-4">How are you feeling today?</p>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
              {MOODS.map(mood => (
                <button
                  key={mood.label}
                  onClick={() => toggleMood(mood.label)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${
                    selectedMoods.includes(mood.label)
                      ? 'border-white/30 bg-white/8'
                      : 'border-white/6 hover:border-white/15'
                  }`}
                >
                  <span className={`text-3xl transition-transform ${selectedMoods.includes(mood.label) ? 'scale-110' : ''}`}>
                    {mood.emoji}
                  </span>
                  <span className="text-[10px] text-white/50">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Energy & Anxiety sliders */}
          <div className="card p-6 space-y-5">
            <div>
              <div className="flex justify-between mb-3">
                <p className="text-sm text-white/60">Energy level</p>
                <span className="text-sm text-white font-medium">{energy}/10</span>
              </div>
              <input
                type="range" min={1} max={10} value={energy}
                onChange={e => setEnergy(+e.target.value)}
                className="w-full accent-fuchsia-400"
              />
              <div className="flex justify-between text-xs text-white/30 mt-1">
                <span>Exhausted</span><span>Energized</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-3">
                <p className="text-sm text-white/60">Anxiety / stress</p>
                <span className="text-sm text-white font-medium">{anxiety}/10</span>
              </div>
              <input
                type="range" min={1} max={10} value={anxiety}
                onChange={e => setAnxiety(+e.target.value)}
                className="w-full accent-violet-400"
              />
              <div className="flex justify-between text-xs text-white/30 mt-1">
                <span>Calm</span><span>Very anxious</span>
              </div>
            </div>
          </div>

          {/* Symptoms */}
          <div className="card p-6">
            <p className="text-sm text-white/60 mb-4">Physical symptoms (optional)</p>
            <div className="flex flex-wrap gap-2">
              {SYMPTOM_TAGS.map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    selectedSymptoms.includes(s)
                      ? 'border-rose-400/50 bg-rose-500/15 text-rose-300'
                      : 'border-white/10 text-white/40 hover:border-white/20'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="card p-6">
            <p className="text-sm text-white/60 mb-3">Notes (optional)</p>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="How was your day? Any patterns you noticed?"
              rows={3}
              className="input-dark w-full px-4 py-3 text-sm resize-none"
            />
          </div>

          <button onClick={saveLog} disabled={saving} className="btn-primary w-full py-3 text-sm font-medium disabled:opacity-50">
            {saving ? 'Saving...' : 'Save today\'s log'}
          </button>
        </div>

        {/* Right: chart + insights */}
        <div className="space-y-5">
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-fuchsia-400" />
              <p className="text-sm font-medium text-white/70">14-day trend</p>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <defs>
                  <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d946ef" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#d946ef" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 10]} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="energy" stroke="#d946ef" strokeWidth={2} fill="url(#energyGrad)" connectNulls dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Recent logs */}
          <div className="card p-5">
            <p className="text-sm font-medium text-white/70 mb-4">Recent logs</p>
            <div className="space-y-3">
              {logs.slice(-5).reverse().map(log => (
                <div key={log.id} className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-white/60">{format(new Date(log.date), 'MMM d')}</p>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {log.mood?.slice(0, 2).map((m: string) => (
                        <span key={m} className="text-[10px] px-2 py-0.5 rounded-full bg-fuchsia-500/15 text-fuchsia-300">{m}</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-white/40">⚡ {log.energy_level}/10</p>
                  </div>
                </div>
              ))}
              {logs.length === 0 && <p className="text-xs text-white/30">No logs yet. Start tracking today!</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
