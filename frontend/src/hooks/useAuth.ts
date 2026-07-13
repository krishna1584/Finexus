import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';
import { authService } from '@/services/authService';
import { userService } from '@/services/userService';
import apiClient from '@/services/apiClient';
import type { LoginRequest, CreateUserRequest, ApiError, UserDto } from '@/types';

export function useAuth() {
  const navigate = useNavigate();
  const { setAuth, setUser, logout: storeLogout, isAuthenticated, userId, user, token } = useAuthStore();
  const toast = useUIStore((s) => s.toast);

  const login = useCallback(
    async (credentials: LoginRequest): Promise<void> => {
      const data = await authService.login(credentials);
      
      let userIdVal = data.id || (data as any).userId;
      if (!userIdVal) {
        try {
          console.log('data.id missing, performing fallback email lookup for:', credentials.email);
          const response = await apiClient.get<UserDto[]>('/api/users');
          const matchedUser = response.data.find(
            (u) => u.emailId.toLowerCase() === credentials.email.toLowerCase()
          );
          if (matchedUser) {
            userIdVal = matchedUser.userId;
            data.id = userIdVal;
            console.log('Fallback successful. Found matching userId:', userIdVal);
          }
        } catch (e) {
          console.error('Fallback email lookup failed:', e);
        }
      }

      setAuth(data);
      // Fetch user profile immediately
      try {
        if (data.id) {
          const userProfile = await userService.getUserById(data.id);
          setUser(userProfile);
        }
      } catch {
        // Non-fatal if profile fetch fails
      }
    },
    [setAuth, setUser]
  );

  const register = useCallback(
    async (data: CreateUserRequest): Promise<void> => {
      await authService.register(data);
    },
    []
  );

  const logout = useCallback(() => {
    storeLogout();
    toast('info', 'Signed out', 'You have been logged out successfully.');
    navigate('/login');
  }, [storeLogout, navigate, toast]);

  const refreshUser = useCallback(async () => {
    if (!userId) return;
    try {
      const userProfile = await userService.getUserById(userId);
      setUser(userProfile);
    } catch (err) {
      const apiErr = err as ApiError;
      toast('error', 'Failed to load profile', apiErr.message);
    }
  }, [userId, setUser, toast]);

  return {
    isAuthenticated,
    userId,
    user,
    token,
    login,
    register,
    logout,
    refreshUser,
  };
}
