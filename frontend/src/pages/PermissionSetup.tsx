import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';

const permissions = [
  {
    emoji: '👥',
    title: 'Find your friends',
    subtitle: 'Contacts access',
    why: 'We use your contacts to help you find friends already on QuickSplit and invite others.',
    privacy: 'Contacts are never stored on our servers.',
    action: 'Allow contacts',
  },
  {
    emoji: '🔔',
    title: 'Stay on top of bills',
    subtitle: 'Notifications',
    why: 'Get payment reminders, settlement nudges, and group activity alerts.',
    privacy: 'You can turn off any notification type in settings.',
    action: 'Allow notifications',
  },
  {
    emoji: '📷',
    title: 'Scan bills instantly',
    subtitle: 'Camera',
    why: 'Use OCR to automatically detect the total from a receipt photo.',
    privacy: 'Photos are processed locally and never saved without your permission.',
    action: 'Allow camera',
  },
];

export const PermissionSetup: React.FC = () => {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const perm = permissions[step];
  const isLast = step === permissions.length - 1;

  const next = () => {
    if (isLast) {
      localStorage.setItem('qs_permissions', '1');
      navigate('/friends', { replace: true });
    } else {
      setStep(s => s + 1);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center p-6" style={{ background: 'var(--bg)' }}>
      {/* Progress */}
      <div className="absolute top-12 flex gap-1.5">
        {permissions.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${i <= step ? 'w-8 bg-primary-600' : 'w-8 bg-slate-200 dark:bg-slate-700'}`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          className="w-full max-w-sm text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-primary-50 dark:bg-primary-900/20 text-5xl">
            {perm.emoji}
          </div>

          <p className="text-xs font-bold uppercase tracking-widest text-primary-600 mb-2">
            {perm.subtitle}
          </p>
          <h1 className="font-display text-3xl font-extrabold mb-3" style={{ color: 'var(--text)' }}>
            {perm.title}
          </h1>

          <div className="rounded-2xl border p-4 mb-6 text-left space-y-3" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
            <div className="flex gap-3">
              <span className="text-lg">✓</span>
              <p className="text-sm" style={{ color: 'var(--text)' }}>{perm.why}</p>
            </div>
            <div className="flex gap-3">
              <span className="text-lg">🔒</span>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{perm.privacy}</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="w-full max-w-sm space-y-3">
        <Button className="w-full" onClick={next}>
          {perm.action}
        </Button>
        <button
          onClick={next}
          className="w-full py-3 text-sm font-semibold transition hover:opacity-70"
          style={{ color: 'var(--text-muted)' }}
        >
          {isLast ? 'Finish setup' : 'Skip for now'}
        </button>
      </div>
    </div>
  );
};
