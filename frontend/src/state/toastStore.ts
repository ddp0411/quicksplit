import { create } from 'zustand';
import type { ToastItem, ToastType } from '@/components/ui/Toast';

let _id = 0;

interface ToastStore {
  toasts: ToastItem[];
  toast: (message: string, type?: ToastType) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  toast: (message, type = 'info') => {
    const id = String(++_id);
    set(s => ({ toasts: [...s.toasts, { id, type, message }] }));
  },

  dismiss: (id) => {
    set(s => ({ toasts: s.toasts.filter(t => t.id !== id) }));
  },
}));
