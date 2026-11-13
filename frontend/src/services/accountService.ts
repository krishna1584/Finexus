/**
 * accountService.ts
 *
 * Routes (via gateway at /accounts/**):
 *  GET  /accounts/user/{userId}             → AccountDto[] (all of the user's accounts)
 *  POST /accounts                           → BackendResponse (open an account)
 *  PUT  /accounts/closure?accountNumber={n} → BackendResponse (close an empty account)
 */

import apiClient from './apiClient';
import type { AccountDto, BackendResponse } from '@/types';
import { MOCK_ACCOUNTS, mockCloseAccount, mockCreateAccount } from './mock/mockData';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true';

async function getAllAccountsByUserId(userId: number): Promise<AccountDto[]> {
  if (USE_MOCK) {
    await delay(600);
    return MOCK_ACCOUNTS.filter((a) => a.userId === userId).map((a) => ({ ...a }));
  }
  const response = await apiClient.get<AccountDto[]>(`/accounts/user/${userId}`);
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
  getAllAccountsByUserId,
  createAccount,
  closeAccount,
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
