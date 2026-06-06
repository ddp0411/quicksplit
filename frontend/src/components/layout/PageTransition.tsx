import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  children: React.ReactNode;
  className?: string;
}

// Enter-only animation. No exit so there's never a blank between pages.
// React Router handles unmounting; each new page just fades in.
export const PageTransition: React.FC<Props> = ({ children, className }) => (
  <motion.div
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.2, ease: 'easeOut' }}
    className={className}
  >
    {children}
  </motion.div>
);
