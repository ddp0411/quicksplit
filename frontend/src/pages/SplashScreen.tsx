import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUserStore } from '@/state/userStore';

export const SplashScreen: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useUserStore();

  useEffect(() => {
    const onboarded = localStorage.getItem('qs_onboarded');
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        navigate('/friends', { replace: true });
      } else if (onboarded) {
        navigate('/login', { replace: true });
      } else {
        navigate('/onboarding', { replace: true });
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [isAuthenticated, navigate]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center" style={{ background: 'var(--bg)' }}>
      {/* Glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-primary-400/20 blur-3xl" />
      </div>

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-2 w-2 rounded-full bg-primary-400/40"
          style={{
            left: `${15 + i * 13}%`,
            top: `${20 + (i % 3) * 20}%`,
          }}
          animate={{ y: [0, -16, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}
        />
      ))}

      <motion.div
        className="relative flex flex-col items-center gap-4"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 200 }}
      >
        {/* Logo */}
        <motion.div
          className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary-600 shadow-button text-4xl font-black text-white"
          animate={{ boxShadow: ['0 8px 20px rgba(15,157,148,0.3)', '0 8px 40px rgba(15,157,148,0.6)', '0 8px 20px rgba(15,157,148,0.3)'] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Q
        </motion.div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="font-display text-3xl font-extrabold" style={{ color: 'var(--text)' }}>
            QuickSplit
          </h1>
          <p className="mt-1 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
            Split bills. Settle instantly.
          </p>
        </motion.div>
      </motion.div>

      {/* Loading dots */}
      <motion.div
        className="absolute bottom-16 flex gap-1.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-primary-500"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </motion.div>
    </div>
  );
};
