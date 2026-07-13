import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeftRight,
  CheckCircle,
  Printer,
  Wallet,
  ArrowRight,
} from 'lucide-react';
import { useAccounts } from '@/hooks/useAccounts';
import { useUIStore } from '@/store/useUIStore';
import { fundTransferService } from '@/services/fundTransferService';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { formatCurrency, formatDateTime, maskAccountNumber } from '@/utils';
import type { FundTransferResponse, ApiError } from '@/types';

const transferSchema = z.object({
  toAccount: z
    .string()
    .min(1, 'Recipient account or unique ID is required')
    .refine(
      (val) => val.toUpperCase().startsWith('FIN') || val.length >= 6,
      'Enter a valid account number (e.g. ACC0000002) or unique ID (e.g. FIN2)'
    ),
  amount: z.string().refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, 'Enter a positive amount'),
  description: z.string().optional(),
});

type TransferForm = z.infer<typeof transferSchema>;

export default function TransferPage() {
  const { primaryAccount, isLoading: accountLoading } = useAccounts();
  const toast = useUIStore((s) => s.toast);

  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState<TransferForm | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [receipt, setReceipt] = useState<FundTransferResponse | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TransferForm>({
    resolver: zodResolver(transferSchema),
    defaultValues: { toAccount: '', amount: '', description: '' },
  });

  const amount = watch('amount');
  const parsedAmount = parseFloat(amount || '0');

  const hasSufficientFunds =
    !primaryAccount || parsedAmount <= 0 || parsedAmount <= primaryAccount.availableBalance;

  const onPreSubmit = (data: TransferForm) => {
    if (!primaryAccount?.accountNumber) {
      toast('error', 'No account found', 'Cannot initiate a transfer without an active account.');
      return;
    }
    setFormData(data);
    setShowConfirm(true);
  };

  const onConfirm = async () => {
    if (!formData || !primaryAccount?.accountNumber) return;
    setIsLoading(true);
    try {
      const result = await fundTransferService.fundTransfer({
        fromAccount: primaryAccount.accountNumber,
        toAccount: formData.toAccount,
        amount: parseFloat(formData.amount),
      });
      setReceipt(result);
      setShowConfirm(false);
      toast('success', 'Transfer successful!', result.message);
    } catch (err) {
      const apiErr = err as ApiError;
      toast('error', 'Transfer failed', apiErr.message);
      setShowConfirm(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setReceipt(null);
    setFormData(null);
  };

  /* ── Receipt screen ────────────────────────────────────────── */
  if (receipt) {
    return (
      <div className="max-w-lg mx-auto animate-slide-in-up">
        <Card padding="lg">
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-[var(--positive)]/15 border-2 border-[var(--positive)]/30 flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={38} className="text-[var(--positive)]" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Transfer Successful!</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Your funds have been sent.</p>
          </div>

          {/* Receipt */}
          <div className="space-y-3 p-4 bg-[var(--bg-surface-2)] rounded-2xl border border-[var(--border-subtle)] mb-6 print-receipt">
            {/* From → To visual */}
            <div className="flex items-center gap-2 py-2 justify-center">
              <div className="text-center">
                <p className="text-xs text-[var(--text-secondary)] mb-0.5">From</p>
                <p className="font-mono text-xs font-semibold text-[var(--text-primary)]">
                  {maskAccountNumber(primaryAccount?.accountNumber)}
                </p>
              </div>
              <div className="flex-1 flex items-center justify-center px-2">
                <div className="h-px flex-1 bg-[var(--border-subtle)]" />
                <ArrowRight size={14} className="mx-1 text-[var(--accent-gold)] flex-shrink-0" />
                <div className="h-px flex-1 bg-[var(--border-subtle)]" />
              </div>
              <div className="text-center">
                <p className="text-xs text-[var(--text-secondary)] mb-0.5">To</p>
                <p className="font-mono text-xs font-semibold text-[var(--text-primary)]">{formData?.toAccount}</p>
              </div>
            </div>

            <div className="border-t border-[var(--border-subtle)] pt-3 space-y-2.5">
              {[
                { label: 'Reference ID', value: receipt.transactionId, mono: true },
                { label: 'Amount', value: formatCurrency(parseFloat(formData?.amount ?? '0')), bold: true },
                { label: 'Description', value: formData?.description || '—' },
                { label: 'Timestamp', value: formatDateTime(new Date().toISOString()) },
                {
                  label: 'Status',
                  value: <Badge variant="success" dot>Completed</Badge>,
                },
              ].map(({ label, value, mono, bold }) => (
                <div key={label} className="flex justify-between text-sm gap-4">
                  <span className="text-[var(--text-secondary)] flex-shrink-0">{label}</span>
                  <span className={`text-right text-[var(--text-primary)] ${mono ? 'font-mono text-xs' : ''} ${bold ? 'font-bold' : 'font-medium'}`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 no-print">
            <Button variant="secondary" size="sm" icon={<Printer size={14} />} onClick={() => window.print()}>
              Print
            </Button>
            <Button variant="primary" fullWidth onClick={handleReset} id="new-transfer-btn">
              New Transfer
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  /* ── Transfer form ─────────────────────────────────────────── */
  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Transfer Funds</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">
          Send money to any account instantly.
        </p>
      </div>

      {/* Account info banner */}
      {accountLoading ? (
        <SkeletonCard />
      ) : primaryAccount ? (
        <Card padding="md" className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-gold)]/5 to-transparent pointer-events-none" />
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--accent-gold)]/15 flex items-center justify-center flex-shrink-0">
              <Wallet size={20} className="text-[var(--accent-gold)]" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide mb-0.5">Sending From</p>
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                {primaryAccount.accountType} Account
                <span className="font-mono font-normal text-[var(--text-secondary)] ml-2 text-xs">
                  {maskAccountNumber(primaryAccount.accountNumber)}
                </span>
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-[var(--text-secondary)] mb-0.5">Available</p>
              <p className="text-base font-bold text-[var(--text-primary)] tabular-nums">
                {formatCurrency(primaryAccount.availableBalance)}
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <Card padding="md">
          <p className="text-sm text-[var(--text-secondary)]">No account found. Please contact support.</p>
        </Card>
      )}

      <Card padding="lg">
        <CardHeader title="Transfer Details" subtitle="Fill in the recipient and amount" />

        <form id="transfer-form" onSubmit={handleSubmit(onPreSubmit)} className="space-y-4 mt-4">
          {/* Recipient */}
          <Input
            label="Recipient Account / Unique ID"
            id="transfer-to-account"
            placeholder="e.g. ACC0000002 or FIN2"
            error={errors.toAccount?.message}
            {...register('toAccount')}
          />

          {/* Amount */}
          <div>
            <Input
              label="Amount (INR)"
              type="number"
              id="transfer-amount"
              placeholder="0.00"
              min="0.01"
              step="0.01"
              error={errors.amount?.message}
              {...register('amount')}
            />
            {parsedAmount > 0 && !hasSufficientFunds && (
              <p className="mt-1.5 text-xs text-[var(--negative)]">
                ⚠ Insufficient funds. Available:{' '}
                {formatCurrency(primaryAccount?.availableBalance ?? 0)}
              </p>
            )}
          </div>

          {/* Description */}
          <Input
            label="Description (optional)"
            id="transfer-description"
            placeholder="e.g. Rent payment, split bill…"
            {...register('description')}
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            icon={<ArrowLeftRight size={16} />}
            disabled={(!hasSufficientFunds && parsedAmount > 0) || !primaryAccount}
            id="transfer-review-btn"
          >
            Review Transfer
          </Button>
        </form>
      </Card>

      {/* Confirm Modal */}
      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Confirm Transfer"
        subtitle="Review the details before sending."
        id="transfer-confirm-modal"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowConfirm(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="primary" loading={isLoading} onClick={onConfirm} id="transfer-final-confirm-btn">
              Confirm Transfer
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          {/* From → To visual */}
          <div className="flex items-center gap-2 p-3 bg-[var(--bg-surface-2)] rounded-xl border border-[var(--border-subtle)]">
            <div className="text-center flex-1">
              <p className="text-xs text-[var(--text-secondary)] mb-0.5">From</p>
              <p className="font-mono text-xs font-semibold text-[var(--text-primary)]">
                {maskAccountNumber(primaryAccount?.accountNumber)}
              </p>
            </div>
            <ArrowRight size={16} className="text-[var(--accent-gold)] flex-shrink-0" />
            <div className="text-center flex-1">
              <p className="text-xs text-[var(--text-secondary)] mb-0.5">To</p>
              <p className="font-mono text-xs font-semibold text-[var(--text-primary)]">{formData?.toAccount}</p>
            </div>
          </div>

          <div className="p-4 bg-[var(--bg-surface-2)] rounded-xl space-y-3 border border-[var(--border-subtle)]">
            {[
              { label: 'Amount', value: formatCurrency(parseFloat(formData?.amount ?? '0')), bold: true },
              { label: 'Description', value: formData?.description || '—' },
            ].map(({ label, value, bold }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">{label}</span>
                <span className={`text-[var(--text-primary)] ${bold ? 'font-bold' : 'font-medium'}`}>{value}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-[var(--text-secondary)] text-center">
            Transfers are processed immediately and cannot be reversed.
          </p>
        </div>
      </Modal>
    </div>
  );
}
