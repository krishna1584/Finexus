/**
 * authService.ts
 *
 * Routes (User-Service, through the API gateway):
 *  POST /api/auth/login            → JwtResponse (public)
 *  POST /api/auth/register         → BackendResponse (public)
 *  POST /api/auth/change-password  → BackendResponse (signed in)
 */

import apiClient from './apiClient';
import type { LoginRequest, JwtResponse, CreateUserRequest, BackendResponse, ChangePasswordRequest } from '@/types';
import { MOCK_PASSWORD, setMockPassword } from './mock/mockData';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true';

// ---- Local JWT implementation ----

async function loginLocal(credentials: LoginRequest): Promise<JwtResponse> {
  const response = await apiClient.post<JwtResponse>('/api/auth/login', credentials);
  return response.data;
}

async function registerLocal(data: CreateUserRequest): Promise<BackendResponse> {
  // Use /api/auth/register (AuthController) — also available at /api/users/register
  const response = await apiClient.post<BackendResponse>('/api/auth/register', data);
  return response.data;
}

// ---- Mock implementation ----

async function loginMock(credentials: LoginRequest): Promise<JwtResponse> {
  await delay(700);
  if (credentials.email === 'demo@finexus.com' && credentials.password === MOCK_PASSWORD) {
    return {
      token: 'mock.jwt.token.eyJhbGciOiJIUzI1NiJ9',
      type: 'Bearer',
      id: 1,
      username: 'demo@finexus.com',
      email: 'demo@finexus.com',
      roles: ['ROLE_USER'],
    };
  }
  const err = { status: 401, message: 'Invalid email or password' };
  return Promise.reject(err);
}

async function registerMock(_data: CreateUserRequest): Promise<BackendResponse> {
  await delay(800);
  return { responseCode: '200', responseMessage: 'User registered successfully!' };
}

async function changePasswordLocal(data: ChangePasswordRequest): Promise<BackendResponse> {
  const response = await apiClient.post<BackendResponse>('/api/auth/change-password', data);
  return response.data;
}

async function changePasswordMock(data: ChangePasswordRequest): Promise<BackendResponse> {
  await delay(600);
  if (data.currentPassword !== MOCK_PASSWORD) {
    return Promise.reject({ status: 400, message: 'Current password is incorrect' });
  }
  if (data.newPassword === MOCK_PASSWORD) {
    return Promise.reject({ status: 400, message: 'New password must be different from the current one' });
  }
  setMockPassword(data.newPassword);
  return { responseCode: '200', responseMessage: 'Password updated' };
}

// ---- Public API (strategy pattern) ----

export const authService = {
  login: USE_MOCK ? loginMock : loginLocal,
  register: USE_MOCK ? registerMock : registerLocal,
  changePassword: USE_MOCK ? changePasswordMock : changePasswordLocal,
};

// ---- Utility ----

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
