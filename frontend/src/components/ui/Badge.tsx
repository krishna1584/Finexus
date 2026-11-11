import React from 'react';
import { transactionLabel, txCategory } from '@/utils';

type BadgeVariant = 'gold' | 'success' | 'danger' | 'neutral' | 'info';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  gold: 'bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] border border-[var(--accent-primary)]/25 dark:bg-[var(--accent-secondary-soft)] dark:text-[var(--accent-secondary)] dark:border-[var(--accent-secondary)]/25',
  success: 'bg-[var(--positive)]/15 text-[var(--positive)] border border-[var(--positive)]/20',
  danger: 'bg-[var(--negative)]/15 text-[var(--negative)] border border-[var(--negative)]/20',
  neutral: 'bg-[var(--bg-surface-2)] text-[var(--text-secondary)] border border-[var(--border-subtle)]',
  info: 'bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20',
};

const dotColors: Record<BadgeVariant, string> = {
  gold: 'bg-[var(--accent-primary)] dark:bg-[var(--accent-secondary)]',
  success: 'bg-[var(--positive)]',
  danger: 'bg-[var(--negative)]',
  neutral: 'bg-[var(--text-secondary)]',
  info: 'bg-[var(--accent-primary)]',
};

const sizeClasses = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
};

export function Badge({ children, variant = 'neutral', size = 'md', dot = false, className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(' ')}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColors[variant]}`} />
      )}
      {children}
    </span>
  );
}

// ---- Status badge helper ----

export function StatusBadge({ status }: { status: string }) {
  const normalized = status?.toUpperCase();
  const variant: BadgeVariant =
    normalized === 'ACTIVE' || normalized === 'COMPLETED' || normalized === 'SUCCESS' || normalized === 'APPROVED'
      ? 'success'
      : normalized === 'INACTIVE' || normalized === 'CLOSED' || normalized === 'FAILED' || normalized === 'BLOCKED' || normalized === 'REJECTED'
      ? 'danger'
      : normalized === 'PENDING' || normalized === 'PROCESSING'
      ? 'gold'
      : 'neutral';

  return (
    <Badge variant={variant} dot>
      {status ? status.charAt(0) + status.slice(1).toLowerCase() : '—'}
    </Badge>
  );
}

// ---- Transaction type badge ----

/** Pass the amount too: transfers are one type on the backend and the sign says in vs out. */
export function TxTypeBadge({ type, amount }: { type: string; amount?: number | string | null }) {
  const category = txCategory(type, amount);
  const variant: BadgeVariant =
    category === 'DEPOSIT' || category === 'TRANSFER_IN'
      ? 'success'
      : category === 'WITHDRAWAL' || category === 'TRANSFER_OUT'
      ? 'danger'
      : 'neutral';

  return <Badge variant={variant}>{transactionLabel(type, amount)}</Badge>;
}
