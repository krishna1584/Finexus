/**
 * transactionService.ts
 *
 * Routes (via gateway at /transactions/**):
 *  POST /transactions                         → BackendResponse
 *  GET  /transactions?accountId={id}          → TransactionRecord[]
 *  GET  /transactions/{referenceId}           → TransactionRecord[]
 */

import apiClient from './apiClient';
import type { TransactionDto, TransactionRecord, BackendResponse } from '@/types';
import { MOCK_TRANSACTIONS } from './mock/mockData';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true';

async function addTransaction(data: TransactionDto): Promise<BackendResponse> {
  if (USE_MOCK) {
    await delay(700);
    return { responseCode: '201', responseMessage: 'Transaction completed successfully.' };
  }
  const response = await apiClient.post<BackendResponse>('/transactions', data);
  return response.data;
}

async function getTransactionsByAccountId(accountId: string): Promise<TransactionRecord[]> {
  if (USE_MOCK) {
    await delay(600);
    return MOCK_TRANSACTIONS.filter((t) => t.accountId === accountId || accountId === 'all');
  }
  const response = await apiClient.get<TransactionRecord[]>('/transactions', {
    params: { accountId },
  });
  return response.data;
}

async function getTransactionByReference(referenceId: string): Promise<TransactionRecord[]> {
  if (USE_MOCK) {
    await delay(400);
    return MOCK_TRANSACTIONS.filter((t) => t.referenceId === referenceId);
  }
  const response = await apiClient.get<TransactionRecord[]>(`/transactions/${referenceId}`);
  return response.data;
}

export const transactionService = {
  addTransaction,
  getTransactionsByAccountId,
  getTransactionByReference,
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
