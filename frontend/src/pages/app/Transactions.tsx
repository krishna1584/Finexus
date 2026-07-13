import { useEffect, useState, useMemo } from 'react';
import { Download, Search, Filter, ChevronDown, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useAccounts } from '@/hooks/useAccounts';
import { useTransactions } from '@/hooks/useTransactions';
import { useUIStore } from '@/store/useUIStore';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TxTypeBadge, StatusBadge } from '@/components/ui/Badge';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { Drawer } from '@/components/ui/Drawer';
import { formatCurrency, formatDate, formatDateTime, isCredit, exportToCSV, truncate } from '@/utils';
import type { TransactionRecord } from '@/types';

const TX_TYPES = ['All', 'DEPOSIT', 'WITHDRAWAL', 'TRANSFER_IN', 'TRANSFER_OUT'];
const TX_STATUSES = ['All', 'COMPLETED', 'PENDING', 'FAILED'];

export default function TransactionsPage() {
  const toast = useUIStore((s) => s.toast);
  const { primaryAccount } = useAccounts();
  const { transactions, isLoading, fetchTransactions } = useTransactions();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

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

    list.sort((a, b) => {
      if (sortBy === 'amount') {
        return sortDir === 'desc' ? b.amount - a.amount : a.amount - b.amount;
      }
      const aDate = new Date(Array.isArray(a.localDateTime) ? `${a.localDateTime[0]}-${String(a.localDateTime[1]).padStart(2,'0')}-${String(a.localDateTime[2]).padStart(2,'0')}` : a.localDateTime as string).getTime();
      const bDate = new Date(Array.isArray(b.localDateTime) ? `${b.localDateTime[0]}-${String(b.localDateTime[1]).padStart(2,'0')}-${String(b.localDateTime[2]).padStart(2,'0')}` : b.localDateTime as string).getTime();
      return sortDir === 'desc' ? bDate - aDate : aDate - bDate;
    });

    return list;
  }, [transactions, search, typeFilter, statusFilter, sortBy, sortDir]);

  const handleExport = () => {
    if (!filtered.length) { toast('warning', 'No data', 'Nothing to export.'); return; }
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
    toast('success', 'Export ready', `${filtered.length} transactions exported.`);
  };

  const toggleSort = (col: 'date' | 'amount') => {
    if (sortBy === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortBy(col); setSortDir('desc'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Transactions</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            {filtered.length} of {transactions.length} transactions
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          icon={<Download size={14} />}
          onClick={handleExport}
          id="export-csv-btn"
        >
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card padding="md">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              id="tx-search"
              type="search"
              placeholder="Search by reference, description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
            />
          </div>

          {/* Type filter */}
          <div className="relative">
            <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" />
            <select
              id="tx-type-filter"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="appearance-none pl-8 pr-7 py-2.5 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
            >
              {TX_TYPES.map((t) => <option key={t} value={t} className="bg-[var(--bg-surface-2)]">{t === 'All' ? 'All Types' : t}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" />
          </div>

          {/* Status filter */}
          <div className="relative">
            <select
              id="tx-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none px-3 pr-7 py-2.5 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
            >
              {TX_STATUSES.map((s) => <option key={s} value={s} className="bg-[var(--bg-surface-2)]">{s === 'All' ? 'All Statuses' : s}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card padding="none">
        {isLoading ? (
          <div className="p-4"><SkeletonTable rows={8} /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[var(--text-secondary)]">No transactions match your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="text-left text-xs font-medium text-[var(--text-secondary)] px-4 py-3 uppercase tracking-wide">Reference</th>
                  <th className="text-left text-xs font-medium text-[var(--text-secondary)] px-4 py-3 uppercase tracking-wide">Type</th>
                  <th
                    className="text-right text-xs font-medium text-[var(--text-secondary)] px-4 py-3 uppercase tracking-wide cursor-pointer hover:text-[var(--accent-gold)] select-none"
                    onClick={() => toggleSort('amount')}
                  >
                    Amount {sortBy === 'amount' && (sortDir === 'desc' ? '↓' : '↑')}
                  </th>
                  <th className="text-left text-xs font-medium text-[var(--text-secondary)] px-4 py-3 uppercase tracking-wide">Description</th>
                  <th
                    className="text-left text-xs font-medium text-[var(--text-secondary)] px-4 py-3 uppercase tracking-wide cursor-pointer hover:text-[var(--accent-gold)] select-none"
                    onClick={() => toggleSort('date')}
                  >
                    Date {sortBy === 'date' && (sortDir === 'desc' ? '↓' : '↑')}
                  </th>
                  <th className="text-left text-xs font-medium text-[var(--text-secondary)] px-4 py-3 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx) => (
                  <tr
                    key={tx.referenceId}
                    onClick={() => setSelectedTx(tx)}
                    className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-surface-2)] cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-[var(--text-secondary)]">{tx.referenceId}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {isCredit(tx.transactionType)
                          ? <ArrowDownLeft size={13} className="text-[var(--positive)] flex-shrink-0" />
                          : <ArrowUpRight size={13} className="text-[var(--negative)] flex-shrink-0" />
                        }
                        <TxTypeBadge type={tx.transactionType} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-semibold tabular-nums text-sm ${isCredit(tx.transactionType) ? 'text-[var(--positive)]' : 'text-[var(--negative)]'}`}>
                        {isCredit(tx.transactionType) ? '+' : '-'}{formatCurrency(tx.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                      {truncate(tx.comments ?? '—', 30)}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                      {formatDate(tx.localDateTime)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={tx.transactionStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Transaction Detail Drawer */}
      <Drawer
        isOpen={!!selectedTx}
        onClose={() => setSelectedTx(null)}
        title="Transaction Details"
        id="transaction-detail-drawer"
        width="sm"
      >
        {selectedTx && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 ${
                isCredit(selectedTx.transactionType) ? 'bg-[var(--positive)]/15' : 'bg-[var(--negative)]/15'
              }`}>
                {isCredit(selectedTx.transactionType)
                  ? <ArrowDownLeft size={24} className="text-[var(--positive)]" />
                  : <ArrowUpRight size={24} className="text-[var(--negative)]" />
                }
              </div>
              <p className={`text-3xl font-bold tabular-nums ${isCredit(selectedTx.transactionType) ? 'text-[var(--positive)]' : 'text-[var(--negative)]'}`}>
                {isCredit(selectedTx.transactionType) ? '+' : '-'}{formatCurrency(selectedTx.amount)}
              </p>
              <TxTypeBadge type={selectedTx.transactionType} />
            </div>

            <div className="space-y-2">
              {[
                { label: 'Reference ID', value: selectedTx.referenceId, mono: true },
                { label: 'Account', value: selectedTx.accountId },
                { label: 'Status', value: <StatusBadge status={selectedTx.transactionStatus} /> },
                { label: 'Date & Time', value: formatDateTime(selectedTx.localDateTime) },
                { label: 'Description', value: selectedTx.comments ?? '—' },
              ].map(({ label, value, mono }) => (
                <div key={label} className="flex items-start justify-between py-2.5 border-b border-[var(--border-subtle)] last:border-0 gap-4">
                  <p className="text-xs text-[var(--text-secondary)] flex-shrink-0">{label}</p>
                  <div className={`text-xs font-medium text-right text-[var(--text-primary)] ${mono ? 'font-mono' : ''}`}>
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
