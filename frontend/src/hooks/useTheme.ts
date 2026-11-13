import { useUIStore } from '@/store/useUIStore';
import type { Theme } from '@/types';

/** Theme state. Applying the class and saving the choice happen inside setTheme. */
export function useTheme() {
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  return { theme, setTheme, toggleTheme };
}

export type { Theme };
