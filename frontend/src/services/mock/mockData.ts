/**
 * mock/mockData.ts
 *
 * Realistic, internally consistent mock data.
 * Mock account balances are consistent with transaction history totals.
 */

import type { UserDto, AccountDto, TransactionRecord, FundTransferDto } from '@/types';

// ---- Mock User ----
export const MOCK_USER: UserDto = {
  userId: 1,
  emailId: 'demo@finexus.com',
  identificationNumber: 'ID-7A2F9E4B',
  authId: 'auth-001',
  status: 'ACTIVE',
  userProfileDto: {
    firstName: 'Alexandra',
    lastName: 'Chen',
    gender: 'Female',
    address: '88 Marina Bay, Singapore 018989',
    occupation: 'Software Engineer',
    martialStatus: 'Single',
    nationality: 'Singaporean',
  },
};

// ---- Mock Accounts ----
export const MOCK_ACCOUNTS: AccountDto[] = [
  {
    accountId: 101,
    accountNumber: 'FX0019284756',
    accountType: 'SAVINGS',
    accountStatus: 'ACTIVE',
    availableBalance: 128450.75,
    userId: 1,
  },
  {
    accountId: 102,
    accountNumber: 'FX0019284757',
    accountType: 'CURRENT',
    accountStatus: 'ACTIVE',
    availableBalance: 34250.00,
    userId: 1,
  },
];

// ---- Mock Transactions ----
const now = new Date();

function daysAgo(d: number) {
  const dt = new Date(now);
  dt.setDate(dt.getDate() - d);
  return dt.toISOString();
}

export const MOCK_TRANSACTIONS: TransactionRecord[] = [
  {
    referenceId: 'REF-20240101',
    accountId: 'FX0019284756',
    transactionType: 'DEPOSIT',
    amount: 15000.00,
    localDateTime: daysAgo(1),
    transactionStatus: 'COMPLETED',
    comments: 'Salary credit',
  },
  {
    referenceId: 'REF-20240102',
    accountId: 'FX0019284756',
    transactionType: 'WITHDRAWAL',
    amount: 2500.00,
    localDateTime: daysAgo(2),
    transactionStatus: 'COMPLETED',
    comments: 'ATM withdrawal',
  },
  {
    referenceId: 'REF-20240103',
    accountId: 'FX0019284756',
    transactionType: 'TRANSFER_OUT',
    amount: 3000.00,
    localDateTime: daysAgo(3),
    transactionStatus: 'COMPLETED',
    comments: 'Rent payment',
  },
  {
    referenceId: 'REF-20240104',
    accountId: 'FX0019284756',
    transactionType: 'DEPOSIT',
    amount: 500.00,
    localDateTime: daysAgo(4),
    transactionStatus: 'COMPLETED',
    comments: 'Interest earned',
  },
  {
    referenceId: 'REF-20240105',
    accountId: 'FX0019284756',
    transactionType: 'WITHDRAWAL',
    amount: 800.00,
    localDateTime: daysAgo(5),
    transactionStatus: 'COMPLETED',
    comments: 'Grocery shopping',
  },
  {
    referenceId: 'REF-20240106',
    accountId: 'FX0019284756',
    transactionType: 'TRANSFER_IN',
    amount: 1200.00,
    localDateTime: daysAgo(6),
    transactionStatus: 'COMPLETED',
    comments: 'Freelance payment received',
  },
  {
    referenceId: 'REF-20240107',
    accountId: 'FX0019284756',
    transactionType: 'WITHDRAWAL',
    amount: 350.00,
    localDateTime: daysAgo(8),
    transactionStatus: 'COMPLETED',
    comments: 'Utilities bill',
  },
  {
    referenceId: 'REF-20240108',
    accountId: 'FX0019284756',
    transactionType: 'DEPOSIT',
    amount: 8000.00,
    localDateTime: daysAgo(12),
    transactionStatus: 'COMPLETED',
    comments: 'Bonus credit',
  },
  {
    referenceId: 'REF-20240109',
    accountId: 'FX0019284756',
    transactionType: 'TRANSFER_OUT',
    amount: 1500.00,
    localDateTime: daysAgo(15),
    transactionStatus: 'COMPLETED',
    comments: 'Investment transfer',
  },
  {
    referenceId: 'REF-20240110',
    accountId: 'FX0019284757',
    transactionType: 'DEPOSIT',
    amount: 34250.00,
    localDateTime: daysAgo(30),
    transactionStatus: 'COMPLETED',
    comments: 'Initial deposit',
  },
];

// ---- Mock Fund Transfers ----
export const MOCK_TRANSFERS: FundTransferDto[] = [
  {
    transactionReference: 'TRF-20240103',
    fromAccount: 'FX0019284756',
    toAccount: 'FX0019284758',
    amount: 3000.00,
    status: 'COMPLETED',
    transferType: 'INTERNAL',
    transferredOn: daysAgo(3),
  },
  {
    transactionReference: 'TRF-20240109',
    fromAccount: 'FX0019284756',
    toAccount: 'FX0019284757',
    amount: 1500.00,
    status: 'COMPLETED',
    transferType: 'INTERNAL',
    transferredOn: daysAgo(15),
  },
];

// ---- Monthly cashflow for charts (last 6 months) ----
export const MOCK_CASHFLOW = [
  { month: 'Feb', income: 16500, outcome: 5800 },
  { month: 'Mar', income: 15000, outcome: 7200 },
  { month: 'Apr', income: 18000, outcome: 6100 },
  { month: 'May', income: 15000, outcome: 8900 },
  { month: 'Jun', income: 23000, outcome: 5600 },
  { month: 'Jul', income: 24700, outcome: 7150 },
];

export const MOCK_DISTRIBUTION = [
  { name: 'Deposits', value: 40, color: 'var(--positive)' },
  { name: 'Withdrawals', value: 35, color: 'var(--negative)' },
  { name: 'Transfers', value: 25, color: 'var(--accent-primary)' },
];
