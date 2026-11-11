import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Theme, Toast, ToastType, Notification, NotificationPrefs } from '@/types';

interface UIState {
  theme: Theme;
  sidebarCollapsed: boolean;
  toasts: Toast[];
  notifications: Notification[];
  notificationPrefs: NotificationPrefs;

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
  clearNotifications: () => void;
  setNotificationPref: (key: keyof NotificationPrefs, enabled: boolean) => void;
}

const DEFAULT_PREFS: NotificationPrefs = { transaction: true, transfer: true, security: true };

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      sidebarCollapsed: false,
      toasts: [],
      // Filled by real events (deposits, transfers, sign-ins, ...); starts empty.
      notifications: [],
      notificationPrefs: DEFAULT_PREFS,

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
        // Respect the user's switches in Profile → Preferences ('account' is always on).
        if (notif.type !== 'account' && !get().notificationPrefs[notif.type]) return;
        const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const notification: Notification = {
          id,
          read: false,
          timestamp: new Date().toISOString(),
          ...notif,
        };
        set((s) => ({ notifications: [notification, ...s.notifications].slice(0, 50) }));
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

      clearNotifications: () => set({ notifications: [] }),

      setNotificationPref: (key, enabled) =>
        set((s) => ({ notificationPrefs: { ...s.notificationPrefs, [key]: enabled } })),
    }),
    {
      name: 'finexus-ui',
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
        notificationPrefs: state.notificationPrefs,
        // Survive reloads; cleared on sign-out so they never carry over to another user.
        notifications: state.notifications,
      }),
    }
  )
);
