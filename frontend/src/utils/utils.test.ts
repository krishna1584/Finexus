import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  maskAccountNumber,
  isCredit,
  passwordStrength,
  formatDate,
  txCategory,
  transactionLabel,
  monthTotals,
  dateValue,
} from '../utils';

describe('formatCurrency', () => {
  it('formats a number as INR currency', () => {
    const result = formatCurrency(1234.56);
    expect(result).toContain('1,234.56');
  });

  it('handles null gracefully', () => {
    expect(formatCurrency(null)).toContain('0.00');
  });

  it('handles string input', () => {
    const result = formatCurrency('500');
    expect(result).toContain('500.00');
  });
});

describe('maskAccountNumber', () => {
  it('masks all but last 4 digits', () => {
    expect(maskAccountNumber('FX0019284756')).toBe('•••• •••• 4756');
  });

  it('handles undefined', () => {
    expect(maskAccountNumber(undefined)).toBe('****');
  });
});

describe('isCredit', () => {
  it('returns true for DEPOSIT', () => expect(isCredit('DEPOSIT')).toBe(true));
  it('returns true for TRANSFER_IN', () => expect(isCredit('TRANSFER_IN')).toBe(true));
  it('returns false for WITHDRAWAL', () => expect(isCredit('WITHDRAWAL')).toBe(false));
  it('returns false for TRANSFER_OUT', () => expect(isCredit('TRANSFER_OUT')).toBe(false));
});

describe('txCategory', () => {
  it('treats a positive INTERNAL_TRANSFER as money in', () =>
    expect(txCategory('INTERNAL_TRANSFER', 500)).toBe('TRANSFER_IN'));
  it('treats a negative INTERNAL_TRANSFER as money out', () =>
    expect(txCategory('INTERNAL_TRANSFER', -500)).toBe('TRANSFER_OUT'));
  it('labels transfers readably', () =>
    expect(transactionLabel('INTERNAL_TRANSFER', -1)).toBe('Transfer out'));
});

describe('monthTotals', () => {
  it('only counts this month and splits in/out', () => {
    const now = new Date(2026, 10, 15);
    const totals = monthTotals(
      [
        { transactionType: 'DEPOSIT', amount: 1000, localDateTime: [2026, 11, 2, 10, 0, 0] },
        { transactionType: 'WITHDRAWAL', amount: -300, localDateTime: '2026-11-03T09:00:00' },
        { transactionType: 'INTERNAL_TRANSFER', amount: -200, localDateTime: '2026-11-04T09:00:00' },
        { transactionType: 'DEPOSIT', amount: 9999, localDateTime: '2026-10-30T09:00:00' },
      ],
      now
    );
    expect(totals).toEqual({ moneyIn: 1000, moneyOut: 500, count: 3 });
  });
});

describe('dateValue', () => {
  it('keeps the time of day when sorting', () =>
    expect(dateValue([2026, 1, 1, 18, 0, 0])).toBeGreaterThan(dateValue([2026, 1, 1, 9, 0, 0])));
});

describe('passwordStrength', () => {
  it('rates "abc" as very weak', () => {
    const { label } = passwordStrength('abc');
    expect(label).toBe('Very Weak');
  });

  it('rates a strong password appropriately', () => {
    const { score } = passwordStrength('S3cur3P@ssword!');
    expect(score).toBeGreaterThanOrEqual(4);
  });
});

describe('formatDate', () => {
  it('returns — for null', () => {
    expect(formatDate(null)).toBe('—');
  });

  it('parses ISO string', () => {
    const result = formatDate('2024-01-15T00:00:00');
    expect(result).toContain('2024');
  });
});
