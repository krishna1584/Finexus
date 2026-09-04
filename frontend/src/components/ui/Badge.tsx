import React from 'react';

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
    normalized === 'ACTIVE' || normalized === 'COMPLETED'
      ? 'success'
      : normalized === 'INACTIVE' || normalized === 'CLOSED' || normalized === 'FAILED'
      ? 'danger'
      : normalized === 'PENDING'
      ? 'gold'
      : 'neutral';

  return (
    <Badge variant={variant} dot>
      {status ? status.charAt(0) + status.slice(1).toLowerCase() : '—'}
    </Badge>
  );
}

// ---- Transaction type badge ----

export function TxTypeBadge({ type }: { type: string }) {
  const upper = type?.toUpperCase();
  const variant: BadgeVariant =
    upper === 'DEPOSIT' || upper === 'TRANSFER_IN'
      ? 'success'
      : upper === 'WITHDRAWAL' || upper === 'TRANSFER_OUT'
      ? 'danger'
      : 'neutral';

  const labels: Record<string, string> = {
    DEPOSIT: 'Deposit',
    WITHDRAWAL: 'Withdrawal',
    TRANSFER_IN: 'Transfer In',
    TRANSFER_OUT: 'Transfer Out',
  };

  return <Badge variant={variant}>{labels[upper] ?? type}</Badge>;
}
