import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AccountDto } from '@/types';

interface AccountState {
  accounts: AccountDto[];
  /** The account the app is currently working with (chosen in the account switcher). */
  primaryAccount: AccountDto | null;
  /** Remembered across reloads so the user's choice sticks. */
  selectedAccountNumber: string | null;
  isLoading: boolean;
  /** True once accounts have been loaded at least once for this session. */
  loaded: boolean;
  error: string | null;

  setAccounts: (accounts: AccountDto[]) => void;
  selectAccount: (accountNumber: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

/** Keep the chosen account if it still exists; otherwise prefer the first active one. */
function pickPrimary(accounts: AccountDto[], selected: string | null): AccountDto | null {
  return (
    accounts.find((a) => a.accountNumber === selected) ??
    accounts.find((a) => a.accountStatus === 'ACTIVE') ??
    accounts[0] ??
    null
  );
}

export const useAccountStore = create<AccountState>()(
  persist(
    (set, get) => ({
      accounts: [],
      primaryAccount: null,
      selectedAccountNumber: null,
      isLoading: false,
      loaded: false,
      error: null,

      setAccounts: (accounts) => {
        const primaryAccount = pickPrimary(accounts, get().selectedAccountNumber);
        set({
          accounts,
          primaryAccount,
          selectedAccountNumber: primaryAccount?.accountNumber ?? null,
          loaded: true,
        });
      },
      selectAccount: (accountNumber) => {
        const account = get().accounts.find((a) => a.accountNumber === accountNumber);
        if (account) set({ primaryAccount: account, selectedAccountNumber: accountNumber });
      },
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      reset: () =>
        set({
          accounts: [],
          primaryAccount: null,
          selectedAccountNumber: null,
          isLoading: false,
          loaded: false,
          error: null,
        }),
    }),
    {
      name: 'finexus-account',
      partialize: (state) => ({ selectedAccountNumber: state.selectedAccountNumber }),
    }
  )
);
