import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftRight,
  ArrowRight,
  CheckCircle2,
  FileDown,
  KeyRound,
  Landmark,
  LockKeyhole,
  Menu,
  ShieldCheck,
  UserCheck,
  Wallet,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

// Everything on this page describes what the app really does today.
const features = [
  {
    icon: Wallet,
    title: 'Savings and current accounts',
    desc: 'Hold more than one account, switch between them in a tap, and see your total balance at a glance.',
  },
  {
    icon: ArrowLeftRight,
    title: 'Instant transfers',
    desc: 'Send money to any Finexus account number or customer ID. Add a note, review, confirm, done.',
  },
  {
    icon: FileDown,
    title: 'Clear history',
    desc: 'Search, filter and sort every deposit, withdrawal and transfer, then export it to CSV.',
  },
];

const securityPoints = [
  { icon: LockKeyhole, label: 'Passwords stored as secure hashes, never in plain text' },
  { icon: KeyRound, label: 'Sign-ins expire automatically after 24 hours' },
  { icon: UserCheck, label: 'You can only see and move money in your own accounts' },
  { icon: ShieldCheck, label: 'Every transfer is reviewed before it is sent' },
];

const steps = [
  { title: 'Create your account', desc: 'Sign up with your name, email and a password.' },
  { title: 'Get your savings account', desc: 'A savings account with its own account number is opened for you automatically.' },
  { title: 'Deposit and send money', desc: 'Add funds, transfer to other Finexus customers, and track it all.' },
];

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#security', label: 'Security' },
  { href: '#how-it-works', label: 'How it works' },
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
      aria-hidden="true"
    >
      <div className="absolute -inset-6 bg-[radial-gradient(circle_at_top_left,rgba(91,124,255,0.35),transparent_50%),radial-gradient(circle_at_bottom_right,rgba(199,255,74,0.3),transparent_45%)] blur-2xl" />
      <div className="relative rounded-[28px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-[var(--shadow-card)] overflow-hidden">
        <div className="p-5 sm:p-6 md:p-8 bg-[var(--hero-bg)]">
          <div className="flex items-start justify-between gap-3 mb-6 sm:mb-8">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">Total balance</p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold text-[var(--text-primary)] mt-1 tabular-nums">₹1,24,580.00</p>
            </div>
            <span className="shrink-0 rounded-full px-2.5 py-1 bg-[var(--bg-surface)]/80 border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-secondary)]">
              Example
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Savings', value: '₹96,080' },
              { label: 'Current', value: '₹28,500' },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/75 backdrop-blur-xl px-3 py-2.5">
                <p className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">{item.label}</p>
                <p className="text-sm font-semibold text-[var(--text-primary)] mt-1 tabular-nums">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 sm:p-6 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-secondary)] mb-3">Recent activity</p>
          <div className="space-y-2.5">
            {[
              ['Salary credit', '+₹85,000', 'text-[var(--positive)]'],
              ['Transfer to ACC0000042 · Rent', '-₹22,000', 'text-[var(--negative)]'],
              ['ATM withdrawal', '-₹2,000', 'text-[var(--negative)]'],
            ].map(([name, amount, cls]) => (
              <div key={name} className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)]">
                <p className="text-sm text-[var(--text-primary)] truncate">{name}</p>
                <p className={`text-sm font-semibold tabular-nums shrink-0 ${cls}`}>{amount}</p>
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

  const primaryCta =
    'inline-flex items-center justify-center h-12 px-6 rounded-xl bg-[var(--accent-primary)] text-white dark:bg-[var(--accent-secondary)] dark:text-[#0B0F14] font-semibold';

  return (
    <div className="min-h-dvh bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-x-clip">
      <header className="sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]/85 backdrop-blur-xl">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2.5" aria-label="Finexus home">
            <div className="w-9 h-9 rounded-xl bg-[var(--accent-primary)] dark:bg-[var(--accent-secondary)] flex items-center justify-center">
              <Landmark size={18} className="text-white dark:text-[#0B0F14]" />
            </div>
            <span className="font-display font-bold text-xl">Finexus</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm text-[var(--text-secondary)]" aria-label="Sections">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="hover:text-[var(--text-primary)] transition-colors">{l.label}</a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle size="sm" />
            <Link to="/login" className="hidden sm:inline-flex h-10 items-center px-4 rounded-xl border border-[var(--border-subtle)] text-sm font-medium hover:bg-[var(--bg-surface-2)] transition-colors">
              Log in
            </Link>
            <Link to="/register" className="hidden sm:inline-flex h-10 items-center px-4 rounded-xl bg-[var(--accent-primary)] text-white dark:bg-[var(--accent-secondary)] dark:text-[#0B0F14] text-sm font-semibold">
              Sign up
            </Link>
            <button
              className="md:hidden p-2 rounded-xl border border-[var(--border-subtle)]"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              aria-controls="landing-mobile-menu"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div id="landing-mobile-menu" className="md:hidden border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3">
            <nav className="space-y-1" aria-label="Sections">
              {navLinks.map((l) => (
                <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="block py-2.5 text-sm text-[var(--text-secondary)]">
                  {l.label}
                </a>
              ))}
            </nav>
            {/* On phones the header has no room for these, so they live here. */}
            <div className="grid grid-cols-2 gap-2 pt-3 mt-2 border-t border-[var(--border-subtle)] sm:hidden">
              <Link to="/login" className="inline-flex h-11 items-center justify-center rounded-xl border border-[var(--border-subtle)] text-sm font-medium">
                Log in
              </Link>
              <Link to="/register" className="inline-flex h-11 items-center justify-center rounded-xl bg-[var(--accent-primary)] text-white dark:bg-[var(--accent-secondary)] dark:text-[#0B0F14] text-sm font-semibold">
                Sign up
              </Link>
            </div>
          </div>
        )}
      </header>

      <main>
        <section className="relative py-14 md:py-24">
          <div className="absolute inset-0 pointer-events-none bg-grid opacity-20" />
          <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 lg:gap-14 items-center">
            <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.6 }}>
              <p className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface-2)] text-xs font-semibold text-[var(--text-secondary)] mb-6">
                <Landmark size={13} className="text-[var(--accent-primary)] dark:text-[var(--accent-secondary)]" />
                Personal banking
              </p>

              <h1 className="font-display font-extrabold leading-[1.05] text-4xl sm:text-5xl lg:text-6xl mb-6">
                Your money,
                <span className="block text-gradient-primary">clear and in control</span>
              </h1>
              <p className="max-w-xl text-base md:text-lg text-[var(--text-secondary)] leading-relaxed mb-8">
                Open an account in minutes, send money instantly to other Finexus customers, and see every rupee you spend and receive in one place.
              </p>

              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 mb-10">
                <Link to="/register" className={`${primaryCta} shadow-[0_10px_25px_var(--accent-primary-soft)] dark:shadow-[0_10px_25px_var(--accent-secondary-soft)]`}>
                  Open an account
                  <ArrowRight size={16} className="ml-2" />
                </Link>
                <Link to="/login" className="inline-flex items-center justify-center h-12 px-6 rounded-xl border border-[var(--border-strong)] font-medium hover:bg-[var(--bg-surface-2)] transition-colors">
                  Log in
                </Link>
              </div>

              <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5 text-sm">
                {[
                  ['Instant', 'Transfers between Finexus accounts'],
                  ['2 types', 'Savings and current accounts'],
                  ['CSV', 'Export your statement anytime'],
                ].map(([value, label]) => (
                  <li key={label} className="flex sm:block items-baseline gap-3">
                    <p className="font-display text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] shrink-0">{value}</p>
                    <p className="text-[var(--text-secondary)] sm:mt-1">{label}</p>
                  </li>
                ))}
              </ul>
            </motion.div>

            <HeroVisual />
          </div>
        </section>

        <section id="features" className="py-16 md:py-20 border-y border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} variants={fadeUp} transition={{ duration: 0.5 }} className="mb-10 md:mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Everything you need for everyday banking</h2>
              <p className="text-[var(--text-secondary)] max-w-2xl">No clutter: your accounts, your transfers and your history, done well.</p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={fadeUp}
                  transition={{ duration: 0.45, delay: i * 0.08 }}
                  className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-soft)]"
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

        <section id="security" className="py-16 md:py-20">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-8 items-center">
            <div className="rounded-3xl p-6 sm:p-8 border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-[var(--shadow-soft)]">
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--text-secondary)] mb-3">Security</p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold mb-4">Built to keep your money yours</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">Every request is checked against your signed-in account, so no one else can view or move your money, and every transfer gets a review step before it goes out.</p>
            </div>

            <ul className="grid sm:grid-cols-2 gap-4">
              {securityPoints.map(({ label, icon: Icon }) => (
                <li key={label} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
                  <Icon size={18} className="text-[var(--accent-primary)] dark:text-[var(--accent-secondary)]" />
                  <p className="text-sm font-medium mt-3">{label}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="how-it-works" className="py-16 md:py-20 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
          <div className="max-w-[1080px] mx-auto px-4 sm:px-6">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-10 text-center">Get started in three steps</h2>
            <ol className="grid md:grid-cols-3 gap-5 mb-12">
              {steps.map((step, i) => (
                <li key={step.title} className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
                  <span className="inline-flex w-9 h-9 items-center justify-center rounded-full bg-[var(--accent-primary-soft)] dark:bg-[var(--accent-secondary-soft)] text-[var(--accent-primary)] dark:text-[var(--accent-secondary)] font-bold mb-4">
                    {i + 1}
                  </span>
                  <h3 className="font-display font-semibold text-lg mb-1.5">{step.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{step.desc}</p>
                </li>
              ))}
            </ol>
            <div className="text-center">
              <Link to="/register" className={primaryCta}>
                Create your account
                <ArrowRight size={16} className="ml-2" />
              </Link>
              <p className="mt-4 text-sm text-[var(--text-secondary)] inline-flex items-center gap-1.5 w-full justify-center">
                <CheckCircle2 size={14} /> Takes about two minutes.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border-subtle)]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between text-sm text-[var(--text-secondary)]">
          <div className="flex items-center gap-2">
            <Landmark size={16} className="text-[var(--accent-primary)] dark:text-[var(--accent-secondary)]" />
            <span>© {new Date().getFullYear()} Finexus</span>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Footer">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="hover:text-[var(--text-primary)]">{l.label}</a>
            ))}
            <Link to="/login" className="hover:text-[var(--text-primary)]">Log in</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
