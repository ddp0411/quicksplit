import React from 'react';

export type BadgeType = 'unsettled' | 'settled' | 'you-paid' | 'owes-you' | 'you-owe' | 'overdue';

interface ExpenseBadgeProps {
  type: BadgeType;
}

const CONFIG: Record<BadgeType, { label: string; className: string }> = {
  'unsettled': { label: 'Unsettled', className: 'border border-accent-500 text-accent-600 bg-accent-50 dark:bg-accent-900/20 dark:text-accent-400' },
  'settled':   { label: 'Settled',   className: 'bg-positive text-white' },
  'you-paid':  { label: 'You paid',  className: 'bg-primary-600 text-white' },
  'owes-you':  { label: 'Owes you',  className: 'bg-positive/15 text-positive' },
  'you-owe':   { label: 'You owe',   className: 'bg-negative/10 text-negative' },
  'overdue':   { label: 'Overdue',   className: 'bg-negative text-white' },
};

export const ExpenseBadge: React.FC<ExpenseBadgeProps> = ({ type }) => {
  const { label, className } = CONFIG[type];
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${className}`}>
      {label}
    </span>
  );
};
