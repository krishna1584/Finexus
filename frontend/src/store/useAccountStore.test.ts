import { beforeEach, describe, expect, it } from 'vitest';
import { useAccountStore } from './useAccountStore';
import type { AccountDto } from '@/types';

const acc = (accountNumber: string, accountStatus = 'ACTIVE'): AccountDto => ({
  accountNumber,
  accountStatus,
  accountType: 'SAVINGS',
  availableBalance: 0,
  userId: 1,
});

describe('useAccountStore', () => {
  beforeEach(() => useAccountStore.getState().reset());

  it('picks the first active account when nothing was chosen', () => {
    useAccountStore.getState().setAccounts([acc('ACC1', 'CLOSED'), acc('ACC2'), acc('ACC3')]);
    expect(useAccountStore.getState().primaryAccount?.accountNumber).toBe('ACC2');
  });

  it('keeps the chosen account across refreshes', () => {
    const { setAccounts, selectAccount } = useAccountStore.getState();
    setAccounts([acc('ACC1'), acc('ACC2')]);
    selectAccount('ACC2');
    setAccounts([acc('ACC1'), acc('ACC2')]); // e.g. after a deposit refresh
    expect(useAccountStore.getState().primaryAccount?.accountNumber).toBe('ACC2');
  });

  it('falls back when the chosen account no longer exists', () => {
    const { setAccounts, selectAccount } = useAccountStore.getState();
    setAccounts([acc('ACC1'), acc('ACC2')]);
    selectAccount('ACC2');
    setAccounts([acc('ACC1')]);
    expect(useAccountStore.getState().primaryAccount?.accountNumber).toBe('ACC1');
  });

  it('reset (on sign-out) forgets everything', () => {
    useAccountStore.getState().setAccounts([acc('ACC1')]);
    useAccountStore.getState().reset();
    const s = useAccountStore.getState();
    expect([s.accounts.length, s.primaryAccount, s.selectedAccountNumber, s.loaded]).toEqual([0, null, null, false]);
  });
});
