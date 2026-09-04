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
        'rounded-3xl border transition-all duration-200',
        glass
          ? 'glass-card'
          : 'bg-[var(--bg-surface)] border-[var(--border-subtle)]',
        'shadow-[var(--shadow-soft)]',
        hover ? 'hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)] hover:border-[var(--border-strong)] cursor-pointer' : '',
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
        <h3 className="text-[var(--text-primary)] font-semibold text-base font-display">{title}</h3>
        {subtitle && (
          <p className="text-[var(--text-secondary)] text-xs mt-1">{subtitle}</p>
        )}
      </div>
      {action && <div className="ml-4 flex-shrink-0">{action}</div>}
    </div>
  );
}
