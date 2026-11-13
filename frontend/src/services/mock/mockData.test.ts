import { beforeEach, describe, expect, it, vi } from 'vitest';

// Demo mode must follow the same rules as the real backend, so it never shows
// behaviour the real app doesn't have. A fresh copy of the module per test
// keeps the in-memory balances independent.
let mock: typeof import('./mockData');

beforeEach(async () => {
  vi.resetModules();
  mock = await import('./mockData');
});

const balance = (n: string) => mock.MOCK_ACCOUNTS.find((a) => a.accountNumber === n)!.availableBalance;

describe('demo-mode rules', () => {
  it('sample balances match the sample transactions', () => {
    for (const a of mock.MOCK_ACCOUNTS) {
      const sum = mock.MOCK_TRANSACTIONS.filter((t) => t.accountId === a.accountNumber).reduce((s, t) => s + t.amount, 0);
      expect(sum).toBe(a.availableBalance);
    }
  });

  it('a transfer moves money on both sides and records both legs', () => {
    const before = [balance('ACC0000001'), balance('ACC0000002')];
    mock.mockTransfer('ACC0000001', 'ACC0000002', 100, 'Lunch');
    expect([balance('ACC0000001'), balance('ACC0000002')]).toEqual([before[0] - 100, before[1] + 100]);
    const legs = mock.MOCK_TRANSACTIONS.slice(-2);
    expect(legs.map((t) => t.amount)).toEqual([-100, 100]);
    expect(legs[0].comments).toBe('Transfer to ACC0000002 · Lunch');
  });

  it('rejects negative amounts, sending to yourself, and overdrawing', () => {
    expect(() => mock.mockTransfer('ACC0000001', 'ACC0000002', -5)).toThrow();
    expect(() => mock.mockTransfer('ACC0000001', 'ACC0000001', 5)).toThrow();
    expect(() => mock.mockDepositOrWithdraw('ACC0000001', 'WITHDRAWAL', 10_000_000, '')).toThrow();
  });

  it('only empty accounts can be closed, and closed accounts take no money', () => {
    expect(() => mock.mockCloseAccount('ACC0000002')).toThrow();
    const n = mock.mockCreateAccount(1, 'FIXED_DEPOSIT');
    mock.mockCloseAccount(n);
    expect(() => mock.mockDepositOrWithdraw(n, 'DEPOSIT', 10, '')).toThrow();
  });
});
