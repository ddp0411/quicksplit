import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, hover = false }) => {
  const baseStyles = 'bg-white rounded-xl shadow-lg p-6';

  if (hover) {
    return (
      <motion.div
        whileHover={{ scale: 1.02, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
        className={clsx(baseStyles, className)}
      >
        {children}
      </motion.div>
    );
  }

  return <div className={clsx(baseStyles, className)}>{children}</div>;
};
