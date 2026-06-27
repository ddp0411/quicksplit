import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { EXPENSE_CATEGORIES } from '@/services/api/expensesAPI';
import { formatCurrency } from '@/utils/upi';

interface Budget { category: string; limit: number; spent: number; }

function loadBudgets(): Budget[] {
  try { return JSON.parse(localStorage.getItem('qs_budgets') ?? '[]'); } catch { return []; }
}
function saveBudgets(b: Budget[]) { localStorage.setItem('qs_budgets', JSON.stringify(b)); }

const daysLeft = () => {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return end.getDate() - now.getDate();
};

export const BudgetDashboard: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>(loadBudgets);
  const [adding, setAdding] = useState(false);
  const [newCat, setNewCat] = useState('food');
  const [newLimit, setNewLimit] = useState('');

  const totalBudget = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const pct = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;

  const addBudget = () => {
    if (!newLimit) return;
    const updated = [...budgets, { category: newCat, limit: parseFloat(newLimit), spent: 0 }];
    setBudgets(updated);
    saveBudgets(updated);
    setAdding(false);
    setNewLimit('');
  };

  const catMeta = Object.fromEntries(EXPENSE_CATEGORIES.map(c => [c.value, c]));

  return (
    <div className="mx-auto max-w-lg space-y-5 pb-8">
      <div className="flex items-center gap-3">
        <Link to="/personal" className="flex h-9 w-9 items-center justify-center rounded-2xl transition hover:bg-slate-100 dark:hover:bg-slate-800">
          <ArrowLeftIcon className="h-5 w-5" style={{ color: 'var(--text)' }} />
        </Link>
        <h1 className="font-display text-2xl font-extrabold" style={{ color: 'var(--text)' }}>Budgets</h1>
      </div>

      {/* Total ring */}
      {totalBudget > 0 && (
        <div className="card flex items-center gap-6">
          <svg width="88" height="88" viewBox="0 0 88 88">
            <circle cx="44" cy="44" r="38" fill="none" stroke="var(--border)" strokeWidth="10" />
            <circle
              cx="44" cy="44" r="38" fill="none"
              stroke={pct > 80 ? '#F4A300' : '#0F4B70'}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 38}`}
              strokeDashoffset={`${2 * Math.PI * 38 * (1 - pct / 100)}`}
              transform="rotate(-90 44 44)"
            />
            <text x="44" y="48" textAnchor="middle" fontSize="14" fontWeight="800" fill="var(--text)">
              {Math.round(pct)}%
            </text>
          </svg>
          <div>
            <p className="font-extrabold text-xl" style={{ color: 'var(--text)' }}>{formatCurrency(totalSpent)}</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>of {formatCurrency(totalBudget)} budget</p>
            <p className="mt-1 text-xs font-semibold text-warning">⚠ {daysLeft()} days left this month</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatCurrency(Math.max(0, totalBudget - totalSpent))} remaining</p>
          </div>
        </div>
      )}

      {/* Category budgets */}
      {budgets.map((b, i) => {
        const cat = catMeta[b.category];
        const p = b.limit > 0 ? Math.min((b.spent / b.limit) * 100, 100) : 0;
        const status = p >= 100 ? 'OVER' : p >= 80 ? 'NEAR LIMIT' : 'ON TRACK';
        const statusColor = p >= 100 ? 'bg-negative' : p >= 80 ? 'bg-warning' : 'bg-positive';
        return (
          <div key={i} className="card">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{cat?.emoji ?? '📦'}</span>
                <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{cat?.label ?? b.category}</p>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white ${statusColor}`}>{status}</span>
            </div>
            <div className="flex justify-between text-xs mb-1.5">
              <span style={{ color: 'var(--text-muted)' }}>{formatCurrency(b.spent)} spent</span>
              <span style={{ color: 'var(--text-muted)' }}>{formatCurrency(b.limit)} limit</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
              <div className={`h-2 rounded-full transition-all ${statusColor}`} style={{ width: `${p}%` }} />
            </div>
            <p className="mt-1 text-right text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
              {formatCurrency(Math.max(0, b.limit - b.spent))} remaining
            </p>
          </div>
        );
      })}

      {/* Add budget */}
      {adding ? (
        <div className="card space-y-3">
          <p className="font-bold" style={{ color: 'var(--text)' }}>New budget</p>
          <select
            value={newCat}
            onChange={e => setNewCat(e.target.value)}
            className="input-field"
          >
            {EXPENSE_CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
            ))}
          </select>
          <input
            type="number"
            className="input-field"
            placeholder="Monthly limit (₹)"
            value={newLimit}
            onChange={e => setNewLimit(e.target.value)}
          />
          <div className="flex gap-2">
            <Button className="flex-1" onClick={addBudget}>Add budget</Button>
            <Button variant="secondary" className="flex-1" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-4 text-sm font-bold text-primary-600 transition hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20"
          style={{ borderColor: 'var(--border)' }}
        >
          <PlusIcon className="h-4 w-4" />
          Add budget category
        </button>
      )}
    </div>
  );
};
