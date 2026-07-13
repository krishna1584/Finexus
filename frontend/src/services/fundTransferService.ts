/**
 * fundTransferService.ts
 *
 * Routes (via gateway at /fund-transfers/**):
 *  POST /fund-transfers                        → FundTransferResponse
 *  GET  /fund-transfers/{referenceId}          → FundTransferDto
 *  GET  /fund-transfers?accountId={id}         → FundTransferDto[]
 */

import apiClient from './apiClient';
import type { FundTransferRequest, FundTransferResponse, FundTransferDto } from '@/types';
import { MOCK_TRANSFERS } from './mock/mockData';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true';

async function fundTransfer(data: FundTransferRequest): Promise<FundTransferResponse> {
  if (USE_MOCK) {
    await delay(900);
    return {
      transactionId: 'TXN' + Date.now(),
      message: `Transfer of ${data.amount} from ${data.fromAccount} to ${data.toAccount} completed successfully.`,
    };
  }
  const response = await apiClient.post<FundTransferResponse>('/fund-transfers', data);
  return response.data;
}

async function getTransferByReference(referenceId: string): Promise<FundTransferDto> {
  if (USE_MOCK) {
    await delay(400);
    const found = MOCK_TRANSFERS.find((t) => t.transactionReference === referenceId);
    if (!found) return Promise.reject({ status: 404, message: 'Transfer not found' });
    return found;
  }
  const response = await apiClient.get<FundTransferDto>(`/fund-transfers/${referenceId}`);
  return response.data;
}

async function getTransfersByAccountId(accountId: string): Promise<FundTransferDto[]> {
  if (USE_MOCK) {
    await delay(500);
    return MOCK_TRANSFERS.filter(
      (t) => t.fromAccount === accountId || t.toAccount === accountId
    );
  }
  const response = await apiClient.get<FundTransferDto[]>('/fund-transfers', {
    params: { accountId },
  });
  return response.data;
}

export const fundTransferService = {
  fundTransfer,
  getTransferByReference,
  getTransfersByAccountId,
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
