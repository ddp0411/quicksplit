import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { expensesAPI, EXPENSE_CATEGORIES } from '@/services/api/expensesAPI';
import { formatCurrency } from '@/utils/upi';

const catMeta = Object.fromEntries(EXPENSE_CATEGORIES.map(c => [c.value, c]));

const COLORS = ['#0F9D94', '#2BB673', '#F4A300', '#E74C3C', '#8B5CF6', '#F59E0B', '#3B82F6', '#EC4899', '#14B8A6', '#6366F1'];

const filters = ['This month', 'Last month', 'All time'];

function filterExpenses(expenses: any[], filter: string) {
  const now = new Date();
  return expenses.filter(e => {
    const d = new Date(e.date);
    if (filter === 'This month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    if (filter === 'Last month') {
      const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
    }
    return true;
  });
}

export const SpendingInsights: React.FC = () => {
  const [filter, setFilter] = useState('All time');
  const { data: allExpenses = [] } = useQuery({ queryKey: ['expenses'], queryFn: () => expensesAPI.getExpenses({}) });

  const expenses = filterExpenses(allExpenses, filter);
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  const byCategory: Record<string, number> = {};
  expenses.forEach(e => { byCategory[e.category] = (byCategory[e.category] ?? 0) + e.amount; });

  const categories = Object.entries(byCategory)
    .map(([cat, amount]) => ({ cat, amount, pct: total > 0 ? (amount / total) * 100 : 0 }))
    .sort((a, b) => b.amount - a.amount);

  // SVG donut
  const R = 60, CX = 80, CY = 80, stroke = 24;
  const circumference = 2 * Math.PI * R;
  let offset = 0;

  return (
    <div className="mx-auto max-w-lg space-y-5 pb-8">
      <div className="flex items-center gap-3">
        <Link to="/personal" className="flex h-9 w-9 items-center justify-center rounded-2xl transition hover:bg-slate-100 dark:hover:bg-slate-800">
          <ArrowLeftIcon className="h-5 w-5" style={{ color: 'var(--text)' }} />
        </Link>
        <h1 className="font-display text-2xl font-extrabold" style={{ color: 'var(--text)' }}>Spending Insights</h1>
      </div>

      {/* Date filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition ${
              filter === f
                ? 'bg-primary-600 text-white'
                : 'border text-sm font-semibold'
            }`}
            style={filter !== f ? { borderColor: 'var(--border)', color: 'var(--text-muted)' } : undefined}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Total */}
      <div className="card">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Total spent</p>
        <p className="font-display text-3xl font-extrabold text-primary-600">{formatCurrency(total)}</p>
      </div>

      {categories.length === 0 ? (
        <div className="card py-12 text-center">
          <p className="text-3xl">📊</p>
          <p className="mt-3 font-semibold" style={{ color: 'var(--text-muted)' }}>No expenses in this period</p>
        </div>
      ) : (
        <>
          {/* Donut chart */}
          <div className="card flex flex-col items-center">
            <p className="mb-4 text-sm font-bold" style={{ color: 'var(--text)' }}>Spending breakdown</p>
            <svg width="160" height="160" viewBox="0 0 160 160">
              <circle cx={CX} cy={CY} r={R} fill="none" stroke="var(--border)" strokeWidth={stroke} />
              {categories.map((item, i) => {
                const arc = (item.pct / 100) * circumference;
                const el = (
                  <circle
                    key={item.cat}
                    cx={CX} cy={CY} r={R}
                    fill="none"
                    stroke={COLORS[i % COLORS.length]}
                    strokeWidth={stroke}
                    strokeDasharray={`${arc} ${circumference - arc}`}
                    strokeDashoffset={-(offset - circumference / 4)}
                    strokeLinecap="butt"
                  />
                );
                offset += arc;
                return el;
              })}
              <text x={CX} y={CY - 6} textAnchor="middle" fontSize="10" fill="var(--text-muted)">Total</text>
              <text x={CX} y={CY + 10} textAnchor="middle" fontSize="12" fontWeight="800" fill="var(--text)">
                {formatCurrency(total)}
              </text>
            </svg>
            <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>Tap a category below for details</p>
          </div>

          {/* Category list */}
          <div className="card space-y-4">
            <p className="font-bold" style={{ color: 'var(--text)' }}>Categories</p>
            {categories.map((item, i) => {
              const cat = catMeta[item.cat];
              return (
                <div key={item.cat}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{cat?.emoji ?? '📦'}</span>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{cat?.label ?? item.cat}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{formatCurrency(item.amount)}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.pct.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-1.5 rounded-full"
                      style={{ width: `${item.pct}%`, background: COLORS[i % COLORS.length] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
