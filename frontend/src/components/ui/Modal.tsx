import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  id?: string;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export function Modal({ isOpen, onClose, title, subtitle, children, footer, size = 'md', id }: ModalProps) {
  // Trap focus and handle ESC
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      id={id}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className={[
          'relative w-full rounded-2xl shadow-2xl modal-enter z-10',
          'bg-[var(--bg-surface)] border border-[var(--border-subtle)]',
          sizeClasses[size],
        ].join(' ')}
      >
        {/* Header */}
        {(title || subtitle) && (
          <div className="flex items-start justify-between p-6 pb-4 border-b border-[var(--border-subtle)]">
            <div>
              {title && (
                <h2 className="text-[var(--text-primary)] font-semibold text-lg">{title}</h2>
              )}
              {subtitle && (
                <p className="text-[var(--text-secondary)] text-sm mt-0.5">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)] transition-colors"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        )}
        {/* Body */}
        <div className="p-6">{children}</div>
        {/* Footer */}
        {footer && (
          <div className="p-6 pt-0 flex items-center justify-end gap-3 border-t border-[var(--border-subtle)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  danger = false,
  loading = false,
}: ConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="text-[var(--text-secondary)] text-sm">{message}</div>
    </Modal>
  );
}
