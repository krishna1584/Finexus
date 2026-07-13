import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Copy,
  CheckCheck,
  Plus,
  Minus,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useAccounts } from '@/hooks/useAccounts';
import { useTransactions } from '@/hooks/useTransactions';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge, TxTypeBadge } from '@/components/ui/Badge';
import { SkeletonCard, SkeletonTable, Skeleton } from '@/components/ui/Skeleton';
import { CashflowChart } from '@/components/charts/CashflowChart';
import { DistributionPieChart } from '@/components/charts/DistributionPieChart';
import { formatCurrency, formatTimeAgo, isCredit, maskAccountNumber, copyToClipboard } from '@/utils';
import { MOCK_CASHFLOW, MOCK_DISTRIBUTION } from '@/services/mock/mockData';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { primaryAccount, isLoading: accountLoading } = useAccounts();
  const { transactions, isLoading: txLoading, fetchTransactions } = useTransactions();

  const [copied, setCopied] = useState(false);

  const displayName = user?.userProfileDto?.firstName ?? 'there';

  // Fetch transactions when we have an account
  useEffect(() => {
    if (primaryAccount?.accountNumber) {
      fetchTransactions(primaryAccount.accountNumber);
    }
  }, [primaryAccount?.accountNumber]); // eslint-disable-line

  const handleCopyAccount = async () => {
    if (!primaryAccount?.accountNumber) return;
    const ok = await copyToClipboard(primaryAccount.accountNumber);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Compute summary stats
  const credits = transactions.filter((t) => isCredit(t.transactionType)).reduce((s, t) => s + t.amount, 0);
  const debits = transactions.filter((t) => !isCredit(t.transactionType)).reduce((s, t) => s + t.amount, 0);
  const recentTx = transactions.slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">
          Good {getTimeOfDay()}, {displayName}!
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">
          Here's your financial overview for today.
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Balance card */}
        {accountLoading ? (
          <SkeletonCard />
        ) : primaryAccount ? (
          <Card className="lg:col-span-1 relative overflow-hidden" padding="lg">
            {/* Gold glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-gold)]/5 to-transparent pointer-events-none" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide mb-1">Available Balance</p>
                  <StatusBadge status={primaryAccount.accountStatus ?? 'ACTIVE'} />
                </div>
                <Badge variant="gold">{primaryAccount.accountType}</Badge>
              </div>

              <p className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] tabular-nums mb-1"
                 style={{ textShadow: '0 0 20px rgba(240,185,11,0.15)' }}>
                {formatCurrency(primaryAccount.availableBalance)}
              </p>

              <button
                onClick={handleCopyAccount}
                className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mt-2 group"
              >
                <span className="font-mono">{maskAccountNumber(primaryAccount.accountNumber)}</span>
                {copied ? (
                  <CheckCheck size={12} className="text-[var(--positive)]" />
                ) : (
                  <Copy size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
            </div>
          </Card>
        ) : (
          <Card padding="lg">
            <p className="text-sm text-[var(--text-secondary)]">No account found. Please contact support.</p>
          </Card>
        )}

        {/* Credits */}
        <Card padding="lg">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide mb-1">Total Credits</p>
              <p className="text-2xl font-bold text-[var(--positive)] tabular-nums">
                {txLoading ? <Skeleton height="h-7" width="w-28" /> : formatCurrency(credits)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[var(--positive)]/15 flex items-center justify-center">
              <TrendingUp size={18} className="text-[var(--positive)]" />
            </div>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">{transactions.filter((t) => isCredit(t.transactionType)).length} incoming transactions</p>
        </Card>

        {/* Debits */}
        <Card padding="lg">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide mb-1">Total Debits</p>
              <p className="text-2xl font-bold text-[var(--negative)] tabular-nums">
                {txLoading ? <Skeleton height="h-7" width="w-28" /> : formatCurrency(debits)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[var(--negative)]/15 flex items-center justify-center">
              <TrendingDown size={18} className="text-[var(--negative)]" />
            </div>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">{transactions.filter((t) => !isCredit(t.transactionType)).length} outgoing transactions</p>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card padding="md">
        <CardHeader title="Quick Actions" />
        <div className="flex flex-wrap gap-2">
          <Link to="/deposit">
            <Button
              variant="secondary"
              size="sm"
              icon={<Plus size={14} />}
              id="quick-deposit-btn"
            >
              Deposit
            </Button>
          </Link>
          <Link to="/deposit">
            <Button
              variant="secondary"
              size="sm"
              icon={<Minus size={14} />}
              id="quick-withdraw-btn"
            >
              Withdraw
            </Button>
          </Link>
          <Link to="/transfer">
            <Button variant="secondary" size="sm" icon={<ArrowLeftRight size={14} />} id="quick-transfer-btn">
              Transfer
            </Button>
          </Link>
        </div>
      </Card>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card padding="md">
          <CardHeader title="Monthly Cashflow" subtitle="Income vs expenses (last 6 months)" />
          <CashflowChart data={MOCK_CASHFLOW} />
        </Card>
        <Card padding="md">
          <CardHeader title="Transaction Mix" subtitle="By type" />
          <DistributionPieChart data={MOCK_DISTRIBUTION} />
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card padding="md">
        <CardHeader
          title="Recent Transactions"
          subtitle="Latest activity on your account"
          action={
            <Link to="/transactions">
              <Button variant="ghost" size="sm" iconRight={<ArrowUpRight size={14} />}>View all</Button>
            </Link>
          }
        />
        {txLoading ? (
          <SkeletonTable rows={5} />
        ) : recentTx.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-[var(--text-secondary)]">No transactions yet.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {recentTx.map((tx) => (
              <div
                key={tx.referenceId}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-surface-2)] transition-colors"
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isCredit(tx.transactionType)
                    ? 'bg-[var(--positive)]/15'
                    : 'bg-[var(--negative)]/15'
                }`}>
                  {isCredit(tx.transactionType)
                    ? <ArrowDownLeft size={16} className="text-[var(--positive)]" />
                    : <ArrowUpRight size={16} className="text-[var(--negative)]" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                    {tx.comments ?? tx.transactionType}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">{formatTimeAgo(tx.localDateTime)}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold tabular-nums ${
                    isCredit(tx.transactionType) ? 'text-[var(--positive)]' : 'text-[var(--negative)]'
                  }`}>
                    {isCredit(tx.transactionType) ? '+' : '-'}{formatCurrency(tx.amount)}
                  </p>
                  <TxTypeBadge type={tx.transactionType} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

    </div>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
