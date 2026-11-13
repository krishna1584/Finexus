import React from 'react';
import { Loader2 } from 'lucide-react';
import { Link, type LinkProps } from 'react-router-dom';

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
    'bg-[var(--accent-primary)] text-white font-semibold hover:brightness-105 shadow-[0_8px_18px_var(--accent-primary-soft)] dark:bg-[var(--accent-secondary)] dark:text-[#0b0f14] dark:hover:brightness-105 dark:shadow-[0_10px_24px_var(--accent-secondary-soft)]',
  secondary:
    'bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface-2)]',
  ghost:
    'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)] border border-transparent',
  danger:
    'bg-[var(--negative)] text-white font-semibold hover:brightness-110',
  outline:
    'border border-[var(--accent-primary)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary-soft)] dark:border-[var(--accent-secondary)] dark:text-[var(--accent-secondary)] dark:hover:bg-[var(--accent-secondary-soft)]',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-9 px-3 text-xs rounded-lg gap-1.5',
  md: 'h-11 px-4 text-sm rounded-xl gap-2',
  lg: 'h-12 px-6 text-base rounded-xl gap-2.5',
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
        aria-busy={loading || undefined}
        className={buttonClasses({ variant, size, fullWidth, className })}
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

/** The button look, for elements that aren't <button> (e.g. links). */
function buttonClasses({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
}: { variant?: Variant; size?: Size; fullWidth?: boolean; className?: string } = {}) {
  return [
    'inline-flex items-center justify-center font-medium transition-all duration-150 ease-out select-none',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
    'active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]/40',
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? 'w-full' : '',
    className,
  ].join(' ');
}

interface ButtonLinkProps extends LinkProps {
  variant?: Variant;
  size?: Size;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

/**
 * A link styled as a button. Use this instead of <Link><Button/></Link>,
 * which nests two interactive elements (invalid HTML, two tab stops).
 */
export function ButtonLink({ variant, size, icon, fullWidth, className = '', children, ...props }: ButtonLinkProps) {
  return (
    <Link className={buttonClasses({ variant, size, fullWidth, className })} {...props}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </Link>
  );
}
