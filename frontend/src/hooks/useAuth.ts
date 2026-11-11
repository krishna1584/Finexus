import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';
import { authService } from '@/services/authService';
import { userService } from '@/services/userService';
import type { LoginRequest, CreateUserRequest, ApiError } from '@/types';

export function useAuth() {
  const navigate = useNavigate();
  const { setAuth, setUser, logout: storeLogout, isAuthenticated, userId, user, token } = useAuthStore();
  const toast = useUIStore((s) => s.toast);

  const login = useCallback(
    async (credentials: LoginRequest): Promise<void> => {
      const data = await authService.login(credentials);
      // The login response always carries the user id. (The old fallback that
      // downloaded every user to find it has been removed; that list is no
      // longer reachable from the browser.)
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
