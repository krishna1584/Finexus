import { useEffect, useState, type ComponentType } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Building2,
  Landmark,
  Menu,
  ShieldCheck,
  Sparkles,
  Wallet,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const features = [
  {
    icon: Wallet,
    title: 'Unified Cash Management',
    desc: 'Accounts, balances, transfers, and statements in one elegant command center.',
  },
  {
    icon: BarChart3,
    title: 'Insightful Analytics',
    desc: 'Track budgets, categories, and cashflow with charts designed for decision speed.',
  },
  {
    icon: ShieldCheck,
    title: 'Enterprise Security',
    desc: 'Bank-grade authentication and hardened service boundaries by design.',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function HeroVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="relative mx-auto w-full max-w-[560px]"
    >
      <div className="absolute -inset-6 bg-[radial-gradient(circle_at_top_left,rgba(91,124,255,0.35),transparent_50%),radial-gradient(circle_at_bottom_right,rgba(199,255,74,0.3),transparent_45%)] blur-2xl" />
      <div className="relative rounded-[28px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-[var(--shadow-card)] overflow-hidden">
        <div className="p-6 md:p-8 bg-[var(--hero-bg)]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">Portfolio Value</p>
              <p className="text-3xl md:text-4xl font-display font-extrabold text-[var(--text-primary)] mt-1">$248,920.42</p>
            </div>
            <div className="rounded-2xl px-3 py-1.5 bg-[var(--accent-secondary-soft)] text-[#2d3d00] dark:text-[var(--accent-secondary)] text-xs font-semibold">
              +8.4% MTD
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Available', value: '$84,600' },
              { label: 'Savings', value: '$132,400' },
              { label: 'Investments', value: '$31,920' },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/75 backdrop-blur-xl px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-wide text-[var(--text-secondary)]">{item.label}</p>
                <p className="text-sm font-semibold text-[var(--text-primary)] mt-1 tabular-nums">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-secondary)] mb-3">Recent Activity</p>
          <div className="space-y-3">
            {[
              ['Salary credited', '+$12,000', 'text-[var(--positive)]'],
              ['Card settlement', '-$1,420', 'text-[var(--negative)]'],
              ['ETF auto-invest', '-$600', 'text-[var(--negative)]'],
            ].map(([name, amount, cls]) => (
              <div key={name} className="flex items-center justify-between rounded-xl px-3 py-2.5 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)]">
                <p className="text-sm text-[var(--text-primary)]">{name}</p>
                <p className={`text-sm font-semibold tabular-nums ${cls}`}>{amount}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-x-hidden">
      <header className="sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]/85 backdrop-blur-xl">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--accent-primary)] dark:bg-[var(--accent-secondary)] flex items-center justify-center">
              <Landmark size={18} className="text-white dark:text-[#0B0F14]" />
            </div>
            <span className="font-display font-bold text-xl">Finexus</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm text-[var(--text-secondary)]">
            <a href="#features" className="hover:text-[var(--text-primary)] transition-colors">Features</a>
            <a href="#security" className="hover:text-[var(--text-primary)] transition-colors">Security</a>
            <a href="#pricing" className="hover:text-[var(--text-primary)] transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle size="sm" />
            <Link to="/login" className="hidden sm:inline-flex h-10 items-center px-4 rounded-xl border border-[var(--border-subtle)] text-sm font-medium hover:bg-[var(--bg-surface-2)] transition-colors">
              Log in
            </Link>
            <Link to="/register" className="inline-flex h-10 items-center px-4 rounded-xl bg-[var(--accent-primary)] text-white dark:bg-[var(--accent-secondary)] dark:text-[#0B0F14] text-sm font-semibold">
              Sign up
            </Link>
            <button
              className="md:hidden p-2 rounded-xl border border-[var(--border-subtle)]"
              aria-label="Open menu"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="md:hidden border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3 space-y-2">
            <a href="#features" className="block py-2 text-sm text-[var(--text-secondary)]">Features</a>
            <a href="#security" className="block py-2 text-sm text-[var(--text-secondary)]">Security</a>
            <a href="#pricing" className="block py-2 text-sm text-[var(--text-secondary)]">Pricing</a>
          </div>
        )}
      </header>

      <main>
        <section className="relative py-18 md:py-24">
          <div className="absolute inset-0 pointer-events-none bg-grid opacity-20" />
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-14 items-center">
            <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface-2)] text-xs font-semibold text-[var(--text-secondary)] mb-6">
                <Sparkles size={13} className="text-[var(--accent-primary)] dark:text-[var(--accent-secondary)]" />
                New: AI-powered spending insights
              </div>

              <h1 className="font-display font-extrabold leading-[1.05] text-4xl sm:text-5xl lg:text-6xl mb-6">
                The Premium Operating System for
                <span className="block text-gradient-primary"> Modern Finance Teams</span>
              </h1>
              <p className="max-w-xl text-base md:text-lg text-[var(--text-secondary)] leading-relaxed mb-8">
                Finexus unifies banking, transfers, budgets, and analytics in one elegant workspace. Built for people who expect speed, clarity, and control.
              </p>

              <div className="flex flex-wrap items-center gap-3 mb-10">
                <Link to="/register" className="inline-flex items-center h-12 px-6 rounded-xl bg-[var(--accent-primary)] text-white dark:bg-[var(--accent-secondary)] dark:text-[#0B0F14] font-semibold shadow-[0_10px_25px_var(--accent-primary-soft)] dark:shadow-[0_10px_25px_var(--accent-secondary-soft)]">
                  Open Finexus
                  <ArrowRight size={16} className="ml-2" />
                </Link>
                <Link to="/login" className="inline-flex items-center h-12 px-6 rounded-xl border border-[var(--border-strong)] font-medium hover:bg-[var(--bg-surface-2)] transition-colors">
                  View Dashboard
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-5 text-sm">
                {[
                  ['99.99%', 'Uptime'],
                  ['<50ms', 'Transfer latency'],
                  ['$0', 'Setup fee'],
                ].map(([value, label]) => (
                  <div key={label}>
                    <p className="font-display text-2xl font-extrabold text-[var(--text-primary)]">{value}</p>
                    <p className="text-[var(--text-secondary)] mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <HeroVisual />
          </div>
        </section>

        <section id="features" className="py-20 border-y border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} variants={fadeUp} transition={{ duration: 0.5 }} className="mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Designed to feel expensive, built to move fast</h2>
              <p className="text-[var(--text-secondary)] max-w-2xl">Every interaction is engineered for enterprise-grade finance workflows without visual noise.</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-5">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={fadeUp}
                  transition={{ duration: 0.45, delay: i * 0.08 }}
                  className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-soft)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)] transition-all"
                >
                  <div className="w-11 h-11 rounded-xl bg-[var(--accent-primary-soft)] dark:bg-[var(--accent-secondary-soft)] flex items-center justify-center mb-4">
                    <f.icon size={20} className="text-[var(--accent-primary)] dark:text-[var(--accent-secondary)]" />
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="security" className="py-20">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-8 items-center">
            <div className="rounded-3xl p-8 border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-[var(--shadow-soft)]">
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--text-secondary)] mb-3">Trusted Infrastructure</p>
              <h3 className="font-display text-3xl font-bold mb-4">Built like fintech infrastructure, not a template</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">Finexus combines robust backend services with a polished front-end experience for teams that manage serious money movements every day.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {([
                ['SOC-ready practices', Building2],
                ['Audit-friendly logs', BadgeCheck],
                ['Role-based workflows', ShieldCheck],
                ['Instant transfer rails', ArrowRight],
              ] as [string, ComponentType<any>][]).map(([label, Icon]) => (
                <div key={label} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
                  <Icon size={18} className="text-[var(--accent-primary)] dark:text-[var(--accent-secondary)]" />
                  <p className="text-sm font-medium mt-3">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="py-18 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
          <div className="max-w-[900px] mx-auto px-4 sm:px-6 text-center">
            <h3 className="font-display text-3xl md:text-4xl font-extrabold mb-4">Ready to run your finances like a modern SaaS business?</h3>
            <p className="text-[var(--text-secondary)] mb-8">Start free, scale as your business grows, and keep your operations inside one premium workspace.</p>
            <Link to="/register" className="inline-flex items-center h-12 px-6 rounded-xl bg-[var(--accent-primary)] text-white dark:bg-[var(--accent-secondary)] dark:text-[#0B0F14] font-semibold">
              Create Finexus account
              <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}