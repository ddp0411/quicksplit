import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { expensesAPI, EXPENSE_CATEGORIES } from '@/services/api/expensesAPI';
import { formatCurrency } from '@/utils/upi';
import { formatDate } from '@/utils/helpers';
import {
  ChartPieIcon,
  CreditCardIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

const categoryMeta = Object.fromEntries(EXPENSE_CATEGORIES.map(c => [c.value, c]));

const insights = [
  'Food delivery increased 18% this month 🍕',
  'Cab rides highest on weekends 🚗',
  'You\'re on track with your budget! 🎯',
];

const quickLinks = [
  { to: '/personal/budgets', icon: ChartPieIcon, label: 'Budgets', color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20' },
  { to: '/personal/subscriptions', icon: CreditCardIcon, label: 'Subscriptions', color: 'bg-violet-50 text-violet-600 dark:bg-violet-900/20' },
  { to: '/personal/insights', icon: ArrowTrendingUpIcon, label: 'Analytics', color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' },
  { to: '/personal/ai-chat', icon: SparklesIcon, label: 'AI Chat', color: 'bg-primary-50 text-primary-600 dark:bg-primary-900/20' },
];

export const PersonalTab: React.FC = () => {
  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => expensesAPI.getExpenses({}),
  });

  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const insight = insights[new Date().getDate() % insights.length];

  return (
    <div className="mx-auto max-w-lg space-y-5 pb-8">
      <h1 className="font-display text-3xl font-extrabold" style={{ color: 'var(--text)' }}>Personal</h1>

      {/* Monthly spend hero */}
      <div className="rounded-3xl bg-gradient-to-br from-primary-600 to-primary-800 p-6 text-white shadow-button">
        <p className="text-sm font-semibold text-white/70">Total tracked</p>
        <p className="mt-1 font-display text-4xl font-extrabold">{formatCurrency(totalSpent)}</p>
        <p className="mt-1 text-sm text-white/70">{expenses.length} expenses</p>
      </div>

      {/* AI Insight card */}
      <div className="card flex gap-3 items-start">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-900/20">
          <SparklesIcon className="h-5 w-5 text-primary-600" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary-600 mb-1">AI Insight</p>
          <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{insight}</p>
          <Link to="/personal/ai-chat" className="mt-1.5 inline-block text-xs font-bold text-primary-600 hover:underline">
            Ask AI assistant →
          </Link>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-4 gap-3">
        {quickLinks.map(({ to, icon: Icon, label, color }) => (
          <Link key={to} to={to} className="flex flex-col items-center gap-2">
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${color} transition hover:opacity-80`}>
              <Icon className="h-6 w-6" />
            </div>
            <span className="text-xs font-semibold text-center" style={{ color: 'var(--text-muted)' }}>{label}</span>
          </Link>
        ))}
      </div>

      {/* Recent expenses */}
      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold" style={{ color: 'var(--text)' }}>Recent expenses</h2>
          <Link to="/activity" className="text-xs font-bold text-primary-600">See all</Link>
        </div>
        {expenses.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-2xl">📭</p>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>No expenses yet. Add one with the + button.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {expenses.slice(0, 5).map(exp => {
              const cat = categoryMeta[exp.category];
              return (
                <div key={exp.id} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-lg">
                    {cat?.emoji ?? '📦'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-semibold" style={{ color: 'var(--text)' }}>{exp.description}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(exp.date)}</p>
                  </div>
                  <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>{formatCurrency(exp.amount)}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
