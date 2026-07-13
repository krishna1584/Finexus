import { useEffect } from 'react';
import { useUIStore } from '@/store/useUIStore';
import type { Theme } from '@/types';

export function useTheme() {
  const { theme, setTheme, toggleTheme } = useUIStore();

  // Sync class on HTML element whenever theme changes
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('finexus-theme', theme);
  }, [theme]);

  return { theme, setTheme, toggleTheme };
}

export type { Theme };
