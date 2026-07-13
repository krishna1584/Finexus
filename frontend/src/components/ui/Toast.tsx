import { X, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import type { Toast, ToastType } from '@/types';

const toastConfig: Record<ToastType, { icon: React.ReactNode; borderColor: string; iconColor: string }> = {
  success: {
    icon: <CheckCircle size={16} />,
    borderColor: 'border-[var(--positive)]',
    iconColor: 'text-[var(--positive)]',
  },
  error: {
    icon: <XCircle size={16} />,
    borderColor: 'border-[var(--negative)]',
    iconColor: 'text-[var(--negative)]',
  },
  warning: {
    icon: <AlertCircle size={16} />,
    borderColor: 'border-amber-500',
    iconColor: 'text-amber-500',
  },
  info: {
    icon: <Info size={16} />,
    borderColor: 'border-[var(--accent-gold)]',
    iconColor: 'text-[var(--accent-gold)]',
  },
};

import React from 'react';

function ToastItem({ toast }: { toast: Toast }) {
  const removeToast = useUIStore((s) => s.removeToast);
  const config = toastConfig[toast.type];

  return (
    <div
      className={[
        'toast-enter flex items-start gap-3 p-4 rounded-xl shadow-2xl min-w-[280px] max-w-[380px]',
        'bg-[var(--bg-surface)] border-l-4',
        'border-y border-r border-[var(--border-subtle)]',
        config.borderColor,
      ].join(' ')}
      role="alert"
    >
      <span className={`mt-0.5 flex-shrink-0 ${config.iconColor}`}>{config.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--text-primary)]">{toast.title}</p>
        {toast.message && (
          <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="flex-shrink-0 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useUIStore((s) => s.toasts);

  return (
    <div
      className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} />
        </div>
      ))}
    </div>
  );
}
