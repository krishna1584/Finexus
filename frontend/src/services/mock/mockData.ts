/**
 * mock/mockData.ts
 *
 * In-memory stand-in for the backend, used when VITE_USE_MOCK_DATA=true.
 * Data uses the same shapes the real services return (withdrawals and
 * outgoing transfers are negative, transfers are INTERNAL_TRANSFER on both
 * legs), and the mock operations below change balances and history the same
 * way the backend does, so demo mode behaves like the real app.
 */

import type { UserDto, AccountDto, TransactionRecord, FundTransferDto } from '@/types';

// ---- Mock User ----
export const MOCK_USER: UserDto = {
  userId: 1,
  emailId: 'demo@finexus.com',
  contactNo: '+91 98765 43210',
  identificationNumber: 'FIN1',
  authId: 'auth-001',
  status: 'ACTIVE',
  userProfileDto: {
    firstName: 'Alexandra',
    lastName: 'Chen',
    gender: 'Female',
    address: 'Bandra West, Mumbai',
    occupation: 'Software Engineer',
    martialStatus: 'Single',
    nationality: 'Indian',
  },
};

export let MOCK_PASSWORD = 'password123';
export function setMockPassword(next: string) {
  MOCK_PASSWORD = next;
}

// ---- Mock Accounts ----
// Balances equal the sum of each account's transactions below.
export const MOCK_ACCOUNTS: AccountDto[] = [
  {
    accountId: 101,
    accountNumber: 'ACC0000001',
    accountType: 'SAVINGS',
    accountStatus: 'ACTIVE',
    availableBalance: 26050,
    userId: 1,
  },
  {
    accountId: 102,
    accountNumber: 'ACC0000002',
    accountType: 'CURRENT',
    accountStatus: 'ACTIVE',
    availableBalance: 11500,
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
  { referenceId: 'REF-0001', accountId: 'ACC0000002', transactionType: 'DEPOSIT', amount: 10000, localDateTime: daysAgo(30), transactionStatus: 'COMPLETED', comments: 'Initial deposit' },
  { referenceId: 'REF-0002', accountId: 'ACC0000001', transactionType: 'DEPOSIT', amount: 8000, localDateTime: daysAgo(12), transactionStatus: 'COMPLETED', comments: 'Bonus credit' },
  { referenceId: 'TRF-0001', accountId: 'ACC0000001', transactionType: 'INTERNAL_TRANSFER', amount: -1500, localDateTime: daysAgo(10), transactionStatus: 'COMPLETED', comments: 'Transfer to ACC0000002 · Savings top-up' },
  { referenceId: 'TRF-0001', accountId: 'ACC0000002', transactionType: 'INTERNAL_TRANSFER', amount: 1500, localDateTime: daysAgo(10), transactionStatus: 'COMPLETED', comments: 'Transfer from ACC0000001 · Savings top-up' },
  { referenceId: 'REF-0003', accountId: 'ACC0000001', transactionType: 'WITHDRAWAL', amount: -350, localDateTime: daysAgo(8), transactionStatus: 'COMPLETED', comments: 'Utilities bill' },
  { referenceId: 'REF-0004', accountId: 'ACC0000001', transactionType: 'DEPOSIT', amount: 1200, localDateTime: daysAgo(6), transactionStatus: 'COMPLETED', comments: 'Freelance payment' },
  { referenceId: 'REF-0005', accountId: 'ACC0000001', transactionType: 'WITHDRAWAL', amount: -800, localDateTime: daysAgo(5), transactionStatus: 'COMPLETED', comments: 'Grocery shopping' },
  { referenceId: 'REF-0006', accountId: 'ACC0000001', transactionType: 'DEPOSIT', amount: 500, localDateTime: daysAgo(4), transactionStatus: 'COMPLETED', comments: 'Interest earned' },
  { referenceId: 'REF-0007', accountId: 'ACC0000001', transactionType: 'WITHDRAWAL', amount: -2500, localDateTime: daysAgo(2), transactionStatus: 'COMPLETED', comments: 'ATM withdrawal' },
  { referenceId: 'REF-0008', accountId: 'ACC0000001', transactionType: 'DEPOSIT', amount: 21500, localDateTime: daysAgo(1), transactionStatus: 'COMPLETED', comments: 'Salary credit' },
];

// ---- Mock Fund Transfers ----
export const MOCK_TRANSFERS: FundTransferDto[] = [
  {
    transactionReference: 'TRF-0001',
    fromAccount: 'ACC0000001',
    toAccount: 'ACC0000002',
    amount: 1500,
    status: 'SUCCESS',
    transferType: 'INTERNAL',
    transferredOn: daysAgo(10),
  },
];

// ---- Mock operations (mirror the backend rules) ----

function fail(status: number, message: string): never {
  throw { status, message };
}

function findAccount(accountNumber: string): AccountDto {
  return MOCK_ACCOUNTS.find((a) => a.accountNumber === accountNumber) ?? fail(404, `Account ${accountNumber} not found`);
}

function applyDelta(accountNumber: string, delta: number) {
  const account = findAccount(accountNumber);
  if (account.accountStatus !== 'ACTIVE') fail(400, `Account ${accountNumber} is not active`);
  if (account.availableBalance + delta < 0) fail(400, 'Insufficient balance in the account');
  account.availableBalance = Math.round((account.availableBalance + delta) * 100) / 100;
}

function ref(prefix: string) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

export function mockDepositOrWithdraw(accountNumber: string, type: string, amount: number, description: string) {
  if (!(amount > 0)) fail(400, 'Amount must be greater than zero');
  if (type !== 'DEPOSIT' && type !== 'WITHDRAWAL') fail(400, 'Transaction type must be DEPOSIT or WITHDRAWAL');
  const delta = type === 'DEPOSIT' ? amount : -amount;
  applyDelta(accountNumber, delta);
  MOCK_TRANSACTIONS.push({
    referenceId: ref('REF'),
    accountId: accountNumber,
    transactionType: type,
    amount: delta,
    localDateTime: new Date().toISOString(),
    transactionStatus: 'COMPLETED',
    comments: description,
  });
}

export function mockTransfer(fromAccount: string, toInput: string, amount: number, description = ''): string {
  if (!(amount > 0)) fail(400, 'Transfer amount must be greater than zero');
  const to = toInput.toUpperCase().startsWith('FIN')
    ? (toInput.toUpperCase() === MOCK_USER.identificationNumber ? MOCK_ACCOUNTS[0] : fail(404, `User with unique ID ${toInput} not found`))
    : findAccount(toInput);
  if (to.accountNumber === fromAccount) fail(400, 'You cannot transfer to the same account');
  applyDelta(fromAccount, -amount);
  try {
    applyDelta(to.accountNumber!, amount);
  } catch (e) {
    applyDelta(fromAccount, amount); // roll back the debit, like the backend transaction does
    throw e;
  }
  const reference = ref('TRF');
  const when = new Date().toISOString();
  const note = description.trim() ? ` · ${description.trim()}` : '';
  MOCK_TRANSACTIONS.push(
    { referenceId: reference, accountId: fromAccount, transactionType: 'INTERNAL_TRANSFER', amount: -amount, localDateTime: when, transactionStatus: 'COMPLETED', comments: `Transfer to ${to.accountNumber}${note}` },
    { referenceId: reference, accountId: to.accountNumber!, transactionType: 'INTERNAL_TRANSFER', amount, localDateTime: when, transactionStatus: 'COMPLETED', comments: `Transfer from ${fromAccount}${note}` }
  );
  MOCK_TRANSFERS.push({ transactionReference: reference, fromAccount, toAccount: to.accountNumber!, amount, status: 'SUCCESS', transferType: 'INTERNAL', transferredOn: when });
  return reference;
}

export function mockCreateAccount(userId: number, accountType: string): string {
  if (MOCK_ACCOUNTS.some((a) => a.userId === userId && a.accountType === accountType)) {
    fail(400, 'Account already exists on the server');
  }
  const accountNumber = 'ACC' + String(MOCK_ACCOUNTS.length + 1).padStart(7, '0');
  MOCK_ACCOUNTS.push({
    accountId: 100 + MOCK_ACCOUNTS.length + 1,
    accountNumber,
    accountType,
    accountStatus: 'ACTIVE',
    availableBalance: 0,
    userId,
  });
  return accountNumber;
}

export function mockCloseAccount(accountNumber: string) {
  const account = findAccount(accountNumber);
  if (account.availableBalance !== 0) fail(400, 'Balance must be zero to close the account');
  account.accountStatus = 'CLOSED';
}
