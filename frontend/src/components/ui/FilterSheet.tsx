import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckIcon } from '@heroicons/react/24/outline';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterSheetProps {
  open: boolean;
  title?: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
}

export const FilterSheet: React.FC<FilterSheetProps> = ({
  open, title = 'Set filter', options, value, onChange, onClose,
}) => (
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
          <div className="mb-3 flex justify-center">
            <div className="h-1 w-10 rounded-full bg-slate-300 dark:bg-slate-600" />
          </div>
          <p className="mb-4 text-center text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>{title}</p>
          <div className="space-y-1">
            {options.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); onClose(); }}
                className="flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-semibold transition hover:bg-primary-50 dark:hover:bg-primary-900/20"
                style={{ color: value === opt.value ? '#0F9D94' : 'var(--text)' }}
              >
                {opt.label}
                {value === opt.value && <CheckIcon className="h-4 w-4 text-primary-600" />}
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            className="mt-3 w-full rounded-2xl py-3 text-sm font-bold text-negative transition hover:opacity-80"
          >
            Cancel
          </button>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);
