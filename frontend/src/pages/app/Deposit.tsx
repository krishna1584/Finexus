import { useState } from 'react';
import {
  PiggyBank,
  ArrowDownToLine,
  ArrowUpFromLine,
  CheckCircle,
  IndianRupee,
  Wallet,
  Clock,
  TrendingUp,
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

const QUICK_AMOUNTS = [500, 1000, 5000, 10000, 25000, 50000];

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
  const hasSufficientFunds =
    mode === 'deposit' || !primaryAccount || parsedAmount <= primaryAccount.availableBalance;

  const handleQuickAmount = (val: number) => {
    setAmount(String(val));
  };

  const handleSubmit = async () => {
    if (!primaryAccount?.accountNumber || !isAmountValid) return;
    if (!hasSufficientFunds) {
      toast('error', 'Insufficient funds', 'Amount exceeds your available balance.');
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
      if (primaryAccount.accountNumber) fetchTransactions(primaryAccount.accountNumber);
    } catch {
      toast('error', 'Transaction failed', 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSuccess(null);
    setAmount('');
    setDescription('');
  };

  // Recent transactions for the mini-history panel
  const recent = transactions.slice(0, 5);
  const totalCredits = transactions.filter((t) => isCredit(t.transactionType)).reduce((s, t) => s + t.amount, 0);
  const totalDebits = transactions.filter((t) => !isCredit(t.transactionType)).reduce((s, t) => s + t.amount, 0);

  if (success) {
    return (
      <div className="max-w-lg mx-auto animate-slide-in-up">
        <Card padding="lg">
          <div className="text-center py-6">
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 ${
                success.mode === 'deposit'
                  ? 'bg-[var(--positive)]/15 border-2 border-[var(--positive)]/30'
                  : 'bg-[var(--accent-gold)]/15 border-2 border-[var(--accent-gold)]/30'
              }`}
            >
              <CheckCircle
                size={38}
                className={success.mode === 'deposit' ? 'text-[var(--positive)]' : 'text-[var(--accent-gold)]'}
              />
            </div>

            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-1">
              {success.mode === 'deposit' ? 'Deposit Successful!' : 'Withdrawal Successful!'}
            </h2>
            <p className="text-[var(--text-secondary)] text-sm mb-6">
              Your account has been updated.
            </p>

            <div className="p-4 rounded-2xl bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] mb-6 text-left space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Type</span>
                <span className="font-semibold text-[var(--text-primary)] capitalize">{success.mode}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Amount</span>
                <span className={`font-bold tabular-nums text-base ${success.mode === 'deposit' ? 'text-[var(--positive)]' : 'text-[var(--negative)]'}`}>
                  {success.mode === 'deposit' ? '+' : '-'}{formatCurrency(success.amount)}
                </span>
              </div>
              {primaryAccount && (
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">New Balance</span>
                  <span className="font-bold text-[var(--text-primary)] tabular-nums">
                    {formatCurrency(primaryAccount.availableBalance)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={handleReset} fullWidth id="deposit-another-btn">
                {success.mode === 'deposit' ? 'Deposit Again' : 'Withdraw Again'}
              </Button>
              <Button variant="primary" onClick={() => { setMode(success.mode === 'deposit' ? 'withdraw' : 'deposit'); handleReset(); }} fullWidth>
                {success.mode === 'deposit' ? 'Withdraw Instead' : 'Deposit Instead'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Deposit & Withdraw</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">
          Add or withdraw funds from your account instantly.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: Form */}
        <div className="lg:col-span-3 space-y-4">
          {/* Account Info */}
          {accountLoading ? (
            <SkeletonCard />
          ) : primaryAccount ? (
            <Card padding="lg" className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-gold)]/5 to-transparent pointer-events-none" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide mb-1">
                    Your Account · {maskAccountNumber(primaryAccount.accountNumber)}
                  </p>
                  <p className="text-3xl font-bold text-[var(--text-primary)] tabular-nums">
                    {formatCurrency(primaryAccount.availableBalance)}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">Available Balance</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-[var(--accent-gold)]/15 flex items-center justify-center flex-shrink-0">
                  <Wallet size={24} className="text-[var(--accent-gold)]" />
                </div>
              </div>
            </Card>
          ) : (
            <Card padding="lg">
              <p className="text-[var(--text-secondary)] text-sm">No account found. Please contact support.</p>
            </Card>
          )}

          {/* Mode Toggle */}
          <Card padding="sm">
            <div className="flex gap-1 p-1 bg-[var(--bg-surface-2)] rounded-xl">
              <button
                id="mode-deposit-btn"
                onClick={() => setMode('deposit')}
                className={[
                  'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200',
                  mode === 'deposit'
                    ? 'bg-[var(--positive)] text-white shadow-lg shadow-[var(--positive)]/20'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                ].join(' ')}
              >
                <ArrowDownToLine size={15} />
                Deposit
              </button>
              <button
                id="mode-withdraw-btn"
                onClick={() => setMode('withdraw')}
                className={[
                  'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200',
                  mode === 'withdraw'
                    ? 'bg-[var(--negative)] text-white shadow-lg shadow-[var(--negative)]/20'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                ].join(' ')}
              >
                <ArrowUpFromLine size={15} />
                Withdraw
              </button>
            </div>
          </Card>

          {/* Form */}
          <Card padding="lg">
            <CardHeader
              title={mode === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds'}
              subtitle={mode === 'deposit' ? 'Add money to your account' : 'Take money out of your account'}
            />

            <div className="space-y-5">
              {/* Quick amounts */}
              <div>
                <p className="text-xs text-[var(--text-secondary)] mb-2 uppercase tracking-wide">Quick Select</p>
                <div className="grid grid-cols-3 gap-2">
                  {QUICK_AMOUNTS.map((val) => (
                    <button
                      key={val}
                      id={`quick-amount-${val}`}
                      onClick={() => handleQuickAmount(val)}
                      className={[
                        'py-2 px-3 rounded-xl text-sm font-medium transition-all border',
                        parsedAmount === val
                          ? 'border-[var(--accent-gold)] bg-[var(--accent-gold-soft)] text-[var(--accent-gold)]'
                          : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--accent-gold)]/50 hover:text-[var(--text-primary)] bg-[var(--bg-surface-2)]',
                      ].join(' ')}
                    >
                      ₹{val.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                  Amount (INR)
                </label>
                <div className="relative">
                  <IndianRupee
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
                  />
                  <input
                    id="deposit-amount-input"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0.01"
                    step="0.01"
                    className="w-full bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-xl pl-9 pr-4 py-3 text-lg font-bold text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:border-[var(--accent-gold)] transition-colors tabular-nums"
                  />
                </div>
                {mode === 'withdraw' && primaryAccount && parsedAmount > primaryAccount.availableBalance && parsedAmount > 0 && (
                  <p className="mt-1.5 text-xs text-[var(--negative)]">
                    ⚠ Exceeds available balance of {formatCurrency(primaryAccount.availableBalance)}
                  </p>
                )}
              </div>

              {/* Description */}
              <Input
                label="Description (optional)"
                id="deposit-description-input"
                placeholder={mode === 'deposit' ? 'e.g. Salary, savings top-up…' : 'e.g. ATM withdrawal…'}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              {/* Submit */}
              <Button
                id="deposit-submit-btn"
                variant="primary"
                fullWidth
                loading={isSubmitting}
                disabled={!isAmountValid || !hasSufficientFunds || accountLoading || !primaryAccount}
                onClick={handleSubmit}
                icon={mode === 'deposit' ? <ArrowDownToLine size={16} /> : <ArrowUpFromLine size={16} />}
                className={
                  mode === 'withdraw'
                    ? '!bg-[var(--negative)] hover:!bg-[var(--negative)]/80 shadow-lg shadow-[var(--negative)]/20'
                    : 'shadow-lg shadow-[var(--positive)]/20'
                }
              >
                {mode === 'deposit'
                  ? isAmountValid ? `Deposit ${formatCurrency(parsedAmount)}` : 'Enter an amount'
                  : isAmountValid ? `Withdraw ${formatCurrency(parsedAmount)}` : 'Enter an amount'}
              </Button>
            </div>
          </Card>
        </div>

        {/* Right: Stats */}
        <div className="lg:col-span-2 space-y-4">
          {/* Summary Cards */}
          <Card padding="md">
            <CardHeader title="Account Summary" />
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--positive)]/5 border border-[var(--positive)]/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[var(--positive)]/15 flex items-center justify-center">
                    <TrendingUp size={14} className="text-[var(--positive)]" />
                  </div>
                  <span className="text-sm text-[var(--text-secondary)]">Total Credited</span>
                </div>
                <span className="font-bold tabular-nums text-[var(--positive)]">{formatCurrency(totalCredits)}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--negative)]/5 border border-[var(--negative)]/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[var(--negative)]/15 flex items-center justify-center">
                    <ArrowUpFromLine size={14} className="text-[var(--negative)]" />
                  </div>
                  <span className="text-sm text-[var(--text-secondary)]">Total Debited</span>
                </div>
                <span className="font-bold tabular-nums text-[var(--negative)]">{formatCurrency(totalDebits)}</span>
              </div>

              {primaryAccount && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--accent-gold)]/5 border border-[var(--accent-gold)]/10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[var(--accent-gold)]/15 flex items-center justify-center">
                      <PiggyBank size={14} className="text-[var(--accent-gold)]" />
                    </div>
                    <span className="text-sm text-[var(--text-secondary)]">Balance</span>
                  </div>
                  <span className="font-bold tabular-nums text-[var(--accent-gold)]">{formatCurrency(primaryAccount.availableBalance)}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Recent Activity */}
          <Card padding="md">
            <CardHeader title="Recent Activity" subtitle="Last 5 transactions" />
            {recent.length === 0 ? (
              <div className="text-center py-8">
                <Clock size={28} className="text-[var(--text-secondary)]/40 mx-auto mb-2" />
                <p className="text-sm text-[var(--text-secondary)]">No transactions yet.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {recent.map((tx) => (
                  <div
                    key={tx.referenceId}
                    className="flex items-center gap-3 py-2.5 border-b border-[var(--border-subtle)] last:border-0"
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isCredit(tx.transactionType)
                          ? 'bg-[var(--positive)]/15'
                          : 'bg-[var(--negative)]/15'
                      }`}
                    >
                      {isCredit(tx.transactionType) ? (
                        <ArrowDownToLine size={12} className="text-[var(--positive)]" />
                      ) : (
                        <ArrowUpFromLine size={12} className="text-[var(--negative)]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[var(--text-primary)] truncate">
                        {tx.comments ?? tx.transactionType}
                      </p>
                    </div>
                    <p
                      className={`text-xs font-bold tabular-nums ${
                        isCredit(tx.transactionType) ? 'text-[var(--positive)]' : 'text-[var(--negative)]'
                      }`}
                    >
                      {isCredit(tx.transactionType) ? '+' : '-'}{formatCurrency(tx.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
