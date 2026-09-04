import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  ArrowLeftRight,
  ArrowRight,
  CheckCircle,
  Printer,
  ShieldCheck,
  Wallet,
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
    .refine((val) => val.toUpperCase().startsWith('FIN') || val.length >= 6, 'Enter a valid account number or unique ID'),
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
  const hasSufficientFunds = !primaryAccount || parsedAmount <= 0 || parsedAmount <= primaryAccount.availableBalance;

  const onPreSubmit = (data: TransferForm) => {
    if (!primaryAccount?.accountNumber) {
      toast('error', 'No account found', 'Cannot initiate transfer without an active account.');
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
      toast('success', 'Transfer successful', result.message);
    } catch (err) {
      const apiErr = err as ApiError;
      toast('error', 'Transfer failed', apiErr.message);
      setShowConfirm(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (receipt) {
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto">
        <Card padding="lg">
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-[var(--positive)]/15 border border-[var(--positive)]/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={34} className="text-[var(--positive)]" />
            </div>
            <h2 className="font-display text-3xl font-bold">Transfer completed</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Funds have been sent successfully.</p>
          </div>

          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-2)] p-4 space-y-3 print-receipt">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">From</span>
              <span className="font-mono text-xs">{maskAccountNumber(primaryAccount?.accountNumber)}</span>
            </div>
            <div className="flex items-center justify-center text-[var(--text-secondary)]"><ArrowRight size={14} /></div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">To</span>
              <span className="font-mono text-xs">{formData?.toAccount}</span>
            </div>

            <hr className="border-[var(--border-subtle)]" />
            <Line label="Reference" value={receipt.transactionId} mono />
            <Line label="Amount" value={formatCurrency(parseFloat(formData?.amount ?? '0'))} strong />
            <Line label="Description" value={formData?.description || '—'} />
            <Line label="Timestamp" value={formatDateTime(new Date().toISOString())} />
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-secondary)]">Status</span>
              <Badge variant="success" dot>Completed</Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6 no-print">
            <Button variant="secondary" icon={<Printer size={14} />} onClick={() => window.print()}>Print</Button>
            <Button onClick={() => { setReceipt(null); setFormData(null); }} id="new-transfer-btn">New Transfer</Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="font-display text-3xl font-bold">Transfer Funds</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Secure instant transfers to accounts or Finexus IDs.</p>
      </div>

      {accountLoading ? (
        <SkeletonCard />
      ) : primaryAccount ? (
        <Card padding="md" className="bg-[var(--hero-bg)]">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center justify-center">
                <Wallet size={18} className="text-[var(--accent-primary)] dark:text-[var(--accent-secondary)]" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">Sending from</p>
                <p className="text-sm font-semibold">{primaryAccount.accountType} • <span className="font-mono text-xs text-[var(--text-secondary)]">{maskAccountNumber(primaryAccount.accountNumber)}</span></p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-[var(--text-secondary)]">Available</p>
              <p className="font-display text-xl font-bold tabular-nums">{formatCurrency(primaryAccount.availableBalance)}</p>
            </div>
          </div>
        </Card>
      ) : (
        <Card padding="md"><p className="text-sm text-[var(--text-secondary)]">No account found.</p></Card>
      )}

      <Card padding="lg">
        <CardHeader title="Transfer Details" subtitle="Review and confirm before sending" />
        <form id="transfer-form" onSubmit={handleSubmit(onPreSubmit)} className="space-y-4 mt-4">
          <Input
            label="Recipient Account / ID"
            id="transfer-to-account"
            placeholder="ACC0000002 or FIN2"
            error={errors.toAccount?.message}
            {...register('toAccount')}
          />

          <Input
            label="Amount"
            type="number"
            id="transfer-amount"
            placeholder="0.00"
            min="0.01"
            step="0.01"
            error={errors.amount?.message}
            {...register('amount')}
          />

          {parsedAmount > 0 && !hasSufficientFunds && (
            <p className="text-xs text-[var(--negative)]">Insufficient funds. Available: {formatCurrency(primaryAccount?.availableBalance ?? 0)}</p>
          )}

          <Input
            label="Description"
            id="transfer-description"
            placeholder="Invoice payment"
            {...register('description')}
          />

          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-2)] p-3 text-xs text-[var(--text-secondary)] inline-flex items-center gap-2">
            <ShieldCheck size={14} /> End-to-end secured processing.
          </div>

          <Button
            type="submit"
            fullWidth
            icon={<ArrowLeftRight size={16} />}
            disabled={(!hasSufficientFunds && parsedAmount > 0) || !primaryAccount}
            id="transfer-review-btn"
          >
            Review Transfer
          </Button>
        </form>
      </Card>

      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Confirm Transfer"
        subtitle="Verify recipient and amount"
        id="transfer-confirm-modal"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowConfirm(false)} disabled={isLoading}>Cancel</Button>
            <Button loading={isLoading} onClick={onConfirm} id="transfer-final-confirm-btn">Confirm Transfer</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-2)] p-4">
            <Line label="From" value={maskAccountNumber(primaryAccount?.accountNumber)} mono />
            <Line label="To" value={formData?.toAccount || ''} mono />
            <Line label="Amount" value={formatCurrency(parseFloat(formData?.amount ?? '0'))} strong />
            <Line label="Description" value={formData?.description || '—'} />
          </div>
          <p className="text-xs text-[var(--text-secondary)] text-center">Transfers are processed immediately and cannot be reversed.</p>
        </div>
      </Modal>
    </motion.div>
  );
}

function Line({ label, value, mono, strong }: { label: string; value: string; mono?: boolean; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm mb-2 last:mb-0">
      <span className="text-[var(--text-secondary)]">{label}</span>
      <span className={`${mono ? 'font-mono text-xs' : ''} ${strong ? 'font-bold' : 'font-medium'}`}>{value}</span>
    </div>
  );
}