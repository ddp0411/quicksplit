import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/utils/upi';

interface Subscription { name: string; amount: number; frequency: string; nextDate: string; icon: string; }

const defaults: Subscription[] = [
  { name: 'Netflix', amount: 649, frequency: 'Monthly', nextDate: '2026-06-12', icon: '🎬' },
  { name: 'Spotify', amount: 119, frequency: 'Monthly', nextDate: '2026-06-26', icon: '🎵' },
];

function load(): Subscription[] {
  try { return JSON.parse(localStorage.getItem('qs_subs') ?? 'null') ?? defaults; } catch { return defaults; }
}
function save(s: Subscription[]) { localStorage.setItem('qs_subs', JSON.stringify(s)); }

export const SubscriptionTracker: React.FC = () => {
  const [subs, setSubs] = useState<Subscription[]>(load);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', amount: '', frequency: 'Monthly', nextDate: '', icon: '📦' });

  const total = subs.reduce((s, sub) => s + sub.amount, 0);

  const addSub = () => {
    if (!form.name || !form.amount) return;
    const updated = [...subs, { ...form, amount: parseFloat(form.amount) }];
    setSubs(updated); save(updated);
    setAdding(false);
    setForm({ name: '', amount: '', frequency: 'Monthly', nextDate: '', icon: '📦' });
  };

  const remove = (i: number) => {
    const updated = subs.filter((_, idx) => idx !== i);
    setSubs(updated); save(updated);
  };

  return (
    <div className="mx-auto max-w-lg space-y-5 pb-8">
      <div className="flex items-center gap-3">
        <Link to="/personal" className="flex h-9 w-9 items-center justify-center rounded-2xl transition hover:bg-slate-100 dark:hover:bg-slate-800">
          <ArrowLeftIcon className="h-5 w-5" style={{ color: 'var(--text)' }} />
        </Link>
        <h1 className="font-display text-2xl font-extrabold" style={{ color: 'var(--text)' }}>Subscriptions</h1>
      </div>

      {/* Summary */}
      <div className="card">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Expected this month</p>
        <p className="font-display text-3xl font-extrabold text-primary-600">{formatCurrency(total)}</p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{subs.length} recurring expenses</p>
      </div>

      {/* List */}
      <div className="card divide-y" style={{ '--tw-divide-color': 'var(--border)' } as React.CSSProperties}>
        {subs.map((sub, i) => (
          <div key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-xl">
              {sub.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{sub.name}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{sub.frequency}{sub.nextDate ? ` · ${sub.nextDate}` : ''}</p>
            </div>
            <p className="font-bold text-sm text-primary-600">{formatCurrency(sub.amount)}</p>
            <button onClick={() => remove(i)} className="text-slate-300 hover:text-negative transition">
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add */}
      {adding ? (
        <div className="card space-y-3">
          <p className="font-bold" style={{ color: 'var(--text)' }}>New subscription</p>
          <div className="flex gap-2">
            <input className="input-field w-16" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="🎬" />
            <input className="input-field flex-1" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Netflix" />
          </div>
          <input type="number" className="input-field" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="Amount (₹)" />
          <select className="input-field" value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}>
            <option>Monthly</option><option>Yearly</option><option>Quarterly</option>
          </select>
          <input type="date" className="input-field" value={form.nextDate} onChange={e => setForm(f => ({ ...f, nextDate: e.target.value }))} />
          <div className="flex gap-2">
            <Button className="flex-1" onClick={addSub}>Add</Button>
            <Button variant="secondary" className="flex-1" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-4 text-sm font-bold text-primary-600 transition hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20"
          style={{ borderColor: 'var(--border)' }}
        >
          <PlusIcon className="h-4 w-4" /> Add subscription
        </button>
      )}
    </div>
  );
};
