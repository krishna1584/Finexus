import React from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-[var(--accent-gold)] text-[#0A0A0F] font-semibold hover:brightness-110 shadow-[0_0_20px_rgba(240,185,11,0.3)] hover:shadow-[0_0_30px_rgba(240,185,11,0.5)]',
  secondary:
    'bg-[var(--bg-surface-2)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)]',
  ghost:
    'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)]',
  danger:
    'bg-[var(--negative)] text-white font-semibold hover:brightness-110',
  outline:
    'border border-[var(--accent-gold)] text-[var(--accent-gold)] hover:bg-[var(--accent-gold-soft)]',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-base rounded-xl gap-2.5',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconRight,
      fullWidth = false,
      disabled,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={[
          'inline-flex items-center justify-center font-medium transition-all duration-150 ease-out select-none',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          'active:scale-[0.98]',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth ? 'w-full' : '',
          className,
        ].join(' ')}
        {...props}
      >
        {loading ? (
          <Loader2 className="animate-spin" size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />
        ) : (
          icon && <span className="flex-shrink-0">{icon}</span>
        )}
        {children}
        {!loading && iconRight && <span className="flex-shrink-0 ml-auto">{iconRight}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
