import { useCallback } from 'react';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useUIStore } from '@/store/useUIStore';
import { transactionService } from '@/services/transactionService';
import type { ApiError } from '@/types';
import { dateValue } from '@/utils';

export function useTransactions() {
  const { transactions, isLoading, error, setTransactions, setLoading, setError } =
    useTransactionStore();
  const toast = useUIStore((s) => s.toast);

  const fetchTransactions = useCallback(
    async (accountId: string) => {
      setLoading(true);
      setError(null);
      try {
        const data = await transactionService.getTransactionsByAccountId(accountId);
        // Newest first, including the time of day (the old sort ignored it).
        const sorted = [...data].sort((a, b) => dateValue(b.localDateTime) - dateValue(a.localDateTime));
        setTransactions(sorted);
      } catch (err) {
        const apiErr = err as ApiError;
        setError(apiErr.message);
        toast('error', 'Failed to load transactions', apiErr.message);
      } finally {
        setLoading(false);
      }
    },
    [setTransactions, setLoading, setError, toast]
  );

  return {
    transactions,
    isLoading,
    error,
    fetchTransactions,
  };
}
