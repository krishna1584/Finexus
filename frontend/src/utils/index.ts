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

export function isCredit(transactionType: string): boolean {
  return ['DEPOSIT', 'TRANSFER_IN'].includes(transactionType?.toUpperCase());
}

export function transactionSign(transactionType: string): '+' | '-' {
  return isCredit(transactionType) ? '+' : '-';
}

export function transactionColor(transactionType: string): string {
  return isCredit(transactionType) ? 'var(--positive)' : 'var(--negative)';
}

export function transactionLabel(type: string): string {
  const labels: Record<string, string> = {
    DEPOSIT: 'Deposit',
    WITHDRAWAL: 'Withdrawal',
    TRANSFER_IN: 'Transfer In',
    TRANSFER_OUT: 'Transfer Out',
  };
  return labels[type?.toUpperCase()] ?? type;
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
