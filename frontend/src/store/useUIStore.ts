import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Theme, Toast, ToastType, Notification } from '@/types';

interface UIState {
  theme: Theme;
  sidebarCollapsed: boolean;
  toasts: Toast[];
  notifications: Notification[];

  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;

  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  toast: (type: ToastType, title: string, message?: string, duration?: number) => void;

  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'timestamp'>) => void;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    title: 'Welcome to Finexus',
    message: 'Your account is set up and ready to use.',
    read: false,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    type: 'system',
  },
  {
    id: 'notif-2',
    title: 'Security tip',
    message: 'Enable 2-factor authentication for extra security.',
    read: false,
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    type: 'system',
  },
];

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      sidebarCollapsed: false,
      toasts: [],
      notifications: INITIAL_NOTIFICATIONS,

      setTheme: (theme: Theme) => {
        set({ theme });
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('finexus-theme', theme);
      },

      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        get().setTheme(next);
      },

      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      addToast: (toast) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const newToast: Toast = { id, duration: 4000, ...toast };
        set((s) => ({ toasts: [...s.toasts, newToast] }));
        // Auto-remove
        setTimeout(() => get().removeToast(id), newToast.duration ?? 4000);
      },

      removeToast: (id) =>
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

      toast: (type, title, message, duration) =>
        get().addToast({ type, title, message, duration }),

      addNotification: (notif) => {
        const id = `notif-${Date.now()}`;
        const notification: Notification = {
          id,
          read: false,
          timestamp: new Date().toISOString(),
          ...notif,
        };
        set((s) => ({ notifications: [notification, ...s.notifications] }));
      },

      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),

      markAllRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),
    }),
    {
      name: 'finexus-ui',
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
