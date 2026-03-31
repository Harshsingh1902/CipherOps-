'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  MessageCircle, Calendar, Smile, Droplets, BedDouble,
  TrendingUp, ArrowRight, Zap, Moon, Sparkles, ChevronRight
} from 'lucide-react';
import { getCyclePhase, getDayOfCycle, predictNextPeriod, getGreeting, formatDate, formatDuration } from '@/lib/utils';
import { differenceInDays } from 'date-fns';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface Props {
  user: SupabaseUser;
  profile: any;
  latestCycle: any;
  todayLog: any;
  todayNutrition: any;
  sleepLogs: any[];
}

const MOODS = ['😊', '😐', '😔', '😤', '😰', '🤩', '😴'];
const MOOD_LABELS = ['Happy', 'Okay', 'Sad', 'Irritated', 'Anxious', 'Excited', 'Tired'];

export default function DashboardClient({ user, profile, latestCycle, todayLog, todayNutrition, sleepLogs }: Props) {
  const firstName = (user.user_metadata?.full_name || user.email || 'there').split(' ')[0];
  const greeting = getGreeting();

  // Cycle calculations
  const dayOfCycle = latestCycle ? getDayOfCycle(latestCycle.period_start) : null;
  const cycleLength = profile?.cycle_length_avg || 28;
  const cyclePhase = dayOfCycle ? getCyclePhase(dayOfCycle, cycleLength) : null;
  const nextPeriod = latestCycle ? predictNextPeriod(latestCycle.period_start, cycleLength) : null;
  const daysUntilPeriod = nextPeriod ? differenceInDays(nextPeriod, new Date()) : null;

  const waterMl = todayNutrition?.water_ml || 0;
  const waterGoal = 2500;
  const waterPercent = Math.min((waterMl / waterGoal) * 100, 100);

  const lastSleep = sleepLogs[0];
  const avgSleep = sleepLogs.length
    ? sleepLogs.reduce((s, l) => s + (l.duration_hours || 0), 0) / sleepLogs.length
    : 0;

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { ease: [0.16, 1, 0.3, 1], duration: 0.5 } } };

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="text-white/40 text-sm mb-1">{greeting},</p>
        <h1 className="font-display text-4xl font-light text-white">
          {firstName} <span className="gradient-text">✦</span>
        </h1>
        <p className="text-white/50 text-sm mt-1">
          {formatDate(new Date(), 'EEEE, MMMM d')} · {cyclePhase ? `${cyclePhase.phase} Phase` : 'Set up your cycle to get insights'}
        </p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
      >
        {/* Cycle Ring Card - Large */}
        <motion.div variants={item} className="md:col-span-2 xl:col-span-1">
          <Link href="/dashboard/cycle">
            <div className="card p-6 h-full cursor-pointer group">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-rose-400" />
                  <span className="text-sm font-medium text-white/70">My Cycle</span>
                </div>
                <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors" />
              </div>

              <div className="flex items-center gap-6">
                {/* Ring */}
                <div className="relative flex-shrink-0">
                  <svg className="w-28 h-28 -rotate-90" viewBox="0 0 112 112">
                    <circle cx="56" cy="56" r="46" fill="none" stroke="rgba(255,107,138,0.1)" strokeWidth="8" />
                    {dayOfCycle && (
                      <circle
                        cx="56" cy="56" r="46"
                        fill="none"
                        stroke="url(#cycleGrad)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 46}`}
                        strokeDashoffset={`${2 * Math.PI * 46 * (1 - dayOfCycle / cycleLength)}`}
                        className="transition-all duration-1000"
                      />
                    )}
                    <defs>
                      <linearGradient id="cycleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ff6b8a" />
                        <stop offset="100%" stopColor="#d946ef" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-white">{dayOfCycle ?? '—'}</span>
                    <span className="text-xs text-white/40">of {cycleLength}</span>
                  </div>
                </div>

                <div className="flex-1">
                  {cyclePhase ? (
                    <>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-3"
                        style={{ background: `${cyclePhase.color}20`, color: cyclePhase.color }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: cyclePhase.color }} />
                        {cyclePhase.phase} Phase
                      </div>
                      <p className="text-xs text-white/50 leading-relaxed mb-4">{cyclePhase.description}</p>
                      {daysUntilPeriod !== null && (
                        <div className="text-xs text-white/40">
                          Next period in{' '}
                          <span className="text-rose-400 font-semibold">
                            {daysUntilPeriod > 0 ? `${daysUntilPeriod} days` : 'today'}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div>
                      <p className="text-sm text-white/50 mb-3">Log your cycle to see predictions</p>
                      <div className="text-xs text-rose-400">Set up cycle →</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Luna AI CTA */}
        <motion.div variants={item}>
          <Link href="/assistant">
            <div className="card p-6 cursor-pointer group relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(255,107,138,0.12) 0%, rgba(217,70,239,0.12) 100%)' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-fuchsia-500/5" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-400 to-fuchsia-500 flex items-center justify-center shadow-glow-sm">
                    <Moon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">Luna AI</h3>
                <p className="text-xs text-white/50 mb-4 leading-relaxed">
                  Ask anything about your health — chat, voice, or upload images
                </p>
                <div className="flex items-center gap-2 text-xs text-rose-400 group-hover:gap-3 transition-all">
                  <MessageCircle className="w-3.5 h-3.5" />
                  Start a conversation
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Today's Mood */}
        <motion.div variants={item}>
          <Link href="/dashboard/mood">
            <div className="card p-6 cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Smile className="w-4 h-4 text-fuchsia-400" />
                  <span className="text-sm font-medium text-white/70">Today's Mood</span>
                </div>
                <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors" />
              </div>

              {todayLog?.mood?.length > 0 ? (
                <div>
                  <div className="flex gap-2 flex-wrap mb-3">
                    {todayLog.mood.slice(0, 3).map((m: string) => (
                      <span key={m} className="text-xs px-3 py-1.5 rounded-full bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/20">
                        {m}
                      </span>
                    ))}
                  </div>
                  {todayLog.energy_level && (
                    <div>
                      <div className="flex justify-between text-xs text-white/40 mb-1.5">
                        <span>Energy</span>
                        <span>{todayLog.energy_level * 10}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/8">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-fuchsia-400 to-violet-500 transition-all"
                          style={{ width: `${todayLog.energy_level * 10}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {MOODS.slice(0, 4).map((m, i) => (
                      <span key={i} className="text-2xl opacity-40">{m}</span>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-xs text-fuchsia-400 mt-3">
                {todayLog?.mood?.length ? 'View details →' : 'Log your mood →'}
              </p>
            </div>
          </Link>
        </motion.div>

        {/* Water & Nutrition */}
        <motion.div variants={item}>
          <Link href="/dashboard/nutrition">
            <div className="card p-6 cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-violet-400" />
                  <span className="text-sm font-medium text-white/70">Hydration</span>
                </div>
                <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors" />
              </div>

              <div className="flex items-end gap-2 mb-3">
                <span className="text-4xl font-bold text-white">{(waterMl / 1000).toFixed(1)}</span>
                <span className="text-sm text-white/40 mb-1.5">/ {(waterGoal / 1000).toFixed(1)} L</span>
              </div>

              <div className="h-2 rounded-full bg-white/8 mb-3">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-400 to-indigo-500 transition-all duration-700"
                  style={{ width: `${waterPercent}%` }}
                />
              </div>

              <div className="flex gap-1">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-1 rounded-full transition-all ${
                      i < Math.floor(waterMl / (waterGoal / 8))
                        ? 'bg-violet-400'
                        : 'bg-white/8'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-violet-400 mt-3">
                {waterMl > 0 ? `${Math.round(waterPercent)}% of daily goal` : 'Log water intake →'}
              </p>
            </div>
          </Link>
        </motion.div>

        {/* Sleep */}
        <motion.div variants={item}>
          <Link href="/dashboard/sleep">
            <div className="card p-6 cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BedDouble className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-white/70">Sleep</span>
                </div>
                <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors" />
              </div>

              {lastSleep ? (
                <div>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-4xl font-bold text-white">{lastSleep.duration_hours?.toFixed(1)}</span>
                    <span className="text-sm text-white/40 mb-1.5">hours last night</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`flex-1 h-1.5 rounded-full ${i <= Math.round(lastSleep.quality / 2) ? 'bg-blue-400' : 'bg-white/8'}`} />
                    ))}
                    <span className="text-xs text-white/30">{lastSleep.quality}/10</span>
                  </div>
                  <p className="text-xs text-white/40">7-day avg: <span className="text-blue-400">{formatDuration(avgSleep)}</span></p>
                </div>
              ) : (
                <div>
                  <p className="text-3xl mb-2">😴</p>
                  <p className="text-sm text-white/50">Log your sleep to see insights</p>
                </div>
              )}
              <p className="text-xs text-blue-400 mt-3">
                {lastSleep ? 'View sleep analysis →' : 'Log sleep →'}
              </p>
            </div>
          </Link>
        </motion.div>

        {/* Quick Insights */}
        <motion.div variants={item} className="md:col-span-2 xl:col-span-3">
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-white/70">AI Insights for today</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  icon: '🌙',
                  title: cyclePhase ? `${cyclePhase.phase} phase tips` : 'Set up your cycle',
                  desc: cyclePhase
                    ? 'Your hormones are at peak levels. Great time for social activities and creative projects.'
                    : 'Log your last period date to get personalized cycle insights.',
                  color: '#ff6b8a'
                },
                {
                  icon: '💧',
                  title: 'Hydration reminder',
                  desc: waterMl < waterGoal
                    ? `You need ${((waterGoal - waterMl) / 1000).toFixed(1)}L more water today. Staying hydrated reduces cramps and fatigue.`
                    : 'Amazing! You\'ve hit your daily water goal. Keep it up!',
                  color: '#818cf8'
                },
                {
                  icon: '😴',
                  title: 'Sleep quality',
                  desc: lastSleep
                    ? `Your ${lastSleep.duration_hours?.toFixed(1)}h of sleep is ${lastSleep.duration_hours >= 7 ? 'great' : 'below the recommended 7-9 hours'}. ${lastSleep.duration_hours < 7 ? 'Try sleeping 30min earlier tonight.' : ''}`
                    : 'Track your sleep tonight to discover how your cycle affects your rest patterns.',
                  color: '#60a5fa'
                }
              ].map((insight) => (
                <div key={insight.title} className="p-4 rounded-2xl bg-white/3 border border-white/6">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{insight.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-white mb-1">{insight.title}</p>
                      <p className="text-xs text-white/50 leading-relaxed">{insight.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
