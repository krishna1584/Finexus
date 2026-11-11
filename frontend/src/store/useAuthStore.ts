import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { JwtResponse, UserDto } from '@/types';
import { useAccountStore } from './useAccountStore';
import { useTransactionStore } from './useTransactionStore';
import { useUIStore } from './useUIStore';

interface AuthState {
  token: string | null;
  userId: number | null;
  email: string | null;
  username: string | null;
  roles: string[];
  user: UserDto | null;
  isAuthenticated: boolean;

  setAuth: (data: JwtResponse) => void;
  setUser: (user: UserDto) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      userId: null,
      email: null,
      username: null,
      roles: [],
      user: null,
      isAuthenticated: false,

      setAuth: (data: JwtResponse) => {
        set({
          token: data.token,
          userId: data.id,
          email: data.email,
          username: data.username,
          roles: data.roles,
          isAuthenticated: true,
        });
      },

      setUser: (user: UserDto) => set({ user }),

      logout: () => {
        // Drop the previous user's cached accounts and transactions so the next
        // person to sign in on this browser never sees them.
        useAccountStore.getState().reset();
        useTransactionStore.getState().reset();
        useUIStore.getState().clearNotifications();
        set({
          token: null,
          userId: null,
          email: null,
          username: null,
          roles: [],
          user: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'finexus-auth',
      partialize: (state) => ({
        token: state.token,
        userId: state.userId,
        email: state.email,
        username: state.username,
        roles: state.roles,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
