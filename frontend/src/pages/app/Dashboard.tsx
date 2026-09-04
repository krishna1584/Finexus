import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Bell,
  Briefcase,
  Building2,
  CalendarClock,
  CreditCard,
  PiggyBank,
  Plus,
  Send,
  Wallet,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAuthStore } from '@/store/useAuthStore';
import { useAccounts } from '@/hooks/useAccounts';
import { useTransactions } from '@/hooks/useTransactions';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, TxTypeBadge } from '@/components/ui/Badge';
import { SkeletonCard, SkeletonTable } from '@/components/ui/Skeleton';
import { formatCurrency, formatTimeAgo, isCredit, maskAccountNumber } from '@/utils';

const spendingData = [
  { month: 'Jan', spend: 4200 },
  { month: 'Feb', spend: 3900 },
  { month: 'Mar', spend: 4700 },
  { month: 'Apr', spend: 5150 },
  { month: 'May', spend: 4820 },
  { month: 'Jun', spend: 5340 },
  { month: 'Jul', spend: 5510 },
];

const incomeExpenseData = [
  { month: 'Feb', income: 12800, expense: 7800 },
  { month: 'Mar', income: 13200, expense: 8400 },
  { month: 'Apr', income: 12100, expense: 7600 },
  { month: 'May', income: 13900, expense: 8950 },
  { month: 'Jun', income: 14320, expense: 8720 },
  { month: 'Jul', income: 14900, expense: 9230 },
];

const topCategories = [
  { name: 'Operations', spent: 3520, color: 'var(--accent-primary)' },
  { name: 'Payroll', spent: 2150, color: 'var(--positive)' },
  { name: 'Cloud', spent: 1260, color: '#83A5FF' },
  { name: 'Travel', spent: 980, color: 'var(--negative)' },
];

const budgetProgress = [
  { name: 'Marketing', spent: 7400, limit: 10000 },
  { name: 'Engineering', spent: 15800, limit: 18000 },
  { name: 'Operations', spent: 9100, limit: 11000 },
];

const beneficiaries = [
  { name: 'Atlas Logistics', iban: 'US-2421', avatar: 'AL' },
  { name: 'Northwind Labs', iban: 'US-9942', avatar: 'NL' },
  { name: 'Elara Design', iban: 'US-1792', avatar: 'ED' },
];

const upcomingPayments = [
  { label: 'AWS invoice', due: 'Aug 10', amount: 1640 },
  { label: 'Office lease', due: 'Aug 12', amount: 3200 },
  { label: 'Contractor payroll', due: 'Aug 14', amount: 6480 },
];

const fade = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

function TinyStat({ title, value, icon: Icon, note }: { title: string; value: string; icon: typeof Wallet; note: string }) {
  return (
    <Card padding="md" hover>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-secondary)] mb-2">{title}</p>
          <p className="text-2xl font-display font-bold tabular-nums">{value}</p>
          <p className="text-xs text-[var(--text-secondary)] mt-2">{note}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] flex items-center justify-center">
          <Icon size={18} className="text-[var(--accent-primary)] dark:text-[var(--accent-secondary)]" />
        </div>
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { primaryAccount, isLoading: accountLoading } = useAccounts();
  const { transactions, isLoading: txLoading, fetchTransactions } = useTransactions();
  const [quickTransferAmount, setQuickTransferAmount] = useState('');

  useEffect(() => {
    if (primaryAccount?.accountNumber) {
      fetchTransactions(primaryAccount.accountNumber);
    }
  }, [primaryAccount?.accountNumber]); // eslint-disable-line

  const credits = useMemo(() => transactions.filter((t) => isCredit(t.transactionType)).reduce((s, t) => s + t.amount, 0), [transactions]);
  const debits = useMemo(() => transactions.filter((t) => !isCredit(t.transactionType)).reduce((s, t) => s + t.amount, 0), [transactions]);
  const recentTx = transactions.slice(0, 6);

  const displayName = user?.userProfileDto?.firstName ?? 'there';
  const currentBalance = primaryAccount?.availableBalance ?? 0;
  const savings = currentBalance * 0.34;
  const investments = currentBalance * 0.22;

  return (
    <motion.div initial="hidden" animate="show" variants={fade} transition={{ duration: 0.35 }} className="space-y-6">
      <section className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--hero-bg)] p-6 md:p-8 shadow-[var(--shadow-soft)]">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-sm text-[var(--text-secondary)]">Good {getTimeOfDay()},</p>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold mt-1">{displayName}</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-3 max-w-xl">Your command center for balances, payments, investments, and cashflow visibility.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="gold">Enterprise Plan</Badge>
            <Link to="/transfer"><Button size="sm" icon={<Send size={14} />}>Quick Transfer</Button></Link>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mt-8">
          {accountLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
              <TinyStat title="Current Balance" value={formatCurrency(currentBalance)} icon={Wallet} note={primaryAccount?.accountNumber ? maskAccountNumber(primaryAccount.accountNumber) : 'No account connected'} />
              <TinyStat title="Available Balance" value={formatCurrency(Math.max(currentBalance - 2200, 0))} icon={CreditCard} note="After pending settlements" />
              <TinyStat title="Savings" value={formatCurrency(savings)} icon={PiggyBank} note="Automated reserve" />
              <TinyStat title="Investments" value={formatCurrency(investments)} icon={Briefcase} note="Portfolio allocation" />
            </>
          )}
        </div>
      </section>

      <section className="grid lg:grid-cols-12 gap-5">
        <Card padding="md" className="lg:col-span-8">
          <CardHeader title="Monthly Spending" subtitle="Last 7 months" />
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spendingData}>
                <CartesianGrid vertical={false} stroke="var(--border-subtle)" />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(91,124,255,0.08)' }} contentStyle={{ borderRadius: 12, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }} />
                <Bar dataKey="spend" fill="var(--accent-primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card padding="md" className="lg:col-span-4">
          <CardHeader title="Top Categories" subtitle="Current month" />
          <div className="space-y-3">
            {topCategories.map((c) => (
              <div key={c.name} className="rounded-xl border border-[var(--border-subtle)] p-3 bg-[var(--bg-surface-2)]">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>{c.name}</span>
                  <span className="font-semibold tabular-nums">{formatCurrency(c.spent)}</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--bg-surface)] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.min((c.spent / 4000) * 100, 100)}%`, background: c.color }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid lg:grid-cols-12 gap-5">
        <Card padding="md" className="lg:col-span-7">
          <CardHeader title="Income vs Expense" subtitle="6-month trend" />
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={incomeExpenseData}>
                <defs>
                  <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--positive)" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="var(--positive)" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--border-subtle)" />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }} />
                <Area type="monotone" dataKey="income" stroke="var(--positive)" fill="url(#incomeFill)" strokeWidth={2} />
                <Area type="monotone" dataKey="expense" stroke="var(--accent-primary)" fill="url(#expenseFill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card padding="md" className="lg:col-span-5">
          <CardHeader title="Budget Progress" subtitle="Department limits" />
          <div className="space-y-4">
            {budgetProgress.map((b) => {
              const ratio = Math.min((b.spent / b.limit) * 100, 100);
              return (
                <div key={b.name}>
                  <div className="flex items-center justify-between mb-1.5 text-sm">
                    <span className="text-[var(--text-primary)]">{b.name}</span>
                    <span className="text-[var(--text-secondary)] tabular-nums">{formatCurrency(b.spent)} / {formatCurrency(b.limit)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--bg-surface-2)] overflow-hidden">
                    <div className="h-full rounded-full bg-[var(--accent-primary)] dark:bg-[var(--accent-secondary)]" style={{ width: `${ratio}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </section>

      <section className="grid lg:grid-cols-12 gap-5">
        <Card padding="md" className="lg:col-span-5">
          <CardHeader title="Quick Transfer" subtitle="Send to recent beneficiaries" />
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {beneficiaries.map((b) => (
                <button key={b.name} className="text-left rounded-2xl border border-[var(--border-subtle)] p-3 bg-[var(--bg-surface-2)] hover:border-[var(--border-strong)] transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[var(--accent-primary-soft)] dark:bg-[var(--accent-secondary-soft)] text-[var(--accent-primary)] dark:text-[var(--accent-secondary)] flex items-center justify-center text-xs font-semibold">{b.avatar}</div>
                    <div>
                      <p className="text-sm font-medium">{b.name}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{b.iban}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-2">
              <input
                type="number"
                placeholder="Enter amount"
                value={quickTransferAmount}
                onChange={(e) => setQuickTransferAmount(e.target.value)}
                className="flex-1 h-11 rounded-xl bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] px-4 text-sm focus:outline-none focus:border-[var(--accent-primary)]"
              />
              <Link to="/transfer"><Button icon={<ArrowLeftRight size={15} />}>Transfer</Button></Link>
            </div>
          </div>
        </Card>

        <Card padding="md" className="lg:col-span-4">
          <CardHeader title="Upcoming Payments" subtitle="Bills and commitments" />
          <div className="space-y-3">
            {upcomingPayments.map((p) => (
              <div key={p.label} className="rounded-2xl border border-[var(--border-subtle)] p-3 bg-[var(--bg-surface-2)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarClock size={15} className="text-[var(--accent-primary)] dark:text-[var(--accent-secondary)]" />
                    <span className="text-sm">{p.label}</span>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">{formatCurrency(p.amount)}</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Due {p.due}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card padding="md" className="lg:col-span-3">
          <CardHeader title="Loans & Investments" subtitle="Snapshot" />
          <div className="space-y-3">
            <div className="rounded-xl border border-[var(--border-subtle)] p-3 bg-[var(--bg-surface-2)]">
              <p className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">Loan outstanding</p>
              <p className="text-lg font-bold tabular-nums mt-1">{formatCurrency(18240)}</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Next EMI in 6 days</p>
            </div>
            <div className="rounded-xl border border-[var(--border-subtle)] p-3 bg-[var(--bg-surface-2)]">
              <p className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">Investment return</p>
              <p className="text-lg font-bold text-[var(--positive)] tabular-nums mt-1">+9.2%</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">YTD performance</p>
            </div>
          </div>
        </Card>
      </section>

      <section className="grid lg:grid-cols-12 gap-5">
        <Card padding="md" className="lg:col-span-8">
          <CardHeader title="Recent Transactions" subtitle="Live account activity" action={<Link to="/transactions"><Button variant="ghost" size="sm" iconRight={<ArrowUpRight size={14} />}>View all</Button></Link>} />
          {txLoading ? (
            <SkeletonTable rows={6} />
          ) : recentTx.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)] py-8 text-center">No transactions yet.</p>
          ) : (
            <div className="space-y-2">
              {recentTx.map((tx) => (
                <div key={tx.referenceId} className="flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] px-3 py-2.5 bg-[var(--bg-surface-2)]">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isCredit(tx.transactionType) ? 'bg-[var(--positive)]/15' : 'bg-[var(--negative)]/15'}`}>
                    {isCredit(tx.transactionType) ? <ArrowDownLeft size={15} className="text-[var(--positive)]" /> : <ArrowUpRight size={15} className="text-[var(--negative)]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{tx.comments ?? tx.transactionType}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{formatTimeAgo(tx.localDateTime)}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold tabular-nums ${isCredit(tx.transactionType) ? 'text-[var(--positive)]' : 'text-[var(--negative)]'}`}>
                      {isCredit(tx.transactionType) ? '+' : '-'}{formatCurrency(tx.amount)}
                    </p>
                    <TxTypeBadge type={tx.transactionType} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card padding="md" className="lg:col-span-4">
          <CardHeader title="Activity Feed" subtitle="System and team events" />
          <div className="space-y-3">
            {[
              { icon: Bell, text: 'Security policy updated', time: '5m ago' },
              { icon: Building2, text: 'Beneficiary Atlas Logistics verified', time: '1h ago' },
              { icon: Plus, text: 'New budget created for Marketing', time: '3h ago' },
              { icon: CreditCard, text: 'Virtual card transaction settled', time: '6h ago' },
            ].map((a) => (
              <div key={a.text} className="flex gap-3 rounded-xl border border-[var(--border-subtle)] p-3 bg-[var(--bg-surface-2)]">
                <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center">
                  <a.icon size={14} className="text-[var(--accent-primary)] dark:text-[var(--accent-secondary)]" />
                </div>
                <div>
                  <p className="text-sm">{a.text}</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <div className="fixed right-5 bottom-5 z-20">
        <Link to="/transfer">
          <button aria-label="Quick transfer" className="w-12 h-12 rounded-2xl bg-[var(--accent-primary)] text-white dark:bg-[var(--accent-secondary)] dark:text-[#0B0F14] shadow-[var(--shadow-card)] hover:scale-105 transition-transform">
            <Send size={18} className="mx-auto" />
          </button>
        </Link>
      </div>
    </motion.div>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}