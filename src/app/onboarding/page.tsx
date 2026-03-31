'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, ArrowRight, ArrowLeft, Calendar, Heart, Droplets, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

const steps = [
  { id: 1, title: 'Your Cycle', icon: Calendar, color: '#ff6b8a' },
  { id: 2, title: 'Health Goals', icon: Heart, color: '#d946ef' },
  { id: 3, title: 'Reminders', icon: Droplets, color: '#818cf8' },
  { id: 4, title: 'All Set!', icon: CheckCircle2, color: '#34d399' },
];

const healthGoals = [
  { id: 'track_cycle', label: 'Track my cycle', emoji: '🌙' },
  { id: 'manage_symptoms', label: 'Manage symptoms', emoji: '💊' },
  { id: 'improve_mood', label: 'Improve mood', emoji: '😊' },
  { id: 'better_sleep', label: 'Better sleep', emoji: '😴' },
  { id: 'nutrition', label: 'Nutrition tracking', emoji: '🥗' },
  { id: 'understand_body', label: 'Understand my body', emoji: '🔬' },
  { id: 'plan_pregnancy', label: 'Plan for pregnancy', emoji: '👶' },
  { id: 'general_wellness', label: 'General wellness', emoji: '✨' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    lastPeriodDate: '',
    cycleLength: 28,
    periodLength: 5,
    goals: [] as string[],
    notificationsEnabled: true,
  });

  const updateData = (updates: Partial<typeof data>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const toggleGoal = (id: string) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.includes(id)
        ? prev.goals.filter(g => g !== id)
        : [...prev.goals, id],
    }));
  };

  const handleComplete = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/auth/login');
      return;
    }

    const { error } = await supabase.from('user_profiles').upsert({
      user_id: user.id,
      full_name: user.user_metadata.full_name || '',
      cycle_length_avg: data.cycleLength,
      period_length_avg: data.periodLength,
      notifications_enabled: data.notificationsEnabled,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });

    if (data.lastPeriodDate) {
      await supabase.from('cycle_entries').insert({
        user_id: user.id,
        period_start: data.lastPeriodDate,
      });
    }

    if (error) {
      toast.error('Something went wrong. Please try again.');
      setLoading(false);
    } else {
      toast.success('Profile set up successfully!');
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4">
      <div className="orb orb-rose w-72 h-72 top-0 right-0" />
      <div className="orb orb-luna w-64 h-64 bottom-0 left-0" />

      {/* Logo */}
      <div className="flex items-center gap-2 mb-10">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-400 to-fuchsia-500 flex items-center justify-center">
          <Moon className="w-5 h-5 text-white" />
        </div>
        <span className="font-display text-2xl text-white">Luna</span>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-md mb-8">
        <div className="flex items-center gap-2 mb-3">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className={`w-full h-1.5 rounded-full transition-all duration-500 ${step > i ? 'bg-gradient-to-r from-rose-400 to-fuchsia-500' : 'bg-white/10'}`} />
            </div>
          ))}
        </div>
        <p className="text-xs text-white/40 text-center">Step {step} of {steps.length}</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="card p-8"
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-500/20 flex items-center justify-center mb-6">
                <Calendar className="w-7 h-7 text-rose-400" />
              </div>
              <h2 className="text-2xl font-display font-light text-white mb-1">Your cycle</h2>
              <p className="text-white/50 text-sm mb-6">Help us personalize your experience</p>

              <div className="space-y-5">
                <div>
                  <label className="text-sm text-white/60 mb-2 block">When did your last period start?</label>
                  <input
                    type="date"
                    value={data.lastPeriodDate}
                    onChange={(e) => updateData({ lastPeriodDate: e.target.value })}
                    className="input-dark w-full px-4 py-3 text-sm"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>

                <div>
                  <label className="text-sm text-white/60 mb-3 block">
                    Cycle length: <span className="text-white">{data.cycleLength} days</span>
                  </label>
                  <input
                    type="range"
                    min={21}
                    max={45}
                    value={data.cycleLength}
                    onChange={(e) => updateData({ cycleLength: parseInt(e.target.value) })}
                    className="w-full accent-rose-400"
                  />
                  <div className="flex justify-between text-xs text-white/30 mt-1">
                    <span>21 days</span>
                    <span>45 days</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-white/60 mb-3 block">
                    Period length: <span className="text-white">{data.periodLength} days</span>
                  </label>
                  <input
                    type="range"
                    min={2}
                    max={10}
                    value={data.periodLength}
                    onChange={(e) => updateData({ periodLength: parseInt(e.target.value) })}
                    className="w-full accent-rose-400"
                  />
                  <div className="flex justify-between text-xs text-white/30 mt-1">
                    <span>2 days</span>
                    <span>10 days</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="card p-8"
            >
              <div className="w-14 h-14 rounded-2xl bg-fuchsia-500/20 flex items-center justify-center mb-6">
                <Heart className="w-7 h-7 text-fuchsia-400" />
              </div>
              <h2 className="text-2xl font-display font-light text-white mb-1">Your goals</h2>
              <p className="text-white/50 text-sm mb-6">Select all that apply — we'll personalize Luna for you</p>

              <div className="grid grid-cols-2 gap-3">
                {healthGoals.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => toggleGoal(goal.id)}
                    className={`p-4 rounded-2xl border text-left transition-all duration-200 ${
                      data.goals.includes(goal.id)
                        ? 'border-rose-400/50 bg-rose-500/10 text-white'
                        : 'border-white/10 bg-white/2 text-white/60 hover:border-white/20'
                    }`}
                  >
                    <span className="text-2xl block mb-2">{goal.emoji}</span>
                    <span className="text-xs font-medium leading-tight">{goal.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="card p-8"
            >
              <div className="w-14 h-14 rounded-2xl bg-violet-500/20 flex items-center justify-center mb-6">
                <Droplets className="w-7 h-7 text-violet-400" />
              </div>
              <h2 className="text-2xl font-display font-light text-white mb-1">Stay on track</h2>
              <p className="text-white/50 text-sm mb-6">Smart reminders help you log consistently</p>

              <div className="space-y-4">
                {[
                  { title: 'Period & ovulation alerts', desc: 'Know what\'s coming before it arrives', key: 'notificationsEnabled' },
                  { title: 'Daily check-in reminder', desc: 'Log mood, symptoms, and energy each day', key: 'dailyReminder' },
                  { title: 'Hydration nudges', desc: 'Gentle reminders to hit your water goal', key: 'hydrationReminder' },
                ].map((item) => (
                  <div key={item.key} className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-white/3 border border-white/8">
                    <div>
                      <p className="text-sm font-medium text-white">{item.title}</p>
                      <p className="text-xs text-white/40 mt-0.5">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => updateData({ notificationsEnabled: !data.notificationsEnabled })}
                      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 mt-0.5 ${
                        data.notificationsEnabled ? 'bg-gradient-to-r from-rose-400 to-fuchsia-500' : 'bg-white/10'
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        data.notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="card p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-400 to-fuchsia-500 flex items-center justify-center mx-auto mb-6"
                style={{ boxShadow: '0 0 40px rgba(255,107,138,0.4)' }}
              >
                <CheckCircle2 className="w-10 h-10 text-white" />
              </motion.div>

              <h2 className="text-3xl font-display font-light text-white mb-3">
                Welcome to Luna! 🌙
              </h2>
              <p className="text-white/50 text-sm mb-6 leading-relaxed">
                Your profile is ready. Luna will now give you personalized insights, predictions, and 24/7 AI health support.
              </p>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { label: 'Cycle tracked', color: 'text-rose-400' },
                  { label: 'AI ready', color: 'text-fuchsia-400' },
                  { label: 'Reminders set', color: 'text-violet-400' },
                ].map(item => (
                  <div key={item.label} className="p-3 rounded-xl bg-white/4 border border-white/8">
                    <CheckCircle2 className={`w-4 h-4 ${item.color} mx-auto mb-1`} />
                    <p className="text-xs text-white/50">{item.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-5">
          {step > 1 ? (
            <button
              onClick={() => setStep(s => s - 1)}
              className="btn-ghost px-5 py-2.5 flex items-center gap-2 text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : <div />}

          {step < 4 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              className="btn-primary px-6 py-2.5 flex items-center gap-2 text-sm"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={loading}
              className="btn-primary px-8 py-3 flex items-center gap-2 text-sm font-medium disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Go to my dashboard <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
