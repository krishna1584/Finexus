import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

interface ThemeToggleProps {
  labeled?: boolean;
  size?: 'sm' | 'md';
}

export function ThemeToggle({ labeled = false, size = 'md' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  if (labeled) {
    return (
      <div className="flex items-center justify-between py-2">
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)]">Appearance</p>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            {isDark ? 'Dark mode' : 'Light mode'} is active
          </p>
        </div>
        <button
          onClick={toggleTheme}
          role="switch"
          aria-checked={isDark}
          aria-label="Toggle dark mode"
          className={[
            'relative w-12 h-6 rounded-full transition-colors duration-200',
            isDark ? 'bg-[var(--accent-secondary)]' : 'bg-[var(--accent-primary)]',
          ].join(' ')}
        >
          <span
            className={[
              'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200',
              isDark ? 'translate-x-6' : 'translate-x-0',
            ].join(' ')}
          />
        </button>
      </div>
    );
  }

  const iconSize = size === 'sm' ? 15 : 17;

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={[
        'rounded-xl border transition-all duration-150',
        'text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)]/30 hover:bg-[var(--accent-primary-soft)] dark:hover:text-[var(--accent-secondary)] dark:hover:border-[var(--accent-secondary)]/30 dark:hover:bg-[var(--accent-secondary-soft)]',
        'border-[var(--border-subtle)] bg-[var(--bg-surface-2)]',
        size === 'sm' ? 'p-1.5' : 'p-2',
      ].join(' ')}
    >
      {isDark ? <Sun size={iconSize} /> : <Moon size={iconSize} />}
    </button>
  );
}
