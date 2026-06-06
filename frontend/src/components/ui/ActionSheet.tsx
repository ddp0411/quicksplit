import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  PlusCircleIcon,
  CameraIcon,
  ArrowsRightLeftIcon,
} from '@heroicons/react/24/outline';

interface ActionSheetProps {
  open: boolean;
  onClose: () => void;
}

const actions = [
  { icon: PlusCircleIcon, label: 'Add expense', sub: 'Split a bill with friends', to: '/expenses/new', color: 'bg-primary-50 text-primary-600 dark:bg-primary-900/20' },
  { icon: CameraIcon, label: 'Scan bill', sub: 'Use OCR to detect total', to: '/scan', color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20' },
  { icon: ArrowsRightLeftIcon, label: 'Settle up', sub: 'Record a payment', to: '/settle-up', color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' },
];

export const ActionSheet: React.FC<ActionSheetProps> = ({ open, onClose }) => {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="sheet-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="sheet-panel max-w-lg mx-auto"
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
          >
            <div className="mb-4 flex justify-center">
              <div className="h-1 w-10 rounded-full bg-slate-300 dark:bg-slate-600" />
            </div>
            <div className="space-y-2">
              {actions.map(({ icon: Icon, label, sub, to, color }) => (
                <button
                  key={to}
                  type="button"
                  onClick={() => { onClose(); navigate(to); }}
                  className="flex w-full items-center gap-4 rounded-2xl p-4 transition hover:opacity-80 active:scale-[0.98]"
                  style={{ background: 'var(--card)' }}
                >
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>{label}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</p>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={onClose}
              className="mt-4 w-full rounded-2xl py-3 text-sm font-bold transition hover:opacity-75"
              style={{ color: 'var(--text-muted)' }}
            >
              Cancel
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
