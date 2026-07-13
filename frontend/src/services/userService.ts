/**
 * userService.ts
 *
 * Routes (via gateway at /api/users/**):
 *  GET  /api/users/{userId}      → UserDto
 *  PUT  /api/users/{id}          → BackendResponse (body: UserUpdate)
 *  GET  /api/users/auth/{authId} → UserDto
 */

import apiClient from './apiClient';
import type { UserDto, UserUpdateRequest, BackendResponse } from '@/types';
import { MOCK_USER } from './mock/mockData';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true';

async function getUserById(userId: number): Promise<UserDto> {
  if (USE_MOCK) {
    await delay(500);
    return { ...MOCK_USER, userId };
  }
  const response = await apiClient.get<UserDto>(`/api/users/${userId}`);
  return response.data;
}

async function getUserByAuthId(authId: string): Promise<UserDto> {
  if (USE_MOCK) {
    await delay(500);
    return { ...MOCK_USER, authId };
  }
  const response = await apiClient.get<UserDto>(`/api/users/auth/${authId}`);
  return response.data;
}

async function updateUser(userId: number, data: UserUpdateRequest): Promise<BackendResponse> {
  if (USE_MOCK) {
    await delay(600);
    return { responseCode: '200', responseMessage: 'Profile updated successfully!' };
  }
  const response = await apiClient.put<BackendResponse>(`/api/users/${userId}`, data);
  return response.data;
}

export const userService = {
  getUserById,
  getUserByAuthId,
  updateUser,
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
