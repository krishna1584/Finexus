import React, { useId, useRef } from 'react';
import { X } from 'lucide-react';
import { useDialog } from '@/hooks/useDialog';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: 'sm' | 'md' | 'lg';
  id?: string;
}

const widthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export function Drawer({ isOpen, onClose, title, subtitle, children, footer, width = 'md', id }: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  // Focus trap, Escape to close, focus restore, background scroll lock.
  useDialog(isOpen, onClose, panelRef);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex" id={id}>
      {/* Backdrop */}
      <div
        className="flex-1 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Drawer panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className={[
          'flex flex-col h-full w-full shadow-2xl outline-none',
          'bg-[var(--bg-surface)] border-l border-[var(--border-subtle)]',
          widthClasses[width],
        ].join(' ')}
        style={{ animation: 'drawerIn 0.25s ease-out forwards' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-[var(--border-subtle)] flex-shrink-0">
          <div>
            {title && (
              <h2 id={titleId} className="text-[var(--text-primary)] font-semibold text-lg">{title}</h2>
            )}
            {subtitle && (
              <p className="text-[var(--text-secondary)] text-sm mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)] transition-colors"
            aria-label="Close drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content — scrollable */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex-shrink-0 p-6 pt-4 border-t border-[var(--border-subtle)] flex items-center gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
