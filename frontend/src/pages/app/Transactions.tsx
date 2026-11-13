import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronDown,
  Download,
  Filter,
  Search,
} from 'lucide-react';
import { useAccounts } from '@/hooks/useAccounts';
import { useTransactions } from '@/hooks/useTransactions';
import { useUIStore } from '@/store/useUIStore';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge, TxTypeBadge } from '@/components/ui/Badge';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { Drawer } from '@/components/ui/Drawer';
import { AccountSwitcher } from '@/components/ui/AccountSwitcher';
import {
  absAmount,
  capitalize,
  dateValue,
  formatCurrency,
  formatDate,
  formatDateTime,
  isCredit,
  exportToCSV,
  transactionLabel,
  truncate,
  txCategory,
  TX_CATEGORY_LABELS,
  type TxCategory,
} from '@/utils';
import type { TransactionRecord } from '@/types';

// Filter by what the movement means to the user. Transfers are stored as
// INTERNAL_TRANSFER on the backend; the sign decides in vs out.
const TX_TYPES: ('All' | TxCategory)[] = ['All', 'DEPOSIT', 'WITHDRAWAL', 'TRANSFER_IN', 'TRANSFER_OUT'];
const TX_STATUSES = ['All', 'COMPLETED', 'PENDING', 'FAILED'];

const PAGE_SIZE = 8;

export default function TransactionsPage() {
  const toast = useUIStore((s) => s.toast);
  const { primaryAccount } = useAccounts();
  const { transactions, isLoading, fetchTransactions } = useTransactions();
  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') ?? '';

  const [search, setSearch] = useState(urlQuery);

  // A search from the navbar while already on this page updates the box.
  useEffect(() => {
    setSearch(urlQuery);
  }, [urlQuery]);
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [selectedTx, setSelectedTx] = useState<TransactionRecord | null>(null);

  useEffect(() => {
    if (primaryAccount?.accountNumber) {
      fetchTransactions(primaryAccount.accountNumber);
    }
  }, [primaryAccount?.accountNumber]); // eslint-disable-line

  const filtered = useMemo(() => {
    let list = [...transactions];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.referenceId.toLowerCase().includes(q) ||
          (t.comments ?? '').toLowerCase().includes(q) ||
          transactionLabel(t.transactionType, t.amount).toLowerCase().includes(q) ||
          String(absAmount(t.amount)).includes(q)
      );
    }

    if (typeFilter !== 'All') list = list.filter((t) => txCategory(t.transactionType, t.amount) === typeFilter);
    if (statusFilter !== 'All') list = list.filter((t) => t.transactionStatus === statusFilter);

    if (dateFrom || dateTo) {
      list = list.filter((tx) => {
        const d = normalizeDate(tx.localDateTime);
        if (!d) return false;
        const fromOk = dateFrom ? d >= new Date(`${dateFrom}T00:00:00`) : true;
        const toOk = dateTo ? d <= new Date(`${dateTo}T23:59:59`) : true;
        return fromOk && toOk;
      });
    }

    list.sort((a, b) => {
      // Sort by size of the amount (debits are stored as negatives).
      if (sortBy === 'amount') {
        const diff = absAmount(a.amount) - absAmount(b.amount);
        return sortDir === 'desc' ? -diff : diff;
      }
      const diff = dateValue(a.localDateTime) - dateValue(b.localDateTime);
      return sortDir === 'desc' ? -diff : diff;
    });

    return list;
  }, [transactions, search, typeFilter, statusFilter, sortBy, sortDir, dateFrom, dateTo]);

  useEffect(() => {
    setPage(1);
  }, [search, typeFilter, statusFilter, sortBy, sortDir, dateFrom, dateTo]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleExport = () => {
    if (!filtered.length) {
      toast('warning', 'No data', 'Nothing to export.');
      return;
    }
    exportToCSV(
      filtered.map((t) => ({
        Reference: t.referenceId,
        Type: transactionLabel(t.transactionType, t.amount),
        Amount: (isCredit(t.transactionType, t.amount) ? 1 : -1) * absAmount(t.amount),
        Status: t.transactionStatus,
        Date: formatDateTime(t.localDateTime),
        Description: t.comments ?? '',
      })),
      `finexus-transactions-${new Date().toISOString().slice(0, 10)}.csv`
    );
    toast('success', 'Export complete', `${filtered.length} rows exported.`);
  };

  const toggleSort = (col: 'date' | 'amount') => {
    if (sortBy === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortBy(col);
      setSortDir('desc');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-3xl font-bold">Transactions</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">{filtered.length} filtered • {transactions.length} total</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AccountSwitcher />
          <Button variant="secondary" size="sm" icon={<Download size={14} />} onClick={handleExport} id="export-csv-btn">
            Export
          </Button>
        </div>
      </div>

      <Card padding="md">
        <CardHeader title="Filters" />
        {/* 2 columns on phones and tablets, one row of 12 on wide screens */}
        <div className="grid grid-cols-2 lg:grid-cols-12 gap-3">
          <div className="col-span-2 lg:col-span-4">
            <label htmlFor="tx-search" className="block text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)] mb-1.5">Search</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" />
              <input
                id="tx-search"
                type="search"
                placeholder="Reference, note or amount"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 w-full rounded-xl bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] text-base sm:text-sm focus:outline-none focus:border-[var(--accent-primary)] pl-9 pr-3"
              />
            </div>
          </div>

          <div className="col-span-1 lg:col-span-2">
            <label htmlFor="tx-type" className="block text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)] mb-1.5">Type</label>
            <div className="relative">
              <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" />
              <select
                id="tx-type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-11 w-full rounded-xl bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] text-base sm:text-sm focus:outline-none focus:border-[var(--accent-primary)] appearance-none pl-8 pr-8"
              >
                {TX_TYPES.map((t) => <option key={t} value={t}>{t === 'All' ? 'All types' : TX_CATEGORY_LABELS[t]}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" />
            </div>
          </div>

          <div className="col-span-1 lg:col-span-2">
            <label htmlFor="tx-status" className="block text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)] mb-1.5">Status</label>
            <div className="relative">
              <select
                id="tx-status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-11 w-full rounded-xl bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] text-base sm:text-sm focus:outline-none focus:border-[var(--accent-primary)] appearance-none px-3 pr-8"
              >
                {TX_STATUSES.map((s) => <option key={s} value={s}>{s === 'All' ? 'All statuses' : capitalize(s)}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" />
            </div>
          </div>

          <div className="col-span-1 lg:col-span-2">
            <label htmlFor="tx-from" className="block text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)] mb-1.5">From</label>
            <input
              id="tx-from"
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-11 w-full rounded-xl bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] text-base sm:text-sm focus:outline-none focus:border-[var(--accent-primary)] px-2 sm:px-3"
            />
          </div>

          <div className="col-span-1 lg:col-span-2">
            <label htmlFor="tx-to" className="block text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)] mb-1.5">To</label>
            <input
              id="tx-to"
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-11 w-full rounded-xl bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] text-base sm:text-sm focus:outline-none focus:border-[var(--accent-primary)] px-2 sm:px-3"
            />
          </div>
        </div>
      </Card>

      <Card padding="none">
        {isLoading ? (
          <div className="p-4"><SkeletonTable rows={8} /></div>
        ) : pageData.length === 0 ? (
          <div className="py-16 px-4 text-center text-[var(--text-secondary)]">No transactions match your criteria.</div>
        ) : (
          <>
            {/* Phones and tablets: one tappable card per transaction */}
            <ul className="lg:hidden divide-y divide-[var(--border-subtle)]">
              {pageData.map((tx, i) => {
                const credit = isCredit(tx.transactionType, tx.amount);
                return (
                  <li key={`${tx.referenceId}-${tx.accountId}-${i}`}>
                    <button
                      type="button"
                      onClick={() => setSelectedTx(tx)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[var(--bg-surface-2)] focus-visible:outline-none focus-visible:bg-[var(--bg-surface-2)]"
                    >
                      <span className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center ${credit ? 'bg-[var(--positive)]/15' : 'bg-[var(--negative)]/15'}`}>
                        {credit
                          ? <ArrowDownLeft size={15} className="text-[var(--positive)]" />
                          : <ArrowUpRight size={15} className="text-[var(--negative)]" />}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-medium truncate">{tx.comments || transactionLabel(tx.transactionType, tx.amount)}</span>
                        <span className="block text-xs text-[var(--text-secondary)] mt-0.5">
                          {transactionLabel(tx.transactionType, tx.amount)} · {formatDate(tx.localDateTime)}
                        </span>
                      </span>
                      <span className="text-right shrink-0">
                        <span className={`block text-sm font-semibold tabular-nums ${credit ? 'text-[var(--positive)]' : 'text-[var(--negative)]'}`}>
                          {credit ? '+' : '-'}{formatCurrency(absAmount(tx.amount))}
                        </span>
                        {tx.transactionStatus !== 'COMPLETED' && (
                          <span className="block mt-1"><StatusBadge status={tx.transactionStatus} /></span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Wide screens: full table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <caption className="sr-only">Transactions. Select a row to see details.</caption>
                <thead>
                  <tr className="border-b border-[var(--border-subtle)]">
                    <th scope="col" className="text-left px-4 py-3 text-xs uppercase tracking-wide text-[var(--text-secondary)]">Reference</th>
                    <th scope="col" className="text-left px-4 py-3 text-xs uppercase tracking-wide text-[var(--text-secondary)]">Type</th>
                    <th scope="col" aria-sort={sortBy === 'amount' ? (sortDir === 'desc' ? 'descending' : 'ascending') : 'none'} className="text-right px-4 py-3 text-xs uppercase tracking-wide text-[var(--text-secondary)]">
                      <button type="button" onClick={() => toggleSort('amount')} className="uppercase tracking-wide hover:text-[var(--text-primary)]">
                        Amount {sortBy === 'amount' ? (sortDir === 'desc' ? '↓' : '↑') : ''}
                      </button>
                    </th>
                    <th scope="col" className="text-left px-4 py-3 text-xs uppercase tracking-wide text-[var(--text-secondary)]">Description</th>
                    <th scope="col" aria-sort={sortBy === 'date' ? (sortDir === 'desc' ? 'descending' : 'ascending') : 'none'} className="text-left px-4 py-3 text-xs uppercase tracking-wide text-[var(--text-secondary)]">
                      <button type="button" onClick={() => toggleSort('date')} className="uppercase tracking-wide hover:text-[var(--text-primary)]">
                        Date {sortBy === 'date' ? (sortDir === 'desc' ? '↓' : '↑') : ''}
                      </button>
                    </th>
                    <th scope="col" className="text-left px-4 py-3 text-xs uppercase tracking-wide text-[var(--text-secondary)]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pageData.map((tx, i) => {
                    const credit = isCredit(tx.transactionType, tx.amount);
                    return (
                      <tr
                        key={`${tx.referenceId}-${tx.accountId}-${i}`}
                        onClick={() => setSelectedTx(tx)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedTx(tx);
                          }
                        }}
                        tabIndex={0}
                        aria-label={`${transactionLabel(tx.transactionType, tx.amount)} of ${formatCurrency(absAmount(tx.amount))} on ${formatDate(tx.localDateTime)}. Open details`}
                        className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-surface-2)] focus-visible:outline-none focus-visible:bg-[var(--bg-surface-2)] transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-3 font-mono text-xs text-[var(--text-secondary)] max-w-[160px] truncate">{tx.referenceId}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {credit
                              ? <ArrowDownLeft size={14} className="text-[var(--positive)]" />
                              : <ArrowUpRight size={14} className="text-[var(--negative)]" />}
                            <TxTypeBadge type={tx.transactionType} amount={tx.amount} />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <span className={`font-semibold tabular-nums ${credit ? 'text-[var(--positive)]' : 'text-[var(--negative)]'}`}>
                            {credit ? '+' : '-'}{formatCurrency(absAmount(tx.amount))}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{truncate(tx.comments ?? '—', 42)}</td>
                        <td className="px-4 py-3 text-sm text-[var(--text-secondary)] whitespace-nowrap">{formatDate(tx.localDateTime)}</td>
                        <td className="px-4 py-3"><StatusBadge status={tx.transactionStatus} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>

      {pageCount > 1 && (
        <nav className="flex items-center justify-between gap-3" aria-label="Pagination">
          <p className="text-sm text-[var(--text-secondary)]">Page {page} of {pageCount}</p>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
            <Button variant="secondary" size="sm" onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={page === pageCount}>Next</Button>
          </div>
        </nav>
      )}

      <Drawer isOpen={!!selectedTx} onClose={() => setSelectedTx(null)} title="Transaction Detail" width="sm" id="transaction-detail-drawer">
        {selectedTx && (
          <div className="space-y-4">
            <div className="text-center">
              <p className={`text-3xl font-display font-bold tabular-nums ${isCredit(selectedTx.transactionType, selectedTx.amount) ? 'text-[var(--positive)]' : 'text-[var(--negative)]'}`}>
                {isCredit(selectedTx.transactionType, selectedTx.amount) ? '+' : '-'}{formatCurrency(absAmount(selectedTx.amount))}
              </p>
              <div className="mt-2 inline-flex"><TxTypeBadge type={selectedTx.transactionType} amount={selectedTx.amount} /></div>
            </div>
            <div className="space-y-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-2)] p-4">
              {[
                ['Reference ID', selectedTx.referenceId],
                ['Account', selectedTx.accountId],
                ['Date & Time', formatDateTime(selectedTx.localDateTime)],
                ['Description', selectedTx.comments ?? '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex items-start justify-between gap-4 text-sm">
                  <span className="text-[var(--text-secondary)]">{k}</span>
                  <span className="text-right text-[var(--text-primary)]">{v}</span>
                </div>
              ))}
              <div className="flex items-start justify-between gap-4 text-sm">
                <span className="text-[var(--text-secondary)]">Status</span>
                <StatusBadge status={selectedTx.transactionStatus} />
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </motion.div>
  );
}

function normalizeDate(value: string | number[]) {
  if (Array.isArray(value)) {
    const [y, m, d, hh = 0, mm = 0, ss = 0] = value;
    return new Date(y, m - 1, d, hh, mm, ss);
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}