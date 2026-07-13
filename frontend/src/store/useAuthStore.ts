import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { JwtResponse, UserDto } from '@/types';

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
        console.log('setAuth received JwtResponse data:', data);
        set({
          token: data.token,
          userId: data.id || (data as any).userId || (data as any).userIdFromToken, // fallback options
          email: data.email,
          username: data.username,
          roles: data.roles,
          isAuthenticated: true,
        });
      },

      setUser: (user: UserDto) => set({ user }),

      logout: () =>
        set({
          token: null,
          userId: null,
          email: null,
          username: null,
          roles: [],
          user: null,
          isAuthenticated: false,
        }),
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
