import { describe, it, expect } from 'vitest';
import { formatCurrency, maskAccountNumber, isCredit, passwordStrength, formatDate } from '../utils';

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
