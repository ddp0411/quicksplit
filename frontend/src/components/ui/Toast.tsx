import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

const STYLES: Record<ToastType, { bg: string; icon: string; text: string }> = {
  success: { bg: 'bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-700', icon: '✅', text: 'text-green-800 dark:text-green-200' },
  warning: { bg: 'bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:border-amber-700', icon: '⚠️', text: 'text-amber-800 dark:text-amber-200' },
  error:   { bg: 'bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-700',         icon: '✕', text: 'text-red-800 dark:text-red-200' },
  info:    { bg: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-700', icon: 'ℹ️', text: 'text-emerald-800 dark:text-emerald-200' },
};

function Toast({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) {
  const { bg, icon, text } = STYLES[toast.type];

  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), 4000);
    return () => clearTimeout(t);
  }, [toast.id, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.15 } }}
      className={`flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-card text-sm font-semibold ${bg}`}
    >
      <span className="mt-0.5 shrink-0">{icon}</span>
      <p className={`flex-1 ${text}`}>{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className={`mt-0.5 shrink-0 rounded-full p-0.5 transition hover:bg-black/10 ${text}`}
      >
        <XMarkIcon className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => (
  <div className="fixed top-4 left-1/2 z-50 w-full max-w-sm -translate-x-1/2 space-y-2 px-4">
    <AnimatePresence mode="sync">
      {toasts.map(t => (
        <Toast key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </AnimatePresence>
  </div>
);
