import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  showPasswordToggle?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, iconRight, showPasswordToggle, className = '', type, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type;
    const inputId = id ?? `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wide"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={[
              'w-full bg-[var(--bg-surface-2)] text-[var(--text-primary)]',
              'border rounded-2xl px-4 py-3.5 text-sm',
              'placeholder:text-[var(--text-secondary)]/60',
              'transition-all duration-150 outline-none',
              'focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary-soft)]',
              error
                ? 'border-[var(--negative)] focus:border-[var(--negative)] focus:ring-[rgba(244,63,94,0.15)]'
                : 'border-[var(--border-subtle)]',
              icon ? 'pl-10' : '',
              iconRight || showPasswordToggle ? 'pr-10' : '',
              className,
            ].join(' ')}
            {...props}
          />
          {showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
          {iconRight && !showPasswordToggle && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none">
              {iconRight}
            </div>
          )}
        </div>
        {error && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <AlertCircle size={12} className="text-[var(--negative)] flex-shrink-0" />
            <p className="text-xs text-[var(--negative)]">{error}</p>
          </div>
        )}
        {hint && !error && (
          <p className="text-xs text-[var(--text-secondary)] mt-1.5">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// ---- Select ----

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', id, ...props }, ref) => {
    const selectId = id ?? `select-${label?.toLowerCase().replace(/\s+/g, '-')}`;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5 uppercase tracking-wide"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={[
            'w-full bg-[var(--bg-surface-2)] text-[var(--text-primary)]',
            'border rounded-2xl px-4 py-3.5 text-sm appearance-none',
            'transition-all duration-150 outline-none',
            'focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary-soft)]',
            error ? 'border-[var(--negative)]' : 'border-[var(--border-subtle)]',
            className,
          ].join(' ')}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[var(--bg-surface-2)]">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-[var(--negative)] mt-1.5">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
