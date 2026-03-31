'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, Droplets, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatDate, getCyclePhase, predictNextPeriod, predictOvulation, getFertileWindow } from '@/lib/utils';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, parseISO, isWithinInterval } from 'date-fns';
import toast from 'react-hot-toast';

const FLOW_OPTIONS = [
  { value: 'none', label: 'None', color: 'bg-white/10' },
  { value: 'spotting', label: 'Spotting', color: 'bg-rose-300/40' },
  { value: 'light', label: 'Light', color: 'bg-rose-400/60' },
  { value: 'medium', label: 'Medium', color: 'bg-rose-500' },
  { value: 'heavy', label: 'Heavy', color: 'bg-rose-600' },
];

const SYMPTOMS = ['Cramps', 'Bloating', 'Headache', 'Back pain', 'Breast tenderness', 'Acne', 'Fatigue', 'Nausea', 'Insomnia', 'Hot flashes'];

export default function CyclePage() {
  const [cycles, setCycles] = useState<any[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showLogModal, setShowLogModal] = useState(false);
  const [flow, setFlow] = useState('none');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  useEffect(() => { fetchCycles(); }, []);

  const fetchCycles = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('cycle_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('period_start', { ascending: false })
      .limit(12);
    setCycles(data || []);
    setLoading(false);
  };

  const latestCycle = cycles[0];
  const nextPeriod = latestCycle ? predictNextPeriod(latestCycle.period_start) : null;
  const ovulation = latestCycle ? predictOvulation(latestCycle.period_start) : null;
  const fertileWindow = ovulation ? getFertileWindow(ovulation) : null;

  const getDayStatus = (date: Date) => {
    if (!latestCycle) return null;

    const periodStart = parseISO(latestCycle.period_start);
    const periodEnd = latestCycle.period_end ? parseISO(latestCycle.period_end) : addDays(periodStart, 5);

    if (isWithinInterval(date, { start: periodStart, end: periodEnd })) return 'period';
    if (ovulation && isSameDay(date, ovulation)) return 'ovulation';
    if (fertileWindow && isWithinInterval(date, fertileWindow)) return 'fertile';
    if (nextPeriod && isWithinInterval(date, { start: addDays(nextPeriod, -2), end: addDays(nextPeriod, 3) })) return 'predicted';
    return null;
  };

  const monthDays = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const firstDayOfWeek = getDay(startOfMonth(currentMonth));

  const saveLog = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const dateStr = format(selectedDate, 'yyyy-MM-dd');

    if (flow !== 'none') {
      // Check if there's an existing cycle for this date range
      const existingCycle = cycles.find(c => {
        const start = parseISO(c.period_start);
        return isSameDay(start, selectedDate) || isSameDay(addDays(start, 1), selectedDate);
      });

      if (!existingCycle) {
        const { error } = await supabase.from('cycle_entries').insert({
          user_id: user.id,
          period_start: dateStr,
        });
        if (error) toast.error('Failed to save');
        else { toast.success('Period logged!'); fetchCycles(); }
      }
    }

    // Save daily log with symptoms
    const { error: logError } = await supabase.from('daily_logs').upsert({
      user_id: user.id,
      date: dateStr,
      flow_intensity: flow,
      symptoms,
    }, { onConflict: 'user_id,date' });

    if (!logError) toast.success('Saved!');
    setSaving(false);
    setShowLogModal(false);
  };

  const dayOfCycle = latestCycle ? Math.max(1, Math.floor((new Date().getTime() - parseISO(latestCycle.period_start).getTime()) / (1000 * 60 * 60 * 24)) + 1) : null;
  const cyclePhase = dayOfCycle ? getCyclePhase(dayOfCycle) : null;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-4xl font-light text-white mb-1">My Cycle</h1>
        <p className="text-white/50 text-sm">Track your period, predict your cycle, understand your body</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Calendar */}
        <div className="xl:col-span-2 card p-6">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() - 1))} className="btn-ghost p-2">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="text-lg font-semibold text-white">{format(currentMonth, 'MMMM yyyy')}</h2>
            <button onClick={() => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() + 1))} className="btn-ghost p-2">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-xs text-white/30 py-2">{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`empty-${i}`} />)}
            {monthDays.map(day => {
              const status = getDayStatus(day);
              const isToday = isSameDay(day, new Date());
              const isSelected = isSameDay(day, selectedDate);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => { setSelectedDate(day); setShowLogModal(true); }}
                  className={`aspect-square rounded-xl flex items-center justify-center text-sm transition-all relative ${
                    isSelected ? 'ring-2 ring-rose-400' :
                    isToday ? 'ring-1 ring-white/20' : ''
                  } ${
                    status === 'period' ? 'bg-rose-500/30 text-rose-200' :
                    status === 'ovulation' ? 'bg-emerald-500/30 text-emerald-200' :
                    status === 'fertile' ? 'bg-emerald-500/15 text-emerald-300' :
                    status === 'predicted' ? 'bg-rose-500/15 text-rose-300' :
                    'text-white/60 hover:bg-white/5'
                  }`}
                >
                  {format(day, 'd')}
                  {status === 'ovulation' && (
                    <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-5 pt-5 border-t border-white/6">
            {[
              { color: 'bg-rose-500/50', label: 'Period' },
              { color: 'bg-rose-500/20', label: 'Predicted period' },
              { color: 'bg-emerald-500/30', label: 'Ovulation' },
              { color: 'bg-emerald-500/15', label: 'Fertile window' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                <span className="text-xs text-white/40">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-5">
          {/* Current phase */}
          <div className="card p-5">
            <p className="text-xs text-white/40 mb-3">Current phase</p>
            {cyclePhase ? (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                    style={{ background: `${cyclePhase.color}20` }}>
                    🌙
                  </div>
                  <div>
                    <p className="font-semibold text-white">{cyclePhase.phase}</p>
                    <p className="text-xs text-white/40">Day {dayOfCycle}</p>
                  </div>
                </div>
                <p className="text-xs text-white/50 leading-relaxed">{cyclePhase.description}</p>
              </div>
            ) : (
              <p className="text-sm text-white/40">Log your period to see your current phase</p>
            )}
          </div>

          {/* Predictions */}
          <div className="card p-5 space-y-4">
            <p className="text-xs text-white/40">Predictions</p>
            {nextPeriod && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-400" />
                  <span className="text-sm text-white/70">Next period</span>
                </div>
                <span className="text-sm text-white font-medium">{formatDate(nextPeriod, 'MMM d')}</span>
              </div>
            )}
            {ovulation && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-sm text-white/70">Ovulation</span>
                </div>
                <span className="text-sm text-white font-medium">{formatDate(ovulation, 'MMM d')}</span>
              </div>
            )}
            {fertileWindow && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-300" />
                  <span className="text-sm text-white/70">Fertile window</span>
                </div>
                <span className="text-sm text-white font-medium">
                  {formatDate(fertileWindow.start, 'MMM d')} – {formatDate(fertileWindow.end, 'MMM d')}
                </span>
              </div>
            )}
            {!latestCycle && (
              <p className="text-xs text-white/40">Log your period to see predictions</p>
            )}
          </div>

          {/* Log button */}
          <button
            onClick={() => { setSelectedDate(new Date()); setShowLogModal(true); }}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Log today
          </button>
        </div>
      </div>

      {/* Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md card p-6 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-white">Log {formatDate(selectedDate, 'MMMM d')}</h3>
              <button onClick={() => setShowLogModal(false)} className="text-white/40 hover:text-white">✕</button>
            </div>

            {/* Flow */}
            <div className="mb-5">
              <p className="text-sm text-white/60 mb-3">Flow intensity</p>
              <div className="flex gap-2">
                {FLOW_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setFlow(opt.value)}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all border ${
                      flow === opt.value
                        ? 'border-rose-400/50 text-white ' + opt.color
                        : 'border-white/10 text-white/40 hover:border-white/20'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Symptoms */}
            <div className="mb-6">
              <p className="text-sm text-white/60 mb-3">Symptoms</p>
              <div className="flex flex-wrap gap-2">
                {SYMPTOMS.map(s => (
                  <button
                    key={s}
                    onClick={() => setSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                      symptoms.includes(s)
                        ? 'border-fuchsia-500/50 bg-fuchsia-500/15 text-fuchsia-300'
                        : 'border-white/10 text-white/40 hover:border-white/20'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={saveLog}
              disabled={saving}
              className="btn-primary w-full py-3 text-sm font-medium disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save log'}
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
