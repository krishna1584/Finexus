import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

export function Card({ children, className = '', glass = false, padding = 'md', hover = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={[
        'rounded-2xl border transition-all duration-200',
        glass
          ? 'backdrop-blur-md bg-[rgba(18,20,28,0.85)] dark:bg-[rgba(18,20,28,0.85)] border-white/8'
          : 'bg-[var(--bg-surface)] border-[var(--border-subtle)]',
        'shadow-[var(--shadow-card)]',
        hover ? 'hover:scale-[1.01] hover:border-[var(--accent-gold)]/30 cursor-pointer' : '',
        paddingClasses[padding],
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, action, className = '' }: CardHeaderProps) {
  return (
    <div className={`flex items-start justify-between mb-4 ${className}`}>
      <div>
        <h3 className="text-[var(--text-primary)] font-semibold text-sm">{title}</h3>
        {subtitle && (
          <p className="text-[var(--text-secondary)] text-xs mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div className="ml-4 flex-shrink-0">{action}</div>}
    </div>
  );
}
