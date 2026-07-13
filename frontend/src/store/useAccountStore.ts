import { create } from 'zustand';
import type { AccountDto } from '@/types';

interface AccountState {
  accounts: AccountDto[];
  primaryAccount: AccountDto | null;
  isLoading: boolean;
  error: string | null;

  setAccounts: (accounts: AccountDto[]) => void;
  setPrimaryAccount: (account: AccountDto) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useAccountStore = create<AccountState>((set) => ({
  accounts: [],
  primaryAccount: null,
  isLoading: false,
  error: null,

  setAccounts: (accounts) => set({ accounts }),
  setPrimaryAccount: (account) => set({ primaryAccount: account }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set({ accounts: [], primaryAccount: null, isLoading: false, error: null }),
}));
