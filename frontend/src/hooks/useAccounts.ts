import { useCallback, useEffect } from 'react';
import { useAccountStore } from '@/store/useAccountStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';
import { accountService } from '@/services/accountService';
import { MOCK_ACCOUNTS } from '@/services/mock/mockData';
import type { ApiError } from '@/types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true';

// Session lock to prevent duplicate concurrent account creation requests for the same user
const creationLocks = new Set<number>();

export function useAccounts() {
  const { accounts, primaryAccount, isLoading, error, setAccounts, setPrimaryAccount, setLoading, setError } =
    useAccountStore();
  const userId = useAuthStore((s) => s.userId);
  const toast = useUIStore((s) => s.toast);

  const fetchAccounts = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      if (USE_MOCK) {
        // Mock returns all accounts for the user
        const all = MOCK_ACCOUNTS.filter((a) => a.userId === userId || USE_MOCK);
        setAccounts(all);
        setPrimaryAccount(all[0] ?? null);
      } else {
        // Fetch all accounts for the user
        let allAccounts = await accountService.getAllAccountsByUserId(userId);

        // If no accounts exist yet, auto-create a default SAVINGS account
        if (allAccounts.length === 0 && !creationLocks.has(userId)) {
          creationLocks.add(userId);
          try {
            await accountService.createAccount({
              userId,
              accountType: 'SAVINGS',
              availableBalance: 0,
            });
            // Re-fetch after creation
            allAccounts = await accountService.getAllAccountsByUserId(userId);
          } catch (err) {
            creationLocks.delete(userId);
            throw err;
          }
        }

        setAccounts(allAccounts);
        setPrimaryAccount(allAccounts[0] ?? null);
      }
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.message);
      toast('error', 'Failed to load accounts', apiErr.message);
    } finally {
      setLoading(false);
    }
  }, [userId, setAccounts, setPrimaryAccount, setLoading, setError, toast]);

  // Auto-fetch on mount if no data
  useEffect(() => {
    if (userId && accounts.length === 0 && !isLoading) {
      fetchAccounts();
    }
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // fetchAccounts only re-fetches if no accounts are loaded yet (used for initial load).
  // refreshAccounts always fetches fresh data from the server (used after transfers, etc.).
  const refreshAccounts = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      if (USE_MOCK) {
        const all = MOCK_ACCOUNTS.filter((a) => a.userId === userId || USE_MOCK);
        setAccounts(all);
        setPrimaryAccount(all[0] ?? null);
      } else {
        const allAccounts = await accountService.getAllAccountsByUserId(userId);
        setAccounts(allAccounts);
        setPrimaryAccount(allAccounts[0] ?? null);
      }
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.message);
      toast('error', 'Failed to refresh accounts', apiErr.message);
    } finally {
      setLoading(false);
    }
  }, [userId, setAccounts, setPrimaryAccount, setLoading, setError, toast]);

  return {
    accounts,
    primaryAccount,
    isLoading,
    error,
    fetchAccounts,
    refreshAccounts,
  };
}

