import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, hover = false }) => {
  const baseStyles = 'rounded-lg border border-slate-200/80 bg-white p-5 shadow-soft';

  if (hover) {
    return (
      <motion.div
        whileHover={{ y: -2, boxShadow: '0 18px 45px rgba(36, 31, 78, 0.12)' }}
        className={clsx(baseStyles, className)}
      >
        {children}
      </motion.div>
    );
  }

  return <div className={clsx(baseStyles, className)}>{children}</div>;
};
