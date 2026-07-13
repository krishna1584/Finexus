import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from '@/types';

// The base URL uses Vite proxy in dev; in production set VITE_API_BASE_URL
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// ---- Request Interceptor: attach Bearer token ----
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    try {
      const authStorage = localStorage.getItem('finexus-auth');
      if (authStorage) {
        const { token } = JSON.parse(authStorage);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch {
      // ignore parse errors
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---- Response Interceptor: normalize errors ----
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status ?? 0;
    const data = error.response?.data as Record<string, unknown> | undefined;

    const apiError: ApiError = {
      status,
      message:
        (data?.responseMessage as string) ||
        (data?.message as string) ||
        (data?.error as string) ||
        error.message ||
        'An unexpected error occurred',
      fieldErrors: data?.fieldErrors as Record<string, string> | undefined,
    };

    if (status === 401) {
      // Clear auth state
      localStorage.removeItem('finexus-auth');
      // Redirect to login only if we're not already there and the failed
      // request was not the login call itself (avoid redirect loops)
      const currentPath = window.location.pathname;
      const requestUrl = error.config?.url ?? '';
      const isAuthRequest = requestUrl.includes('/api/auth/');
      if (currentPath !== '/login' && !isAuthRequest) {
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      }
    }

    return Promise.reject(apiError);
  }
);

export default apiClient;
