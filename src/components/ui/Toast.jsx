import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';

const TOAST_ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const TOAST_STYLES = {
  success: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-900',
    iconColor: 'text-emerald-600',
    progressBg: 'bg-emerald-500',
  },
  error: {
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-900',
    iconColor: 'text-rose-600',
    progressBg: 'bg-rose-500',
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-900',
    iconColor: 'text-amber-600',
    progressBg: 'bg-amber-500',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-900',
    iconColor: 'text-blue-600',
    progressBg: 'bg-blue-500',
  },
};

export function ToastItem({ id, message, type = 'info', duration = 4000, onClose }) {
  const Icon = TOAST_ICONS[type] || Info;
  const style = TOAST_STYLES[type] || TOAST_STYLES.info;

  useEffect(() => {
    if (!duration) return;
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  return (
    <div
      className={cn(
        'pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl border shadow-lg transition-all duration-200 transform translate-y-0 opacity-100 min-w-[280px] max-w-md',
        style.bg,
        style.border,
        style.text
      )}
      role="alert"
    >
      <div className="flex items-center gap-2.5">
        <Icon className={cn('w-5 h-5 flex-shrink-0', style.iconColor)} />
        <p className="text-sm font-medium leading-snug">{message}</p>
      </div>

      <button
        onClick={() => onClose(id)}
        className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-black/5 transition-colors flex-shrink-0"
        aria-label="Dismiss toast"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onClose }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-full px-4 sm:px-0"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  );
}

