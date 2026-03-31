'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Moon, Heart, Brain, Zap, MessageCircle, Mic, Camera,
  ArrowRight, Star, Shield, Sparkles, Activity
} from 'lucide-react';

const features = [
  {
    icon: Moon,
    title: 'Cycle Intelligence',
    description: 'Predict your period, ovulation, and fertile window with 99% accuracy using our AI model.',
    color: '#ff6b8a',
    gradient: 'from-rose-500/20 to-pink-500/10',
  },
  {
    icon: Brain,
    title: 'Mood & Mind Tracking',
    description: 'Understand emotional patterns across your cycle phases with AI-powered mood analysis.',
    color: '#d946ef',
    gradient: 'from-fuchsia-500/20 to-purple-500/10',
  },
  {
    icon: Zap,
    title: 'Nutrition & Hydration',
    description: 'Log meals, track water intake, and get cycle-synced nutrition recommendations.',
    color: '#818cf8',
    gradient: 'from-violet-500/20 to-indigo-500/10',
  },
  {
    icon: Activity,
    title: 'Sleep Analysis',
    description: 'Track sleep quality and discover how your cycle affects your rest patterns.',
    color: '#34d399',
    gradient: 'from-emerald-500/20 to-teal-500/10',
  },
  {
    icon: MessageCircle,
    title: 'AI Health Chat',
    description: '24/7 intelligent health assistant powered by Claude AI. Ask anything, get expert answers.',
    color: '#fb923c',
    gradient: 'from-orange-500/20 to-amber-500/10',
  },
  {
    icon: Camera,
    title: 'Image Analysis',
    description: 'Upload health reports, nutrition labels, or symptoms for instant AI analysis.',
    color: '#60a5fa',
    gradient: 'from-blue-500/20 to-sky-500/10',
  },
];

const stats = [
  { value: '2M+', label: 'Women trust Luna' },
  { value: '99%', label: 'Prediction accuracy' },
  { value: '24/7', label: 'AI support' },
  { value: '4.9★', label: 'App store rating' },
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background orbs */}
      <div className="orb orb-rose w-96 h-96 top-[-10%] right-[-10%]" />
      <div className="orb orb-luna w-80 h-80 top-[40%] left-[-8%]" />
      <div className="orb orb-violet w-64 h-64 bottom-[10%] right-[20%]" />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-400 to-fuchsia-500 flex items-center justify-center">
            <Moon className="w-5 h-5 text-white" />
          </div>
          <span className="font-display text-2xl font-semibold text-white">Luna</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {['Features', 'How it works', 'About'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(' ', '-')}`}
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="btn-ghost text-sm px-4 py-2 hidden md:block"
          >
            Sign in
          </Link>
          <Link
            href="/auth/signup"
            className="btn-primary text-sm px-5 py-2 inline-flex items-center gap-2"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 text-sm">
            <Sparkles className="w-4 h-4 text-rose-400" />
            <span className="text-white/70">Powered by Claude AI — your 24/7 health companion</span>
          </div>

          <h1 className="font-display text-6xl md:text-8xl font-light leading-[1.05] mb-6">
            <span className="text-white">Know your body.</span>
            <br />
            <span className="gradient-text italic">Thrive every day.</span>
          </h1>

          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            Luna is the most intelligent women's health companion — tracking your cycle, 
            mood, nutrition, and sleep with AI insights that adapt to <em>you</em>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/signup"
              className="btn-primary px-8 py-4 text-base inline-flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              Start your journey
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/auth/login"
              className="btn-ghost px-8 py-4 text-base w-full sm:w-auto justify-center text-center"
            >
              Sign in to Luna
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-2 mt-8">
            <div className="flex -space-x-2">
              {['bg-rose-400', 'bg-fuchsia-400', 'bg-violet-400', 'bg-pink-400'].map((c, i) => (
                <div key={i} className={`w-8 h-8 rounded-full ${c} border-2 border-surface-1 flex items-center justify-center text-xs text-white font-bold`}>
                  {['A', 'M', 'S', 'R'][i]}
                </div>
              ))}
            </div>
            <div className="text-sm text-white/50">
              <span className="text-white/80 font-medium">2M+ women</span> trust Luna with their health
            </div>
          </div>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20 relative max-w-5xl mx-auto"
        >
          <div className="glass rounded-3xl p-1 shadow-2xl" style={{ boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1)' }}>
            <div className="bg-surface-2 rounded-[22px] p-6 min-h-[400px] flex items-center justify-center">
              <div className="grid grid-cols-3 gap-4 w-full max-w-2xl">
                {/* Cycle card preview */}
                <div className="col-span-1 card p-4 flex flex-col items-center justify-center gap-3">
                  <div className="relative w-20 h-20">
                    <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,107,138,0.15)" strokeWidth="6" />
                      <circle cx="40" cy="40" r="32" fill="none" stroke="#ff6b8a" strokeWidth="6" strokeLinecap="round" strokeDasharray="201" strokeDashoffset="80" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-bold text-white">14</span>
                      <span className="text-[10px] text-white/40">of 28</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-white">Ovulatory</p>
                    <p className="text-[10px] text-white/40">Day 14</p>
                  </div>
                </div>

                {/* Mood card */}
                <div className="col-span-2 card p-4">
                  <p className="text-xs text-white/40 mb-3">Today's Mood</p>
                  <div className="flex gap-2 flex-wrap">
                    {['😊 Happy', '⚡ Energetic', '🎯 Focused'].map(m => (
                      <span key={m} className="text-xs px-3 py-1.5 rounded-full glass border border-fuchsia-500/20 text-white/70">{m}</span>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-surface-4">
                      <div className="w-[75%] h-full rounded-full bg-gradient-to-r from-rose-400 to-fuchsia-500" />
                    </div>
                    <span className="text-xs text-white/40">75% energy</span>
                  </div>
                </div>

                {/* Water */}
                <div className="col-span-1 card p-4">
                  <p className="text-xs text-white/40 mb-2">Water</p>
                  <p className="text-2xl font-bold text-white">1.8<span className="text-sm text-white/40">L</span></p>
                  <div className="mt-2 flex gap-1">
                    {[1,2,3,4,5,6,7,8].map((i) => (
                      <div key={i} className={`flex-1 h-1.5 rounded-full ${i <= 6 ? 'bg-violet-400' : 'bg-surface-4'}`} />
                    ))}
                  </div>
                </div>

                {/* Sleep */}
                <div className="col-span-1 card p-4">
                  <p className="text-xs text-white/40 mb-2">Sleep</p>
                  <p className="text-2xl font-bold text-white">7.5<span className="text-sm text-white/40">h</span></p>
                  <div className="mt-2 flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-xs text-white/40">Good quality</span>
                  </div>
                </div>

                {/* AI Chat preview */}
                <div className="col-span-1 card p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-rose-400 to-fuchsia-500 flex items-center justify-center">
                      <Moon className="w-3 h-3 text-white" />
                    </div>
                    <p className="text-[10px] text-white/40">Luna AI</p>
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <p className="text-[10px] text-white/60 leading-relaxed">You're in your ovulatory phase — great time for...</p>
                </div>
              </div>
            </div>
          </div>
          {/* Glow under preview */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-rose-500/10 blur-3xl -z-10 rounded-full" />
        </motion.div>
      </section>

      {/* Stats */}
      <section className="relative z-10 border-y border-white/5 py-12">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <p className="font-display text-4xl font-light gradient-text mb-1">{s.value}</p>
              <p className="text-sm text-white/40">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="font-display text-5xl font-light text-white mb-4">
            Everything you need,<br />
            <span className="gradient-text italic">beautifully unified</span>
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Luna combines powerful health tracking with AI intelligence to give you a complete picture of your wellness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="card p-6 group cursor-pointer"
            >
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}
                style={{ boxShadow: `0 0 20px ${f.color}30` }}
              >
                <f.icon className="w-6 h-6" style={{ color: f.color }} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-24 text-center">
        <div className="card p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-fuchsia-500/10 to-violet-500/10" />
          <div className="relative z-10">
            <Shield className="w-10 h-10 text-rose-400 mx-auto mb-5" />
            <h2 className="font-display text-5xl font-light text-white mb-4">
              Your health journey<br />
              <span className="gradient-text italic">starts today</span>
            </h2>
            <p className="text-white/50 mb-8 text-lg">
              Join millions of women who trust Luna with their most intimate health data — always private, always secure.
            </p>
            <Link
              href="/auth/signup"
              className="btn-primary px-10 py-4 text-base inline-flex items-center gap-2"
            >
              Create your free account
              <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="text-white/30 text-sm mt-4">No credit card required. Free forever.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Moon className="w-5 h-5 text-rose-400" />
            <span className="font-display text-lg text-white/70">Luna Health</span>
          </div>
          <p className="text-sm text-white/30">© 2025 Luna Health. All rights reserved. Privacy-first, always.</p>
          <div className="flex gap-6 text-sm text-white/30">
            <a href="#" className="hover:text-white/60 transition-colors">Privacy</a>
            <a href="#" className="hover:text-white/60 transition-colors">Terms</a>
            <a href="#" className="hover:text-white/60 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
