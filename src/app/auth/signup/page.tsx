'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Moon, Mail, Lock, User, Eye, EyeOff, ArrowRight, Shield } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return toast.error('Please agree to our terms');
    setLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      toast.success('Account created! Check your email to confirm.');
      router.push('/onboarding');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-10">
      <div className="orb orb-luna w-80 h-80 top-[-5%] left-[-5%]" />
      <div className="orb orb-rose w-64 h-64 bottom-[5%] right-[-5%]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md mx-4"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-fuchsia-500 flex items-center justify-center">
              <Moon className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-2xl text-white">Luna</span>
          </Link>
          <h1 className="mt-6 text-3xl font-display font-light text-white">Begin your journey</h1>
          <p className="mt-2 text-white/50 text-sm">Create your free account — no credit card required</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="text-sm text-white/60 mb-2 block">Full name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Your name"
                  className="input-dark w-full pl-10 pr-4 py-3 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-white/60 mb-2 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="input-dark w-full pl-10 pr-4 py-3 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-white/60 mb-2 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Min. 8 characters"
                  className="input-dark w-full pl-10 pr-10 py-3 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div
                onClick={() => setAgreed(!agreed)}
                className={`w-5 h-5 rounded flex-shrink-0 border flex items-center justify-center cursor-pointer transition-all mt-0.5 ${agreed ? 'bg-gradient-to-br from-rose-400 to-fuchsia-500 border-rose-400' : 'border-white/20 bg-transparent'}`}
              >
                {agreed && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
              </div>
              <p className="text-xs text-white/40 leading-relaxed">
                I agree to Luna's{' '}
                <a href="#" className="text-rose-400">Terms of Service</a>{' '}
                and{' '}
                <a href="#" className="text-rose-400">Privacy Policy</a>. 
                My health data is encrypted and never sold.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !agreed}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Create my account <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-white/30">
            <Shield className="w-3.5 h-3.5" />
            <span>End-to-end encrypted. HIPAA compliant.</span>
          </div>

          <p className="mt-4 text-center text-sm text-white/40">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-rose-400 hover:text-rose-300">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
