/**
 * accountService.ts
 *
 * Routes (via gateway at /accounts/**):
 *  POST /accounts                           → BackendResponse (create account)
 *  GET  /accounts?accountNumber={n}         → AccountDto
 *  GET  /accounts/{userId}                  → AccountDto  (single account for user)
 *  GET  /accounts/balance?accountNumber={n} → string (raw balance)
 *  PUT  /accounts/closure?accountNumber={n} → BackendResponse
 *  PATCH /accounts?accountNumber={n}        → BackendResponse (status update)
 *
 * NOTE: The backend returns a SINGLE AccountDto per userId (not a list).
 * To show multiple accounts on the UI we fetch the primary account by userId.
 */

import apiClient from './apiClient';
import type { AccountDto, BackendResponse } from '@/types';
import { MOCK_ACCOUNTS, mockCloseAccount, mockCreateAccount } from './mock/mockData';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true';

async function getAccountByUserId(userId: number): Promise<AccountDto> {
  if (USE_MOCK) {
    await delay(600);
    return MOCK_ACCOUNTS[0];
  }
  const response = await apiClient.get<AccountDto>(`/accounts/${userId}`);
  return response.data;
}

async function getAllAccountsByUserId(userId: number): Promise<AccountDto[]> {
  if (USE_MOCK) {
    await delay(600);
    return MOCK_ACCOUNTS.filter((a) => a.userId === userId).map((a) => ({ ...a }));
  }
  const response = await apiClient.get<AccountDto[]>(`/accounts/user/${userId}`);
  return response.data;
}

async function getAccountByNumber(accountNumber: string): Promise<AccountDto> {
  if (USE_MOCK) {
    await delay(400);
    const found = MOCK_ACCOUNTS.find((a) => a.accountNumber === accountNumber);
    if (!found) {
      return Promise.reject({ status: 404, message: 'Account not found' });
    }
    return found;
  }
  const response = await apiClient.get<AccountDto>('/accounts', {
    params: { accountNumber },
  });
  return response.data;
}

async function getBalance(accountNumber: string): Promise<string> {
  if (USE_MOCK) {
    await delay(300);
    const found = MOCK_ACCOUNTS.find((a) => a.accountNumber === accountNumber);
    return found ? String(found.availableBalance) : '0.00';
  }
  const response = await apiClient.get<string>('/accounts/balance', {
    params: { accountNumber },
  });
  return response.data;
}

async function createAccount(data: Omit<AccountDto, 'accountId' | 'accountNumber' | 'accountStatus'>): Promise<BackendResponse> {
  if (USE_MOCK) {
    await delay(800);
    const number = mockCreateAccount(data.userId, data.accountType);
    return { responseCode: '201', responseMessage: 'Account created successfully: ' + number };
  }
  const response = await apiClient.post<BackendResponse>('/accounts', data);
  return response.data;
}

async function closeAccount(accountNumber: string): Promise<BackendResponse> {
  if (USE_MOCK) {
    await delay(700);
    mockCloseAccount(accountNumber);
    return { responseCode: '200', responseMessage: 'Account closed successfully' };
  }
  const response = await apiClient.put<BackendResponse>('/accounts/closure', null, {
    params: { accountNumber },
  });
  return response.data;
}

export const accountService = {
  getAccountByUserId,
  getAllAccountsByUserId,
  getAccountByNumber,
  getBalance,
  createAccount,
  closeAccount,
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
