import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  Zap,
  BarChart3,
  ArrowRight,
  Landmark,
  Lock,
  TrendingUp,
  Globe,
  CheckCircle,
  Menu,
  X,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  Send,
  PiggyBank,
  Star,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

/* ─── Mini animated hero card ─────────────────────────────────── */
function HeroCard() {
  const txFeed = [
    { icon: ArrowDownLeft, label: 'Salary Credited', amt: '+₹85,000', color: '#10B981', time: '2m ago' },
    { icon: Send, label: 'Rent Transfer', amt: '-₹22,000', color: '#F43F5E', time: '1h ago' },
    { icon: ArrowDownLeft, label: 'Freelance Income', amt: '+₹12,500', color: '#10B981', time: '3h ago' },
  ];

  return (
    <div className="animate-float relative w-full max-w-[340px] mx-auto lg:mx-0">
      {/* Multi-color glow */}
      <div className="absolute -inset-4 bg-gradient-to-br from-violet-600/30 via-amber-400/20 to-blue-500/20 blur-3xl rounded-3xl" />

      {/* Glass card */}
      <div
        className="relative rounded-3xl overflow-hidden shadow-2xl"
        style={{
          background: 'linear-gradient(145deg, rgba(20,15,60,0.97) 0%, rgba(15,12,40,0.99) 100%)',
          border: '1px solid rgba(255,255,255,0.10)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Header bar */}
        <div className="flex items-center gap-1.5 px-4 pt-4 pb-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-5 h-5 bg-amber-400 rounded-md flex items-center justify-center">
              <Landmark size={10} className="text-black" />
            </div>
            <span className="text-white/70 text-[11px] font-semibold">Finexus</span>
          </div>
        </div>

        {/* Balance */}
        <div className="px-5 py-4 border-b border-white/8">
          <p className="text-white/40 text-[11px] uppercase tracking-widest mb-1">Portfolio Balance</p>
          <p className="text-white font-display font-bold text-3xl tabular-nums mb-0.5">₹1,28,450<span className="text-white/50 text-lg">.75</span></p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp size={11} className="text-emerald-400" />
            <span className="text-emerald-400 text-[11px] font-semibold">+12.4% this month</span>
          </div>
        </div>

        {/* Mini chart */}
        <div className="px-5 pt-4 pb-3">
          <div className="flex items-end gap-1 h-12">
            {[30, 55, 40, 70, 50, 85, 60, 95, 72].map((h, i) => (
              <div key={i} className="flex-1 rounded-t-sm transition-all" style={{
                height: `${h}%`,
                background: i === 7
                  ? 'linear-gradient(to top, #F0B90B, #FFD700)'
                  : i === 8
                  ? 'rgba(240,185,11,0.45)'
                  : `rgba(124,58,237,${0.12 + i * 0.05})`,
              }} />
            ))}
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-white/30 text-[10px]">Jan</span>
            <span className="text-white/30 text-[10px]">Sep</span>
          </div>
        </div>

        {/* Live feed */}
        <div className="px-5 pb-4 space-y-2">
          <p className="text-white/30 text-[10px] uppercase tracking-widest mb-2">Recent Activity</p>
          {txFeed.map(({ icon: Icon, label, amt, color, time }) => (
            <div key={label} className="flex items-center gap-2.5 py-1.5 border-b border-white/5 last:border-0">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}22` }}>
                <Icon size={13} style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/75 text-[11px] font-medium truncate">{label}</p>
                <p className="text-white/30 text-[9px]">{time}</p>
              </div>
              <p className="text-[11px] font-bold tabular-nums" style={{ color }}>{amt}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="px-5 pb-5 grid grid-cols-3 gap-2">
          {[
            { icon: PiggyBank, label: 'Deposit' },
            { icon: Send, label: 'Transfer' },
            { icon: Wallet, label: 'Withdraw' },
          ].map(({ icon: Icon, label }) => (
            <div key={label}
              className="rounded-xl py-2.5 flex flex-col items-center gap-1 cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Icon size={14} className="text-amber-400" />
              <p className="text-white/50 text-[10px] font-medium">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Floating stat chips */}
      <div
        className="absolute -left-10 top-16 bg-white/10 backdrop-blur-xl rounded-2xl px-3 py-2 border border-white/15 shadow-xl hidden lg:flex flex-col"
        style={{ transform: 'rotate(-6deg)' }}
      >
        <span className="text-white/50 text-[9px] uppercase tracking-wide">Saved</span>
        <span className="text-emerald-400 text-sm font-bold tabular-nums">+₹2,150</span>
      </div>

      <div
        className="absolute -right-8 bottom-24 bg-white/10 backdrop-blur-xl rounded-2xl px-3 py-2 border border-white/15 shadow-xl hidden lg:flex flex-col"
        style={{ transform: 'rotate(5deg)' }}
      >
        <span className="text-white/50 text-[9px] uppercase tracking-wide">Transfers</span>
        <span className="text-violet-400 text-sm font-bold">Instant</span>
      </div>
    </div>
  );
}

/* ─── Feature card ─────────────────────────────────────────────── */
const features = [
  {
    icon: Zap,
    title: 'Instant Transfers',
    desc: 'Real-time fund transfers with immediate confirmation and downloadable receipts.',
    color: '#F0B90B',
    glow: 'rgba(240,185,11,0.15)',
  },
  {
    icon: BarChart3,
    title: 'Smart Insights',
    desc: 'Visual cashflow charts and transaction breakdowns illuminate your spending patterns.',
    color: '#A78BFA',
    glow: 'rgba(167,139,250,0.15)',
  },
  {
    icon: Shield,
    title: 'Bank-Grade Security',
    desc: 'JWT-authenticated sessions, TLS encryption, and real-time fraud monitoring.',
    color: '#60A5FA',
    glow: 'rgba(96,165,250,0.15)',
  },
  {
    icon: PiggyBank,
    title: 'Easy Deposits',
    desc: 'Deposit or withdraw with one tap. Quick-amount presets make it frictionless.',
    color: '#10B981',
    glow: 'rgba(16,185,129,0.15)',
  },
];

/* ─── Stats ────────────────────────────────────────────────────── */
const stats = [
  { value: '₹50Cr+', label: 'Transacted daily' },
  { value: '99.99%', label: 'Uptime SLA' },
  { value: '<50ms', label: 'Transfer latency' },
  { value: '256-bit', label: 'AES Encryption' },
];

/* ─── Testimonials ─────────────────────────────────────────────── */
const testimonials = [
  {
    name: 'Arjun Mehta',
    role: 'Startup Founder',
    text: 'Finexus replaced three tools. The instant transfer and live dashboard is exactly what my team needed.',
    stars: 5,
  },
  {
    name: 'Priya Nair',
    role: 'Freelance Designer',
    text: 'I get paid via Finexus and immediately see it reflected. The UX is stunning — feels like a premium product.',
    stars: 5,
  },
  {
    name: 'Rahul Kapoor',
    role: 'Finance Manager',
    text: 'The transaction history with CSV export saves hours every month. Genuinely the best banking UI I\'ve used.',
    stars: 5,
  },
];

/* ─── Trust badges ─────────────────────────────────────────────── */
const trustBadges = [
  { icon: Lock, label: '256-bit encryption' },
  { icon: Zap, label: 'Real-time processing' },
  { icon: Globe, label: '24/7 availability' },
  { icon: CheckCircle, label: 'Instant confirmations' },
];

/* ─── Main page ────────────────────────────────────────────────── */
export default function LandingPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-x-hidden">

      {/* ── Sticky Nav ───────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-[var(--bg-primary)]/80 backdrop-blur-2xl border-b border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(240,185,11,0.5)]">
              <Landmark size={17} className="text-black" />
            </div>
            <span className="font-display font-bold text-xl text-[var(--text-primary)] tracking-tight">Finexus</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {['#features', '#stats', '#testimonials'].map((href, i) => (
              <a key={href} href={href}
                className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                {['Product', 'Why Us', 'Reviews'][i]}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle size="sm" />
            <Link to="/login" className="hidden sm:inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)] transition-all">
              Sign in
            </Link>
            <Link to="/register">
              <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-amber-400 to-amber-500 text-black hover:from-amber-500 hover:to-amber-600 transition-all shadow-[0_0_16px_rgba(240,185,11,0.4)] hover:shadow-[0_0_24px_rgba(240,185,11,0.6)]">
                Get Started <ArrowRight size={14} />
              </button>
            </Link>
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="md:hidden p-2 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)] transition-colors"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] py-3 px-4 space-y-1 animate-fade-in">
            {['Product', 'Why Us', 'Reviews'].map((label, i) => (
              <a key={label} href={['#features', '#stats', '#testimonials'][i]}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2.5 px-3 text-sm font-medium text-[var(--text-secondary)] rounded-lg hover:bg-[var(--bg-surface-2)] hover:text-[var(--text-primary)] transition-colors">
                {label}
              </a>
            ))}
            <Link to="/login" onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 px-3 text-sm font-medium text-[var(--text-secondary)] rounded-lg hover:bg-[var(--bg-surface-2)] hover:text-[var(--text-primary)] transition-colors">
              Sign in
            </Link>
          </div>
        )}
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative pt-20 pb-28 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0f0c29 0%, #302b63 45%, #1a0533 100%)' }}>

        {/* Decorative orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full opacity-20 animate-float-1 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #7C3AED 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 rounded-full opacity-15 animate-float-2 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #F0B90B 0%, transparent 70%)', filter: 'blur(50px)' }} />
        <div className="absolute top-1/3 right-10 w-64 h-64 rounded-full opacity-10 animate-float-3 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #60A5FA 0%, transparent 70%)', filter: 'blur(40px)' }} />

        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Text */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 border"
                style={{ background: 'rgba(240,185,11,0.12)', borderColor: 'rgba(240,185,11,0.3)' }}>
                <Sparkles size={13} className="text-amber-400" />
                <span className="text-amber-400 text-xs font-semibold tracking-wide">Next-Gen Banking Platform</span>
              </div>

              <h1 className="font-display font-extrabold leading-[1.05] mb-6 text-white"
                style={{ fontSize: 'clamp(2.8rem, 6vw, 4.5rem)' }}>
                Banking that feels{' '}
                <span className="text-gradient-gold">like the future.</span>
              </h1>

              <p className="text-lg text-white/60 leading-relaxed mb-10 max-w-lg">
                A private banking platform with real-time transfers, intelligent insights, and bank-grade security —
                built for the way you manage money today.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-12">
                <Link to="/register">
                  <button className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-base font-bold bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black shadow-[0_0_30px_rgba(240,185,11,0.5)] hover:shadow-[0_0_50px_rgba(240,185,11,0.7)] transition-all hover:scale-[1.02]">
                    Open an Account
                    <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </Link>
                <Link to="/login">
                  <button className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold text-white border border-white/20 hover:bg-white/10 hover:border-white/40 transition-all">
                    Sign In
                  </button>
                </Link>
              </div>

              {/* Trust row */}
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                {trustBadges.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-sm text-white/40">
                    <Icon size={13} className="text-amber-400 flex-shrink-0" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero card */}
            <div className="flex justify-center lg:justify-end">
              <HeroCard />
            </div>
          </div>
        </div>

        {/* Bottom fade into bg */}
        <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, var(--bg-primary))' }} />
      </section>

      {/* ── Stats strip ──────────────────────────────────────────── */}
      <section id="stats" className="py-16 border-y border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="font-display font-extrabold text-3xl md:text-4xl text-gradient-gold mb-1">{value}</p>
                <p className="text-sm text-[var(--text-secondary)]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--accent-purple)]/30 bg-[var(--accent-purple-soft)] mb-4">
              <Sparkles size={12} className="text-[var(--accent-purple)]" />
              <span className="text-xs font-semibold text-[var(--accent-purple)]">Platform Features</span>
            </div>
            <h2 className="font-display font-extrabold text-4xl md:text-5xl mb-5">
              Everything your bank{' '}
              <span className="text-gradient-purple">should be</span>
            </h2>
            <p className="text-[var(--text-secondary)] max-w-xl mx-auto text-lg">
              Built on a microservices architecture with real API integration — not a prototype.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map(({ icon: Icon, title, desc, color, glow }) => (
              <div
                key={title}
                className="group relative rounded-2xl p-6 border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:scale-[1.03] transition-all duration-300 cursor-default overflow-hidden"
              >
                {/* Glow on hover */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ background: `radial-gradient(ellipse at 50% 0%, ${glow} 0%, transparent 70%)` }} />

                <div className="relative">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                    style={{ background: glow, border: `1px solid ${color}30` }}>
                    <Icon size={22} style={{ color }} />
                  </div>
                  <h3 className="font-display font-bold text-[var(--text-primary)] text-base mb-2">{title}</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────── */}
      <section className="py-24 border-t border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left text */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--accent-blue)]/30 bg-[var(--accent-blue-soft)] mb-5">
                <Zap size={12} className="text-[var(--accent-blue)]" />
                <span className="text-xs font-semibold text-[var(--accent-blue)]">How It Works</span>
              </div>
              <h2 className="font-display font-extrabold text-4xl md:text-5xl leading-tight mb-6">
                Go from sign-up to{' '}
                <span className="text-gradient-multi">first transfer</span>
                {' '}in minutes.
              </h2>
              <p className="text-[var(--text-secondary)] text-lg leading-relaxed mb-8">
                No paperwork. No branch visits. No waiting. Create your account, deposit funds, and start transacting immediately.
              </p>

              {/* Steps */}
              <div className="space-y-5">
                {[
                  { step: '01', title: 'Create your account', desc: 'Register in under 60 seconds with email & password.', color: '#F0B90B' },
                  { step: '02', title: 'Deposit funds', desc: 'Add money instantly using quick-amount presets or custom amount.', color: '#A78BFA' },
                  { step: '03', title: 'Transfer & track', desc: 'Send money anywhere and monitor your finances on the dashboard.', color: '#60A5FA' },
                ].map(({ step, title, desc, color }) => (
                  <div key={step} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-display font-black text-sm"
                      style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
                      {step}
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--text-primary)] mb-0.5">{title}</p>
                      <p className="text-sm text-[var(--text-secondary)]">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link to="/register" className="inline-flex items-center gap-2 mt-8">
                <button className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-[0_0_20px_rgba(240,185,11,0.4)] hover:shadow-[0_0_36px_rgba(240,185,11,0.6)] transition-all hover:scale-[1.02]">
                  Start for free
                  <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </Link>
            </div>

            {/* Right: mini dashboard preview */}
            <div className="relative">
              <div className="absolute -inset-6 bg-gradient-to-br from-violet-600/10 to-blue-500/10 blur-2xl rounded-3xl pointer-events-none" />
              <div className="relative rounded-2xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-2xl p-5 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                      <Landmark size={11} className="text-black" />
                    </div>
                    <span className="text-sm font-bold font-display text-[var(--text-primary)]">Finexus Dashboard</span>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>

                {/* Balance row */}
                <div className="flex gap-3">
                  {[
                    { label: 'Balance', val: '₹1,28,450', clr: 'var(--accent-gold)' },
                    { label: 'Credits', val: '₹98,200', clr: '#10B981' },
                    { label: 'Debits', val: '₹24,350', clr: '#F43F5E' },
                  ].map(({ label, val, clr }) => (
                    <div key={label} className="flex-1 rounded-xl p-3 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)]">
                      <p className="text-[10px] text-[var(--text-secondary)] mb-1">{label}</p>
                      <p className="text-sm font-black tabular-nums font-display" style={{ color: clr }}>{val}</p>
                    </div>
                  ))}
                </div>

                {/* Fake bar chart */}
                <div>
                  <p className="text-xs text-[var(--text-secondary)] mb-2 font-medium">Monthly Cashflow</p>
                  <div className="flex items-end gap-1.5 h-16">
                    {[55, 72, 48, 90, 65, 85, 70, 95, 60, 88, 75, 100].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t-md transition-all"
                        style={{
                          height: `${h}%`,
                          background: i % 2 === 0
                            ? 'linear-gradient(to top, #7C3AED, #A78BFA)'
                            : 'linear-gradient(to top, #C9920A, #F0B90B)',
                          opacity: 0.7 + (i / 12) * 0.3,
                        }} />
                    ))}
                  </div>
                </div>

                {/* Recent transactions */}
                <div className="space-y-1.5">
                  <p className="text-xs text-[var(--text-secondary)] font-medium">Recent Transactions</p>
                  {[
                    { icon: ArrowDownLeft, label: 'Salary Credited', val: '+₹85,000', color: '#10B981' },
                    { icon: ArrowUpRight, label: 'Rent Transfer', val: '-₹22,000', color: '#F43F5E' },
                    { icon: ArrowDownLeft, label: 'Freelance Income', val: '+₹12,500', color: '#10B981' },
                  ].map(({ icon: Icon, label, val, color }) => (
                    <div key={label} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[var(--bg-surface-2)] transition-colors">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: `${color}18` }}>
                        <Icon size={12} style={{ color }} />
                      </div>
                      <p className="flex-1 text-xs text-[var(--text-primary)] font-medium">{label}</p>
                      <p className="text-xs font-bold tabular-nums" style={{ color }}>{val}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────── */}
      <section id="testimonials" className="py-24 border-t border-[var(--border-subtle)]"
        style={{ background: 'linear-gradient(to bottom, var(--bg-primary), var(--bg-surface))' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--positive)]/30 bg-[var(--positive)]/10 mb-4">
              <Star size={12} className="text-[var(--positive)]" />
              <span className="text-xs font-semibold text-[var(--positive)]">Customer Stories</span>
            </div>
            <h2 className="font-display font-extrabold text-4xl md:text-5xl mb-4">
              Loved by thousands
            </h2>
            <p className="text-[var(--text-secondary)] text-lg">Real feedback from real Finexus users.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, text, stars }) => (
              <div key={name}
                className="group relative rounded-2xl p-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--accent-gold)]/30 hover:scale-[1.02] transition-all duration-300 shadow-[var(--shadow-card)]">
                <div className="absolute top-0 left-0 right-0 h-px rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(240,185,11,0.5), transparent)' }} />

                <div className="flex mb-4">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-5">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-black"
                    style={{ background: 'linear-gradient(135deg, #F0B90B, #A78BFA)' }}>
                    {name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{name}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Security banner ───────────────────────────────────────── */}
      <section className="py-20 border-t border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="relative rounded-3xl p-8 md:p-12 overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(240,185,11,0.08) 100%)',
              border: '1px solid rgba(124,58,237,0.2)',
            }}>
            {/* Orbs */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 pointer-events-none"
              style={{ background: 'radial-gradient(circle, #7C3AED, transparent)', filter: 'blur(40px)' }} />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10 pointer-events-none"
              style={{ background: 'radial-gradient(circle, #F0B90B, transparent)', filter: 'blur(30px)' }} />

            <div className="relative flex flex-col md:flex-row items-center gap-8">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 animate-pulse-glow"
                style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)' }}>
                <Shield size={36} className="text-violet-400" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="font-display font-extrabold text-3xl md:text-4xl mb-3">
                  Security you can <span className="text-gradient-purple">trust</span>
                </h2>
                <p className="text-[var(--text-secondary)] leading-relaxed max-w-2xl">
                  Every request is authenticated with JWT tokens. Data is encrypted in transit with TLS.
                  Our Spring Cloud microservices architecture isolates every service boundary.
                </p>
              </div>
              <Link to="/register" className="flex-shrink-0">
                <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-violet-500 to-violet-600 text-white shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:shadow-[0_0_36px_rgba(124,58,237,0.6)] transition-all hover:scale-[1.02]">
                  Get started free <ArrowRight size={15} />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────── */}
      <section className="py-24 border-t border-[var(--border-subtle)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="relative rounded-3xl p-12 md:p-20 overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #1a0533 100%)',
            }}>
            {/* Orbs */}
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-64 rounded-full opacity-20 animate-float-1 pointer-events-none"
              style={{ background: 'radial-gradient(circle, #F0B90B, transparent)', filter: 'blur(50px)' }} />
            <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-64 h-64 rounded-full opacity-15 animate-float-2 pointer-events-none"
              style={{ background: 'radial-gradient(circle, #A78BFA, transparent)', filter: 'blur(50px)' }} />

            <div className="relative">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 mb-6">
                <Sparkles size={12} className="text-amber-400" />
                <span className="text-xs font-semibold text-amber-400">Limited Early Access</span>
              </div>
              <h2 className="font-display font-extrabold text-white leading-tight mb-5"
                style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
                Ready to bank smarter?
              </h2>
              <p className="text-white/50 text-lg mb-10 max-w-lg mx-auto">
                Create your free account in minutes. No fees, no minimums, no paperwork.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to="/register">
                  <button className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black shadow-[0_0_40px_rgba(240,185,11,0.5)] hover:shadow-[0_0_60px_rgba(240,185,11,0.7)] transition-all hover:scale-[1.03]">
                    Create your free account
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <Link to="/login">
                  <button className="inline-flex items-center gap-2 px-6 py-4 rounded-xl text-base font-semibold text-white border border-white/20 hover:bg-white/10 hover:border-white/40 transition-all">
                    Sign in instead
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-[var(--border-subtle)] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
                  <Landmark size={14} className="text-black" />
                </div>
                <span className="font-display font-bold text-[var(--text-primary)] text-lg">Finexus</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                A premium banking experience built with React & Spring Boot microservices. Designed for the modern era.
              </p>
            </div>

            {[
              { title: 'Product', links: ['Dashboard', 'Deposits', 'Transfers', 'Transactions'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'Cookies'] },
            ].map(({ title, links }) => (
              <div key={title}>
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-4">{title}</p>
                <ul className="space-y-2.5">
                  {links.map((item) => (
                    <li key={item}>
                      <a href="#" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-[var(--border-subtle)] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-[var(--text-secondary)]">© 2025 Finexus · All rights reserved</p>
            <div className="flex items-center gap-3">
              <ThemeToggle size="sm" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
