import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Landmark,
  Plus,
  Send,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useAccounts } from '@/hooks/useAccounts';
import { useTransactions } from '@/hooks/useTransactions';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button, ButtonLink } from '@/components/ui/Button';
import { StatusBadge, TxTypeBadge } from '@/components/ui/Badge';
import { ConfirmModal } from '@/components/ui/Modal';
import { AccountSwitcher } from '@/components/ui/AccountSwitcher';
import { SkeletonCard, SkeletonTable } from '@/components/ui/Skeleton';
import {
  absAmount,
  capitalize,
  formatCurrency,
  formatTimeAgo,
  isCredit,
  maskAccountNumber,
  monthTotals,
  transactionLabel,
} from '@/utils';

const fade = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const OPENABLE_TYPES = ['SAVINGS', 'CURRENT'];

function TinyStat({ title, value, icon: Icon, note }: { title: string; value: string; icon: typeof Wallet; note: string }) {
  return (
    <Card padding="none" className="p-4 sm:p-5 min-w-0">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--text-secondary)] mb-2 truncate">{title}</p>
          {/* Sized to fit two cards per row on phones/tablets and four on wide screens */}
          <p className="text-lg sm:text-xl 2xl:text-2xl font-display font-bold tabular-nums break-words leading-tight">{value}</p>
          <p className="text-xs text-[var(--text-secondary)] mt-2 line-clamp-2">{note}</p>
        </div>
        <div className="hidden sm:flex shrink-0 w-10 h-10 rounded-xl bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] items-center justify-center">
          <Icon size={18} className="text-[var(--accent-primary)] dark:text-[var(--accent-secondary)]" />
        </div>
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const {
    accounts,
    primaryAccount,
    isLoading: accountLoading,
    loaded,
    refreshAccounts,
    selectAccount,
    openAccount,
    closeAccount,
  } = useAccounts();
  const { transactions, isLoading: txLoading, fetchTransactions } = useTransactions();

  const [newType, setNewType] = useState('');
  const [opening, setOpening] = useState(false);
  const [closing, setClosing] = useState<string | null>(null);
  const [closeBusy, setCloseBusy] = useState(false);

  // Refresh balances on every visit so changes made elsewhere (e.g. an incoming transfer) show up.
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
  const activeAccounts = accounts.filter((a) => a.accountStatus === 'ACTIVE');
  const totalBalance = activeAccounts.reduce((sum, a) => sum + (a.availableBalance ?? 0), 0);
  const month = useMemo(() => monthTotals(transactions), [transactions]);
  const monthName = new Date().toLocaleString('en-IN', { month: 'short' });
  const typesAvailable = OPENABLE_TYPES.filter((t) => !accounts.some((a) => a.accountType === t));
  const closingAccount = accounts.find((a) => a.accountNumber === closing);

  const handleOpen = async () => {
    const type = newType || typesAvailable[0];
    if (!type) return;
    setOpening(true);
    await openAccount(type);
    setOpening(false);
    setNewType('');
  };

  const handleClose = async () => {
    if (!closing) return;
    setCloseBusy(true);
    const ok = await closeAccount(closing);
    setCloseBusy(false);
    if (ok) setClosing(null);
  };

  return (
    <motion.div initial="hidden" animate="show" variants={fade} transition={{ duration: 0.35 }} className="space-y-6">
      <section className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--hero-bg)] p-4 sm:p-6 md:p-8 shadow-[var(--shadow-soft)]">
        <div className="flex flex-wrap items-start justify-between gap-4 sm:gap-6">
          <div>
            <p className="text-sm text-[var(--text-secondary)]">Good {getTimeOfDay()},</p>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold mt-1">{displayName}</h2>
            <p className="hidden sm:block text-sm text-[var(--text-secondary)] mt-3 max-w-xl">Your balances, payments and recent activity in one place.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <AccountSwitcher />
            <ButtonLink to="/transfer" size="sm" icon={<Send size={14} />}>Quick Transfer</ButtonLink>
          </div>
        </div>

        {/* 2 columns on phones and tablets (the sidebar takes width at md), 4 on wide screens */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mt-5 sm:mt-8">
          {accountLoading && !loaded ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
              <TinyStat
                title="Balance"
                value={formatCurrency(currentBalance)}
                icon={Wallet}
                note={primaryAccount ? `${capitalize(primaryAccount.accountType)} ${maskAccountNumber(primaryAccount.accountNumber)}` : 'No account yet'}
              />
              <TinyStat
                title="All accounts"
                value={formatCurrency(totalBalance)}
                icon={Landmark}
                note={`${activeAccounts.length} active account${activeAccounts.length === 1 ? '' : 's'}`}
              />
              <TinyStat
                title={`In · ${monthName}`}
                value={formatCurrency(month.moneyIn)}
                icon={TrendingUp}
                note="Deposits and transfers received"
              />
              <TinyStat
                title={`Out · ${monthName}`}
                value={formatCurrency(month.moneyOut)}
                icon={TrendingDown}
                note="Withdrawals and transfers sent"
              />
            </>
          )}
        </div>
      </section>

      <section className="grid lg:grid-cols-3 gap-5 min-w-0">
        <Card padding="md" className="lg:col-span-2 min-w-0">
          <CardHeader
            title="Recent Transactions"
            subtitle={primaryAccount ? `Account ${maskAccountNumber(primaryAccount.accountNumber)}` : undefined}
            action={
              <Link
                to="/transactions"
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)]"
              >
                View all <ArrowUpRight size={14} />
              </Link>
            }
          />
          {txLoading ? (
            <SkeletonTable rows={6} />
          ) : recentTx.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)] py-8 text-center">No transactions yet.</p>
          ) : (
            <div className="space-y-2">
              {recentTx.map((tx, i) => {
                const credit = isCredit(tx.transactionType, tx.amount);
                return (
                  <div key={`${tx.referenceId}-${i}`} className="flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] px-3 py-2.5 bg-[var(--bg-surface-2)]">
                    <div className={`w-8 h-8 shrink-0 rounded-xl flex items-center justify-center ${credit ? 'bg-[var(--positive)]/15' : 'bg-[var(--negative)]/15'}`}>
                      {credit ? <ArrowDownLeft size={15} className="text-[var(--positive)]" /> : <ArrowUpRight size={15} className="text-[var(--negative)]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{tx.comments || transactionLabel(tx.transactionType, tx.amount)}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{formatTimeAgo(tx.localDateTime)}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-sm font-semibold tabular-nums ${credit ? 'text-[var(--positive)]' : 'text-[var(--negative)]'}`}>
                        {credit ? '+' : '-'}{formatCurrency(absAmount(tx.amount))}
                      </p>
                      <TxTypeBadge type={tx.transactionType} amount={tx.amount} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card padding="md">
          <CardHeader title="Your accounts" subtitle="Choose one to work with, open or close accounts" />
          {loaded && accounts.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)] mb-4">You don't have an account yet. Open one to start.</p>
          ) : (
            <ul className="space-y-2 mb-4">
              {accounts.map((a) => {
                const selected = a.accountNumber === primaryAccount?.accountNumber;
                return (
                  <li
                    key={a.accountNumber}
                    className={`rounded-xl border px-3 py-2.5 ${selected ? 'border-[var(--accent-primary)] dark:border-[var(--accent-secondary)] bg-[var(--accent-primary-soft)] dark:bg-[var(--accent-secondary-soft)]' : 'border-[var(--border-subtle)] bg-[var(--bg-surface-2)]'}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{capitalize(a.accountType)} <span className="font-mono text-xs text-[var(--text-secondary)]">{a.accountNumber}</span></p>
                        <p className="text-sm tabular-nums mt-0.5">{formatCurrency(a.availableBalance)}</p>
                      </div>
                      <StatusBadge status={a.accountStatus ?? ''} />
                    </div>
                    <div className="flex gap-2 mt-2">
                      {!selected && (
                        <Button variant="secondary" size="sm" onClick={() => a.accountNumber && selectAccount(a.accountNumber)}>Use this account</Button>
                      )}
                      {a.accountStatus === 'ACTIVE' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setClosing(a.accountNumber ?? null)}
                          title={a.availableBalance !== 0 ? 'Balance must be zero to close' : undefined}
                        >
                          Close
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {typesAvailable.length > 0 ? (
            <div className="flex gap-2">
              <select
                aria-label="Account type to open"
                value={newType || typesAvailable[0]}
                onChange={(e) => setNewType(e.target.value)}
                className="h-9 flex-1 min-w-0 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-2)] px-2 text-sm focus:outline-none focus:border-[var(--accent-primary)]"
              >
                {typesAvailable.map((t) => <option key={t} value={t}>{capitalize(t)}</option>)}
              </select>
              <Button size="sm" icon={<Plus size={14} />} loading={opening} onClick={handleOpen}>Open account</Button>
            </div>
          ) : (
            <p className="text-xs text-[var(--text-secondary)]">You already hold every account type we offer.</p>
          )}
        </Card>
      </section>

      <ConfirmModal
        isOpen={!!closing}
        onClose={() => setClosing(null)}
        onConfirm={handleClose}
        loading={closeBusy}
        danger
        title="Close account?"
        confirmLabel="Close account"
        message={
          closingAccount && closingAccount.availableBalance !== 0 ? (
            <>This account still holds <strong>{formatCurrency(closingAccount.availableBalance)}</strong>. Move or withdraw the money first; only empty accounts can be closed.</>
          ) : (
            <>Account <span className="font-mono">{closing}</span> will be closed permanently. You won't be able to deposit into or transfer from it.</>
          )
        }
      />

    </motion.div>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
