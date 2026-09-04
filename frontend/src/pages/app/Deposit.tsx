import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  CheckCircle,
  Clock3,
  IndianRupee,
  Wallet,
} from 'lucide-react';
import { useAccounts } from '@/hooks/useAccounts';
import { useTransactions } from '@/hooks/useTransactions';
import { useUIStore } from '@/store/useUIStore';
import { transactionService } from '@/services/transactionService';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { formatCurrency, maskAccountNumber, isCredit } from '@/utils';

type Mode = 'deposit' | 'withdraw';
const QUICK_AMOUNTS = [500, 1000, 2500, 5000, 10000, 25000];

export default function DepositPage() {
  const toast = useUIStore((s) => s.toast);
  const { primaryAccount, isLoading: accountLoading, fetchAccounts } = useAccounts();
  const { transactions, fetchTransactions } = useTransactions();

  const [mode, setMode] = useState<Mode>('deposit');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ amount: number; mode: Mode } | null>(null);

  const parsedAmount = parseFloat(amount);
  const isAmountValid = !isNaN(parsedAmount) && parsedAmount > 0;
  const hasSufficientFunds = mode === 'deposit' || !primaryAccount || parsedAmount <= primaryAccount.availableBalance;

  const handleSubmit = async () => {
    if (!primaryAccount?.accountNumber || !isAmountValid) return;
    if (!hasSufficientFunds) {
      toast('error', 'Insufficient funds', 'Amount exceeds available balance.');
      return;
    }

    setIsSubmitting(true);
    try {
      await transactionService.addTransaction({
        accountId: primaryAccount.accountNumber,
        transactionType: mode === 'deposit' ? 'DEPOSIT' : 'WITHDRAWAL',
        amount: parsedAmount,
        description: description || (mode === 'deposit' ? 'Deposit' : 'Withdrawal'),
      });
      setSuccess({ amount: parsedAmount, mode });
      await fetchAccounts();
      await fetchTransactions(primaryAccount.accountNumber);
    } catch {
      toast('error', 'Transaction failed', 'Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const recent = transactions.slice(0, 5);
  const totalCredits = transactions.filter((t) => isCredit(t.transactionType)).reduce((s, t) => s + t.amount, 0);
  const totalDebits = transactions.filter((t) => !isCredit(t.transactionType)).reduce((s, t) => s + t.amount, 0);

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto">
        <Card padding="lg">
          <div className="text-center py-6">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 ${success.mode === 'deposit' ? 'bg-[var(--positive)]/15 border border-[var(--positive)]/20' : 'bg-[var(--accent-primary-soft)] dark:bg-[var(--accent-secondary-soft)] border border-[var(--border-subtle)]'}`}>
              <CheckCircle size={34} className={success.mode === 'deposit' ? 'text-[var(--positive)]' : 'text-[var(--accent-primary)] dark:text-[var(--accent-secondary)]'} />
            </div>
            <h2 className="font-display text-3xl font-bold mb-2">{success.mode === 'deposit' ? 'Deposit successful' : 'Withdrawal successful'}</h2>
            <p className="text-sm text-[var(--text-secondary)]">Your account has been updated.</p>

            <div className="mt-6 text-left rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-2)] p-4 space-y-3">
              <Row label="Type" value={success.mode} />
              <Row label="Amount" value={`${success.mode === 'deposit' ? '+' : '-'}${formatCurrency(success.amount)}`} strong />
              {primaryAccount && <Row label="New Balance" value={formatCurrency(primaryAccount.availableBalance)} />}
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <Button variant="secondary" onClick={() => { setSuccess(null); setAmount(''); setDescription(''); }}>
                Another
              </Button>
              <Button onClick={() => { setMode(success.mode === 'deposit' ? 'withdraw' : 'deposit'); setSuccess(null); setAmount(''); setDescription(''); }}>
                Switch Mode
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h2 className="font-display text-3xl font-bold">Deposit & Withdraw</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Move funds instantly with clear balance visibility.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 space-y-4">
          {accountLoading ? (
            <SkeletonCard />
          ) : primaryAccount ? (
            <Card padding="lg" className="bg-[var(--hero-bg)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">Account • {maskAccountNumber(primaryAccount.accountNumber)}</p>
                  <p className="mt-2 text-3xl font-display font-bold tabular-nums">{formatCurrency(primaryAccount.availableBalance)}</p>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">Available balance</p>
                </div>
                <div className="w-14 h-14 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center justify-center">
                  <Wallet size={22} className="text-[var(--accent-primary)] dark:text-[var(--accent-secondary)]" />
                </div>
              </div>
            </Card>
          ) : (
            <Card padding="lg"><p className="text-sm text-[var(--text-secondary)]">No account found.</p></Card>
          )}

          <Card padding="sm">
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setMode('deposit')} className={`h-11 rounded-xl text-sm font-semibold transition-colors ${mode === 'deposit' ? 'bg-[var(--accent-primary)] text-white dark:bg-[var(--accent-secondary)] dark:text-[#0B0F14]' : 'bg-[var(--bg-surface-2)] text-[var(--text-secondary)] border border-[var(--border-subtle)]'}`}>
                <span className="inline-flex items-center gap-2"><ArrowDownToLine size={14} /> Deposit</span>
              </button>
              <button onClick={() => setMode('withdraw')} className={`h-11 rounded-xl text-sm font-semibold transition-colors ${mode === 'withdraw' ? 'bg-[var(--negative)] text-white' : 'bg-[var(--bg-surface-2)] text-[var(--text-secondary)] border border-[var(--border-subtle)]'}`}>
                <span className="inline-flex items-center gap-2"><ArrowUpFromLine size={14} /> Withdraw</span>
              </button>
            </div>
          </Card>

          <Card padding="lg">
            <CardHeader title={mode === 'deposit' ? 'Add funds' : 'Withdraw funds'} subtitle="Use presets or enter a custom amount" />
            <div className="space-y-5">
              <div className="grid grid-cols-3 gap-2">
                {QUICK_AMOUNTS.map((val) => (
                  <button
                    key={val}
                    onClick={() => setAmount(String(val))}
                    className={`h-10 rounded-xl border text-sm transition-colors ${parsedAmount === val ? 'border-[var(--accent-primary)] bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] dark:border-[var(--accent-secondary)] dark:bg-[var(--accent-secondary-soft)] dark:text-[var(--accent-secondary)]' : 'border-[var(--border-subtle)] bg-[var(--bg-surface-2)] text-[var(--text-secondary)]'}`}
                  >
                    {formatCurrency(val)}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)] mb-1.5">Amount</label>
                <div className="relative">
                  <IndianRupee size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input
                    id="deposit-amount-input"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    className="h-12 w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-2)] pl-9 pr-4 text-lg font-semibold tabular-nums focus:outline-none focus:border-[var(--accent-primary)]"
                  />
                </div>
                {mode === 'withdraw' && primaryAccount && parsedAmount > primaryAccount.availableBalance && parsedAmount > 0 && (
                  <p className="text-xs text-[var(--negative)] mt-1.5">Amount exceeds available balance.</p>
                )}
              </div>

              <Input
                label="Description"
                id="deposit-description-input"
                placeholder={mode === 'deposit' ? 'Salary top-up' : 'Cash withdrawal'}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <Button
                id="deposit-submit-btn"
                fullWidth
                loading={isSubmitting}
                disabled={!isAmountValid || !hasSufficientFunds || !primaryAccount}
                onClick={handleSubmit}
                icon={mode === 'deposit' ? <ArrowDownToLine size={16} /> : <ArrowUpFromLine size={16} />}
                variant={mode === 'withdraw' ? 'danger' : 'primary'}
              >
                {mode === 'deposit' ? 'Confirm Deposit' : 'Confirm Withdrawal'}
              </Button>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <Card padding="md">
            <CardHeader title="Account Snapshot" />
            <div className="space-y-2">
              <Row label="Total credited" value={formatCurrency(totalCredits)} valueClass="text-[var(--positive)]" />
              <Row label="Total debited" value={formatCurrency(totalDebits)} valueClass="text-[var(--negative)]" />
              <Row label="Net flow" value={formatCurrency(totalCredits - totalDebits)} />
            </div>
          </Card>

          <Card padding="md">
            <CardHeader title="Recent Activity" subtitle="Latest 5 transactions" />
            {recent.length === 0 ? (
              <p className="text-sm text-[var(--text-secondary)] py-6 text-center">No transactions yet.</p>
            ) : (
              <div className="space-y-2">
                {recent.map((tx) => (
                  <div key={tx.referenceId} className="flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] p-2.5 bg-[var(--bg-surface-2)]">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isCredit(tx.transactionType) ? 'bg-[var(--positive)]/15' : 'bg-[var(--negative)]/15'}`}>
                      {isCredit(tx.transactionType) ? <ArrowDownToLine size={12} className="text-[var(--positive)]" /> : <ArrowUpFromLine size={12} className="text-[var(--negative)]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{tx.comments ?? tx.transactionType}</p>
                    </div>
                    <p className={`text-xs font-semibold tabular-nums ${isCredit(tx.transactionType) ? 'text-[var(--positive)]' : 'text-[var(--negative)]'}`}>
                      {isCredit(tx.transactionType) ? '+' : '-'}{formatCurrency(tx.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-2)] p-3 flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <Clock3 size={13} /> Settlements post in real time.
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}

function Row({ label, value, strong, valueClass }: { label: string; value: string; strong?: boolean; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[var(--text-secondary)]">{label}</span>
      <span className={`${strong ? 'font-bold' : 'font-medium'} tabular-nums ${valueClass ?? 'text-[var(--text-primary)]'}`}>{value}</span>
    </div>
  );
}