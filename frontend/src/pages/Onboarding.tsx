import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';

const slides = [
  {
    emoji: '💸',
    title: 'Shared expenses,\nhandled right',
    subtitle: 'Track group expenses, see transparent balances, and settle up effortlessly.',
    bg: 'from-primary-500 to-primary-700',
    illustration: (
      <div className="space-y-3 w-full max-w-xs mx-auto">
        {[
          { label: 'House Expenses', amount: '₹6,540', sub: 'you are owed', color: 'text-positive' },
          { label: 'Trip to Goa', amount: '₹3,415', sub: 'you are owed', color: 'text-positive' },
          { label: 'Office Lunch', amount: '₹890', sub: 'you owe', color: 'text-negative' },
        ].map((item, i) => (
          <motion.div
            key={i}
            className="flex items-center justify-between rounded-2xl bg-white/90 dark:bg-white/10 px-4 py-3 shadow-card"
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
          >
            <p className="font-semibold text-sm text-ink dark:text-white">{item.label}</p>
            <div className="text-right">
              <p className={`font-bold text-sm ${item.color}`}>{item.amount}</p>
              <p className="text-[10px] text-slate-500">{item.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>
    ),
  },
  {
    emoji: '📄',
    title: 'Scan bills,\nand split them',
    subtitle: 'Scan once and split expenses with your group in seconds using OCR.',
    bg: 'from-amber-400 to-orange-500',
    illustration: (
      <div className="relative flex items-center justify-center">
        <div className="relative h-44 w-32 rounded-2xl border-4 border-dashed border-white/60 bg-white/20 flex items-center justify-center">
          <div className="space-y-1.5 w-20">
            {[70, 50, 60, 45, 80].map((w, i) => (
              <div key={i} className="h-1.5 rounded-full bg-white/70" style={{ width: `${w}%` }} />
            ))}
            <div className="mt-3 h-2 rounded bg-white/90 w-full" />
          </div>
          <motion.div
            className="absolute inset-x-2 h-0.5 bg-white/80"
            animate={{ top: ['10%', '90%', '10%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
        </div>
        <div className="absolute -right-4 -top-4 text-4xl">✅</div>
      </div>
    ),
  },
  {
    emoji: '🤖',
    title: 'Your finances,\nexplained',
    subtitle: 'Get clear insights and understand your finances with AI chat.',
    bg: 'from-violet-500 to-purple-700',
    illustration: (
      <div className="w-full max-w-xs mx-auto space-y-3">
        <div className="flex justify-end">
          <div className="rounded-2xl rounded-tr-sm bg-primary-600 px-4 py-2.5 text-sm text-white font-medium max-w-[75%]">
            How can I reduce my spend?
          </div>
        </div>
        <div className="flex justify-start">
          <div className="rounded-2xl rounded-tl-sm bg-white/90 dark:bg-white/10 px-4 py-3 text-sm text-slate-700 dark:text-white font-medium max-w-[85%] shadow-card">
            Housing is your top spending category. Focusing there could have the biggest impact.
          </div>
        </div>
      </div>
    ),
  },
  {
    emoji: '📊',
    title: 'Spend with\nconfidence',
    subtitle: 'Set budgets, track subscriptions, and stay on top of your monthly spend.',
    bg: 'from-emerald-500 to-teal-600',
    illustration: (
      <div className="w-full max-w-xs mx-auto space-y-2">
        {[
          { label: 'Entertainment', pct: 80, status: 'NEAR LIMIT', color: 'bg-warning' },
          { label: 'Dining out', pct: 55, status: 'ON TRACK', color: 'bg-positive' },
          { label: 'Transport', pct: 30, status: 'ON TRACK', color: 'bg-positive' },
        ].map((item, i) => (
          <div key={i} className="rounded-2xl bg-white/90 dark:bg-white/10 px-4 py-3 shadow-card">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-semibold text-ink dark:text-white">{item.label}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${item.color}`}>{item.status}</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-200 dark:bg-white/20">
              <div className={`h-1.5 rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    emoji: '🔄',
    title: 'Recurring expenses,\non autopilot',
    subtitle: 'See upcoming subscriptions and recurring charges — remove the ones you no longer need.',
    bg: 'from-sky-500 to-blue-600',
    illustration: (
      <div className="w-full max-w-xs mx-auto space-y-2">
        {[
          { label: 'Netflix', icon: '🎬', amount: '₹649', date: 'Jan 12', freq: 'Monthly' },
          { label: 'Spotify', icon: '🎵', amount: '₹119', date: 'Jan 26', freq: 'Monthly' },
          { label: 'iCloud', icon: '☁️', amount: '₹75', date: 'Jan 5', freq: 'Monthly' },
        ].map((item, i) => (
          <motion.div
            key={i}
            className="flex items-center justify-between rounded-2xl bg-white/90 dark:bg-white/10 px-4 py-3 shadow-card"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12 }}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{item.icon}</span>
              <div>
                <p className="font-semibold text-sm text-ink dark:text-white">{item.label}</p>
                <p className="text-[10px] text-slate-500">{item.freq}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-sm text-primary-600">{item.amount}</p>
              <p className="text-[10px] text-slate-500">{item.date}</p>
            </div>
          </motion.div>
        ))}
      </div>
    ),
  },
];

export const Onboarding: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();
  const slide = slides[current];
  const isLast = current === slides.length - 1;

  const finish = () => {
    localStorage.setItem('qs_onboarded', '1');
    navigate('/login', { replace: true });
  };

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Skip */}
      <div className="flex justify-end p-5 pt-12 relative z-10">
        <button
          onClick={finish}
          className="text-sm font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
        >
          SKIP
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          className="flex flex-1 flex-col items-center px-6"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3 }}
        >
          {/* Illustration area */}
          <div className={`w-full max-w-sm rounded-3xl bg-gradient-to-br ${slide.bg} p-8 flex items-center justify-center min-h-[220px]`}>
            {slide.illustration}
          </div>

          {/* Text */}
          <div className="mt-8 text-center">
            <h1 className="font-display text-3xl font-extrabold leading-tight whitespace-pre-line" style={{ color: 'var(--text)' }}>
              {slide.title}
            </h1>
            <p className="mt-3 text-base leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {slide.subtitle}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Bottom */}
      <div className="px-6 pb-12 space-y-5">
        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? 'w-6 bg-primary-600' : 'w-1.5 bg-slate-300 dark:bg-slate-600'
              }`}
            />
          ))}
        </div>

        <div className="flex gap-3">
          {current > 0 && (
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setCurrent(c => c - 1)}
            >
              Back
            </Button>
          )}
          <Button
            className="flex-1"
            onClick={() => isLast ? finish() : setCurrent(c => c + 1)}
          >
            {isLast ? 'GET STARTED' : 'CONTINUE'}
          </Button>
        </div>
      </div>
    </div>
  );
};
