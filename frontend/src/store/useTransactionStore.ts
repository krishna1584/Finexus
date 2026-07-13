import { create } from 'zustand';
import type { TransactionRecord } from '@/types';

interface TransactionState {
  transactions: TransactionRecord[];
  isLoading: boolean;
  error: string | null;

  setTransactions: (transactions: TransactionRecord[]) => void;
  addTransaction: (transaction: TransactionRecord) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],
  isLoading: false,
  error: null,

  setTransactions: (transactions) => set({ transactions }),
  addTransaction: (transaction) =>
    set((state) => ({ transactions: [transaction, ...state.transactions] })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set({ transactions: [], isLoading: false, error: null }),
}));
