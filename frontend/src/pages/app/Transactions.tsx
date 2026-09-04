import { useEffect, useMemo, useState } from 'react';
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
import { formatCurrency, formatDate, formatDateTime, isCredit, exportToCSV, truncate } from '@/utils';
import type { TransactionRecord } from '@/types';

const TX_TYPES = ['All', 'DEPOSIT', 'WITHDRAWAL', 'TRANSFER_IN', 'TRANSFER_OUT'];
const TX_STATUSES = ['All', 'COMPLETED', 'PENDING', 'FAILED'];

const PAGE_SIZE = 8;

export default function TransactionsPage() {
  const toast = useUIStore((s) => s.toast);
  const { primaryAccount } = useAccounts();
  const { transactions, isLoading, fetchTransactions } = useTransactions();

  const [search, setSearch] = useState('');
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
          t.transactionType.toLowerCase().includes(q)
      );
    }

    if (typeFilter !== 'All') list = list.filter((t) => t.transactionType === typeFilter);
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
      if (sortBy === 'amount') {
        return sortDir === 'desc' ? b.amount - a.amount : a.amount - b.amount;
      }
      const aDate = normalizeDate(a.localDateTime)?.getTime() ?? 0;
      const bDate = normalizeDate(b.localDateTime)?.getTime() ?? 0;
      return sortDir === 'desc' ? bDate - aDate : aDate - bDate;
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
        Type: t.transactionType,
        Amount: t.amount,
        Status: t.transactionStatus,
        Date: formatDate(t.localDateTime),
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl font-bold">Transactions</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">{filtered.length} filtered • {transactions.length} total</p>
        </div>
        <Button variant="secondary" size="sm" icon={<Download size={14} />} onClick={handleExport} id="export-csv-btn">
          Export
        </Button>
      </div>

      <Card padding="md">
        <CardHeader title="Filters" />
        <div className="grid md:grid-cols-12 gap-3">
          <div className="relative md:col-span-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              id="tx-search"
              type="search"
              placeholder="Search by reference or note"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 w-full rounded-xl bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] pl-9 pr-3 text-sm focus:outline-none focus:border-[var(--accent-primary)]"
            />
          </div>

          <div className="relative md:col-span-2">
            <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-11 w-full appearance-none rounded-xl bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] pl-8 pr-8 text-sm focus:outline-none focus:border-[var(--accent-primary)]"
            >
              {TX_TYPES.map((t) => <option key={t} value={t}>{t === 'All' ? 'All types' : t}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" />
          </div>

          <div className="relative md:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 w-full appearance-none rounded-xl bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] px-3 pr-8 text-sm focus:outline-none focus:border-[var(--accent-primary)]"
            >
              {TX_STATUSES.map((s) => <option key={s} value={s}>{s === 'All' ? 'All status' : s}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" />
          </div>

          <div className="md:col-span-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              aria-label="From date"
              className="h-11 w-full rounded-xl bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] px-3 text-sm focus:outline-none focus:border-[var(--accent-primary)]"
            />
          </div>

          <div className="md:col-span-2">
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              aria-label="To date"
              className="h-11 w-full rounded-xl bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] px-3 text-sm focus:outline-none focus:border-[var(--accent-primary)]"
            />
          </div>
        </div>
      </Card>

      <Card padding="none">
        {isLoading ? (
          <div className="p-4"><SkeletonTable rows={8} /></div>
        ) : pageData.length === 0 ? (
          <div className="py-16 text-center text-[var(--text-secondary)]">No transactions match your criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px]">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-[var(--text-secondary)]">Reference</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-[var(--text-secondary)]">Category</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-[var(--text-secondary)]">Type</th>
                  <th className="text-right px-4 py-3 text-xs uppercase tracking-wide text-[var(--text-secondary)] cursor-pointer" onClick={() => toggleSort('amount')}>
                    Amount {sortBy === 'amount' ? (sortDir === 'desc' ? '↓' : '↑') : ''}
                  </th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-[var(--text-secondary)]">Description</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-[var(--text-secondary)] cursor-pointer" onClick={() => toggleSort('date')}>
                    Date {sortBy === 'date' ? (sortDir === 'desc' ? '↓' : '↑') : ''}
                  </th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-[var(--text-secondary)]">Status</th>
                </tr>
              </thead>
              <tbody>
                {pageData.map((tx) => (
                  <tr
                    key={tx.referenceId}
                    onClick={() => setSelectedTx(tx)}
                    className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-surface-2)] transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-[var(--text-secondary)]">{tx.referenceId}</td>
                    <td className="px-4 py-3">
                      <div className="inline-flex items-center gap-2 rounded-lg bg-[var(--bg-surface-2)] px-2.5 py-1 border border-[var(--border-subtle)]">
                        <span className={`w-1.5 h-1.5 rounded-full ${isCredit(tx.transactionType) ? 'bg-[var(--positive)]' : 'bg-[var(--negative)]'}`} />
                        <span className="text-xs text-[var(--text-secondary)]">{isCredit(tx.transactionType) ? 'Income' : 'Expense'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {isCredit(tx.transactionType)
                          ? <ArrowDownLeft size={14} className="text-[var(--positive)]" />
                          : <ArrowUpRight size={14} className="text-[var(--negative)]" />}
                        <TxTypeBadge type={tx.transactionType} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-semibold tabular-nums ${isCredit(tx.transactionType) ? 'text-[var(--positive)]' : 'text-[var(--negative)]'}`}>
                        {isCredit(tx.transactionType) ? '+' : '-'}{formatCurrency(tx.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{truncate(tx.comments ?? '—', 42)}</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{formatDate(tx.localDateTime)}</td>
                    <td className="px-4 py-3"><StatusBadge status={tx.transactionStatus} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-secondary)]">Page {page} of {pageCount}</p>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
          <Button variant="secondary" size="sm" onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={page === pageCount}>Next</Button>
        </div>
      </div>

      <Drawer isOpen={!!selectedTx} onClose={() => setSelectedTx(null)} title="Transaction Detail" width="sm" id="transaction-detail-drawer">
        {selectedTx && (
          <div className="space-y-4">
            <div className="text-center">
              <p className={`text-3xl font-display font-bold tabular-nums ${isCredit(selectedTx.transactionType) ? 'text-[var(--positive)]' : 'text-[var(--negative)]'}`}>
                {isCredit(selectedTx.transactionType) ? '+' : '-'}{formatCurrency(selectedTx.amount)}
              </p>
              <div className="mt-2 inline-flex"><TxTypeBadge type={selectedTx.transactionType} /></div>
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