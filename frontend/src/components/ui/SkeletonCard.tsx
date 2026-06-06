import React from 'react';

interface SkeletonCardProps {
  lines?: number;
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ lines = 3, className = '' }) => (
  <div className={`card animate-pulse ${className}`}>
    <div className="h-4 w-2/3 rounded-lg bg-slate-200 dark:bg-slate-700" />
    {Array.from({ length: lines - 1 }).map((_, i) => (
      <div
        key={i}
        className="mt-3 h-3 rounded-lg bg-slate-100 dark:bg-slate-800"
        style={{ width: `${70 + (i % 3) * 10}%` }}
      />
    ))}
  </div>
);

export const SkeletonRow: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex items-center gap-3 animate-pulse ${className}`}>
    <div className="h-10 w-10 shrink-0 rounded-full bg-slate-200 dark:bg-slate-700" />
    <div className="flex-1 space-y-2">
      <div className="h-3.5 w-3/5 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="h-3 w-2/5 rounded bg-slate-100 dark:bg-slate-800" />
    </div>
    <div className="h-3.5 w-14 rounded bg-slate-200 dark:bg-slate-700" />
  </div>
);
