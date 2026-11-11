import { ChevronDown, Wallet } from 'lucide-react';
import { useAccounts } from '@/hooks/useAccounts';
import { capitalize, formatCurrency, maskAccountNumber } from '@/utils';

/**
 * Picks which of the user's accounts the page works with. The choice is shared
 * across pages and remembered across reloads. Renders nothing for a single account.
 */
export function AccountSwitcher({ className = '' }: { className?: string }) {
  const { accounts, primaryAccount, selectAccount } = useAccounts();

  if (accounts.length < 2) return null;

  return (
    <label className={`relative inline-flex items-center ${className}`}>
      <span className="sr-only">Choose account</span>
      <Wallet
        size={14}
        className="absolute left-3 text-[var(--accent-primary)] dark:text-[var(--accent-secondary)] pointer-events-none"
      />
      <select
        id="account-switcher"
        value={primaryAccount?.accountNumber ?? ''}
        onChange={(e) => selectAccount(e.target.value)}
        className="h-10 max-w-full appearance-none rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] pl-8 pr-8 text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
      >
        {accounts.map((a) => (
          <option key={a.accountNumber} value={a.accountNumber}>
            {capitalize(a.accountType)} {maskAccountNumber(a.accountNumber).slice(-4)} · {formatCurrency(a.availableBalance)}
            {a.accountStatus !== 'ACTIVE' ? ` (${capitalize(a.accountStatus ?? '')})` : ''}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-3 text-[var(--text-secondary)] pointer-events-none" />
    </label>
  );
}
