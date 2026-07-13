import { useCallback } from 'react';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useUIStore } from '@/store/useUIStore';
import { transactionService } from '@/services/transactionService';
import type { TransactionDto, ApiError } from '@/types';

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
        // Sort newest first
        const sorted = [...data].sort((a, b) => {
          const aDate = Array.isArray(a.localDateTime)
            ? new Date(a.localDateTime[0], a.localDateTime[1] - 1, a.localDateTime[2]).getTime()
            : new Date(a.localDateTime as string).getTime();
          const bDate = Array.isArray(b.localDateTime)
            ? new Date(b.localDateTime[0], b.localDateTime[1] - 1, b.localDateTime[2]).getTime()
            : new Date(b.localDateTime as string).getTime();
          return bDate - aDate;
        });
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

  const doTransaction = useCallback(
    async (data: TransactionDto): Promise<boolean> => {
      try {
        await transactionService.addTransaction(data);
        toast('success', 'Transaction successful', `${data.transactionType} of ${data.amount} completed.`);
        // Refresh transactions for this account
        await fetchTransactions(data.accountId);
        return true;
      } catch (err) {
        const apiErr = err as ApiError;
        toast('error', 'Transaction failed', apiErr.message);
        return false;
      }
    },
    [fetchTransactions, toast]
  );

  return {
    transactions,
    isLoading,
    error,
    fetchTransactions,
    doTransaction,
  };
}
