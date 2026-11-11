import { useCallback, useEffect } from 'react';
import { useAccountStore } from '@/store/useAccountStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';
import { accountService } from '@/services/accountService';
import type { ApiError } from '@/types';

/**
 * Accounts for the signed-in user.
 *
 * Accounts are created by the backend when the user registers. The front end
 * no longer creates one silently when the list is empty; the dashboard shows
 * an "Open account" action instead.
 */
export function useAccounts() {
  const { accounts, primaryAccount, isLoading, loaded, error, setAccounts, selectAccount, setLoading, setError } =
    useAccountStore();
  const userId = useAuthStore((s) => s.userId);
  const toast = useUIStore((s) => s.toast);
  const notify = useUIStore((s) => s.addNotification);

  /** Always fetches fresh data from the server (after deposits, transfers, etc.). */
  const refreshAccounts = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      setAccounts(await accountService.getAllAccountsByUserId(userId));
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.message);
      toast('error', 'Failed to load accounts', apiErr.message);
    } finally {
      setLoading(false);
    }
  }, [userId, setAccounts, setLoading, setError, toast]);

  // Load once per session; pages call refreshAccounts when they need fresh balances.
  useEffect(() => {
    if (userId && !loaded && !isLoading) {
      refreshAccounts();
    }
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const openAccount = useCallback(
    async (accountType: string): Promise<boolean> => {
      if (!userId) return false;
      try {
        const res = await accountService.createAccount({ userId, accountType, availableBalance: 0 });
        toast('success', 'Account opened', res.responseMessage);
        notify({ type: 'account', title: 'New account opened', message: res.responseMessage });
        await refreshAccounts();
        return true;
      } catch (err) {
        const apiErr = err as ApiError;
        toast('error', 'Could not open account', apiErr.message);
        return false;
      }
    },
    [userId, refreshAccounts, toast, notify]
  );

  const closeAccount = useCallback(
    async (accountNumber: string): Promise<boolean> => {
      try {
        await accountService.closeAccount(accountNumber);
        toast('success', 'Account closed', `Account ${accountNumber} has been closed.`);
        notify({ type: 'account', title: 'Account closed', message: `Account ${accountNumber} was closed.` });
        await refreshAccounts();
        return true;
      } catch (err) {
        const apiErr = err as ApiError;
        toast('error', 'Could not close account', apiErr.message);
        return false;
      }
    },
    [refreshAccounts, toast, notify]
  );

  return {
    accounts,
    primaryAccount,
    isLoading,
    loaded,
    error,
    refreshAccounts,
    /** Kept for existing callers; same as refreshAccounts. */
    fetchAccounts: refreshAccounts,
    selectAccount,
    openAccount,
    closeAccount,
  };
}
