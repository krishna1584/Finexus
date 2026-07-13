/**
 * authService.ts
 *
 * Routes:
 *  POST /api/auth/login  → JwtResponse
 *  POST /api/auth/register → BackendResponse
 *  POST /api/users/register → BackendResponse  (gateway permitAll)
 *
 * Auth Mode selected via VITE_AUTH_MODE env var.
 * LOCAL_JWT (default): calls /api/auth/login on User-Service through gateway.
 */

import apiClient from './apiClient';
import type { LoginRequest, JwtResponse, CreateUserRequest, BackendResponse } from '@/types';

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
  if (credentials.email === 'demo@finexus.com' && credentials.password === 'password123') {
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

// ---- Public API (strategy pattern) ----

export const authService = {
  login: USE_MOCK ? loginMock : loginLocal,
  register: USE_MOCK ? registerMock : registerLocal,
};

// ---- Utility ----

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
