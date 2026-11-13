/**
 * transactionService.ts
 *
 * Routes (via gateway at /transactions/**):
 *  POST /transactions                         → BackendResponse
 *  GET  /transactions?accountId={id}          → TransactionRecord[]
 */

import apiClient from './apiClient';
import type { TransactionDto, TransactionRecord, BackendResponse } from '@/types';
import { MOCK_TRANSACTIONS, mockDepositOrWithdraw } from './mock/mockData';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true';

async function addTransaction(data: TransactionDto): Promise<BackendResponse> {
  if (USE_MOCK) {
    await delay(700);
    mockDepositOrWithdraw(data.accountId, data.transactionType, data.amount, data.description);
    return { responseCode: '201', responseMessage: 'Transaction completed successfully' };
  }
  const response = await apiClient.post<BackendResponse>('/transactions', data);
  return response.data;
}

async function getTransactionsByAccountId(accountId: string): Promise<TransactionRecord[]> {
  if (USE_MOCK) {
    await delay(600);
    return MOCK_TRANSACTIONS.filter((t) => t.accountId === accountId).map((t) => ({ ...t }));
  }
  const response = await apiClient.get<TransactionRecord[]>('/transactions', {
    params: { accountId },
  });
  return response.data;
}


export const transactionService = {
  addTransaction,
  getTransactionsByAccountId,
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
