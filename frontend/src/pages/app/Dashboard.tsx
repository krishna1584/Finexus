import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Briefcase,
  CreditCard,
  PiggyBank,
  Send,
  Wallet,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useAccounts } from '@/hooks/useAccounts';
import { useTransactions } from '@/hooks/useTransactions';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, TxTypeBadge } from '@/components/ui/Badge';
import { SkeletonCard, SkeletonTable } from '@/components/ui/Skeleton';
import { formatCurrency, formatTimeAgo, isCredit, maskAccountNumber } from '@/utils';

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
  const { primaryAccount, isLoading: accountLoading, refreshAccounts } = useAccounts();
  const { transactions, isLoading: txLoading, fetchTransactions } = useTransactions();

  // Always refresh balance & transactions on every Dashboard mount so that
  // after a transfer the receiver (or sender) immediately sees the updated state.
  useEffect(() => {
    refreshAccounts();
  }, []); // eslint-disable-line

  useEffect(() => {
    if (primaryAccount?.accountNumber) {
      fetchTransactions(primaryAccount.accountNumber);
    }
  }, [primaryAccount?.accountNumber]); // eslint-disable-line

  const recentTx = transactions.slice(0, 10);

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

      <section className="grid lg:grid-cols-1 gap-5">
        <Card padding="md" className="lg:col-span-1">
          <CardHeader title="Recent Transactions" subtitle="Live account activity" action={<Link to="/transactions"><Button variant="ghost" size="sm" iconRight={<ArrowUpRight size={14} />}>View all</Button></Link>} />
          {txLoading ? (
            <SkeletonTable rows={6} />
          ) : recentTx.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)] py-8 text-center">No transactions yet.</p>
          ) : (
            <div className="space-y-2">
              {recentTx.map((tx) => {
                const credit = isCredit(tx.transactionType, tx.amount);
                // Always display a positive absolute amount with a +/- prefix
                const displayAmount = Math.abs(typeof tx.amount === 'string' ? parseFloat(tx.amount) : (tx.amount ?? 0));
                return (
                  <div key={tx.referenceId} className="flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] px-3 py-2.5 bg-[var(--bg-surface-2)]">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${credit ? 'bg-[var(--positive)]/15' : 'bg-[var(--negative)]/15'}`}>
                      {credit ? <ArrowDownLeft size={15} className="text-[var(--positive)]" /> : <ArrowUpRight size={15} className="text-[var(--negative)]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{tx.comments ?? tx.transactionType}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{formatTimeAgo(tx.localDateTime)}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold tabular-nums ${credit ? 'text-[var(--positive)]' : 'text-[var(--negative)]'}`}>
                        {credit ? '+' : '-'}{formatCurrency(displayAmount)}
                      </p>
                      <TxTypeBadge type={tx.transactionType} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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