/**
 * Utility functions for Finexus frontend
 */

// ---- Currency Formatting ----

const formatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null) return '₹0.00';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '₹0.00';
  // Standardize space between currency symbol and number if needed, or let formatter handle it
  return formatter.format(num);
}

export function formatCurrencyCompact(amount: number): string {
  if (amount >= 1_000_000) return `₹ ${(amount / 1_000_000).toFixed(2)}M`;
  if (amount >= 1_000) return `₹ ${(amount / 1_000).toFixed(1)}K`;
  return formatCurrency(amount);
}

// ---- Date Formatting ----

/**
 * Handles LocalDateTime from Spring Boot which may be serialized as:
 *   - ISO string: "2024-01-15T14:30:00"
 *   - Array: [2024, 1, 15, 14, 30, 0]
 */
export function parseBackendDate(value: string | number[] | undefined | null): Date | null {
  if (!value) return null;
  if (Array.isArray(value)) {
    // [year, month, day, hour, minute, second] — month is 1-indexed from Java
    const [year, month, day, hour = 0, min = 0, sec = 0] = value;
    return new Date(year, month - 1, day, hour, min, sec);
  }
  return new Date(value);
}

export function formatDate(value: string | number[] | undefined | null, opts?: Intl.DateTimeFormatOptions): string {
  const date = parseBackendDate(value);
  if (!date || isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-SG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...opts,
  });
}

export function formatDateTime(value: string | number[] | undefined | null): string {
  const date = parseBackendDate(value);
  if (!date || isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-SG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTimeAgo(value: string | number[] | undefined | null): string {
  const date = parseBackendDate(value);
  if (!date || isNaN(date.getTime())) return '—';
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(value);
}

// ---- Account Number Formatting ----

export function maskAccountNumber(accountNumber: string | undefined | null): string {
  if (!accountNumber) return '****';
  const last4 = accountNumber.slice(-4);
  return `•••• •••• ${last4}`;
}

// ---- Transaction helpers ----

export function isCredit(transactionType: string, amount?: number | string | null): boolean {
  const type = transactionType?.toUpperCase();
  // For internal transfers the backend sets the same type on both legs;
  // a positive amount means the receiver side (credit), negative means the sender side (debit).
  if (type === 'INTERNAL_TRANSFER') {
    if (amount !== undefined && amount !== null) {
      const num = typeof amount === 'string' ? parseFloat(amount) : amount;
      return num > 0;
    }
    // Fallback: if no amount provided assume credit (safe default)
    return true;
  }
  return ['DEPOSIT', 'TRANSFER_IN'].includes(type);
}

/**
 * What kind of movement a transaction is, from the account holder's point of view.
 * The backend stores transfers as INTERNAL_TRANSFER on both legs; the sign of
 * the amount says which side you are on.
 */
export type TxCategory = 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'OTHER';

export function txCategory(transactionType: string, amount?: number | string | null): TxCategory {
  const type = transactionType?.toUpperCase();
  if (type === 'DEPOSIT' || type === 'WITHDRAWAL' || type === 'TRANSFER_IN' || type === 'TRANSFER_OUT') {
    return type;
  }
  if (type === 'INTERNAL_TRANSFER' || type === 'EXTERNAL_TRANSFER') {
    return isCredit('INTERNAL_TRANSFER', amount) ? 'TRANSFER_IN' : 'TRANSFER_OUT';
  }
  return 'OTHER';
}

export const TX_CATEGORY_LABELS: Record<TxCategory, string> = {
  DEPOSIT: 'Deposit',
  WITHDRAWAL: 'Withdrawal',
  TRANSFER_IN: 'Transfer in',
  TRANSFER_OUT: 'Transfer out',
  OTHER: 'Other',
};

export function transactionLabel(type: string, amount?: number | string | null): string {
  const category = txCategory(type, amount);
  return category === 'OTHER' ? capitalize(type?.replace(/_/g, ' ') ?? '') : TX_CATEGORY_LABELS[category];
}

/** Absolute value of a transaction amount (the backend stores debits as negatives). */
export function absAmount(amount: number | string | null | undefined): number {
  const num = typeof amount === 'string' ? parseFloat(amount) : (amount ?? 0);
  return Number.isFinite(num) ? Math.abs(num) : 0;
}

/** Money in / money out for the current calendar month. */
export function monthTotals(
  transactions: { transactionType: string; amount: number; localDateTime: string | number[] }[],
  now: Date = new Date()
): { moneyIn: number; moneyOut: number; count: number } {
  let moneyIn = 0;
  let moneyOut = 0;
  let count = 0;
  for (const tx of transactions) {
    const d = parseBackendDate(tx.localDateTime);
    if (!d || d.getFullYear() !== now.getFullYear() || d.getMonth() !== now.getMonth()) continue;
    count++;
    if (isCredit(tx.transactionType, tx.amount)) moneyIn += absAmount(tx.amount);
    else moneyOut += absAmount(tx.amount);
  }
  return { moneyIn, moneyOut, count };
}

/** Sort key for a backend date (string or [y,m,d,h,m,s] array), keeping the time of day. */
export function dateValue(value: string | number[] | undefined | null): number {
  const d = parseBackendDate(value);
  return d && !isNaN(d.getTime()) ? d.getTime() : 0;
}

// ---- String utilities ----

export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function truncate(str: string, len: number): string {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '…' : str;
}

// ---- Password strength ----

export function passwordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: 'Very Weak', color: '#F43F5E' },
    { label: 'Weak', color: '#F97316' },
    { label: 'Fair', color: '#EAB308' },
    { label: 'Strong', color: '#22C55E' },
    { label: 'Very Strong', color: '#10B981' },
  ];
  const idx = Math.min(score, 4);
  return { score, ...levels[idx] };
}

// ---- CSV Export ----

export function exportToCSV(data: Record<string, unknown>[], filename: string): void {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map((h) => JSON.stringify(row[h] ?? '')).join(',')
  );
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ---- Clipboard ----

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

// ---- Debounce ----

export function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
