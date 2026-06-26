import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { groupsAPI } from '@/services/api/groupsAPI';
import { expensesAPI, EXPENSE_CATEGORIES } from '@/services/api/expensesAPI';
import { formatCurrency } from '@/utils/upi';

const catMeta = Object.fromEntries(EXPENSE_CATEGORIES.map(c => [c.value, c]));
const COLORS = ['#0F4B70', '#2BB673', '#F4A300', '#E74C3C', '#8B5CF6', '#F59E0B', '#3B82F6', '#EC4899'];

export const GroupInsights: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();

  const { data: group } = useQuery({
    queryKey: ['group', groupId],
    queryFn: () => groupsAPI.getGroup(groupId!),
    enabled: !!groupId,
  });

  const { data: balances } = useQuery({
    queryKey: ['group-balances', groupId],
    queryFn: () => groupsAPI.getBalances(groupId!),
    enabled: !!groupId,
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses', { group_id: groupId }],
    queryFn: () => expensesAPI.getExpenses({ group_id: groupId }),
    enabled: !!groupId,
  });

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  // Category breakdown
  const byCat: Record<string, number> = {};
  expenses.forEach(e => { byCat[e.category] = (byCat[e.category] ?? 0) + e.amount; });
  const categories = Object.entries(byCat)
    .map(([cat, amount]) => ({ cat, amount, pct: total > 0 ? (amount / total) * 100 : 0 }))
    .sort((a, b) => b.amount - a.amount);

  // Per-member spending
  const byMember: Record<string, { name: string; color: string; amount: number }> = {};
  expenses.forEach(e => {
    if (!byMember[e.paid_by.id]) byMember[e.paid_by.id] = { name: e.paid_by.name, color: e.paid_by.avatar_color, amount: 0 };
    byMember[e.paid_by.id].amount += e.amount;
  });
  const members = Object.values(byMember).sort((a, b) => b.amount - a.amount);
  const maxMemberAmount = members[0]?.amount ?? 1;

  // SVG donut
  const R = 60, CX = 80, CY = 80, stroke = 24;
  const circumference = 2 * Math.PI * R;
  let arcOffset = 0;

  return (
    <div className="mx-auto max-w-lg space-y-5 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to={`/groups/${groupId}`}
          className="flex h-9 w-9 items-center justify-center rounded-2xl transition hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ArrowLeftIcon className="h-5 w-5" style={{ color: 'var(--text)' }} />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-extrabold" style={{ color: 'var(--text)' }}>Group Insights</h1>
          {group && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{group.name}</p>}
        </div>
      </div>

      {/* Total */}
      <div className="card">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Total group spending</p>
        <p className="font-display text-3xl font-extrabold text-primary-600">{formatCurrency(total)}</p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{expenses.length} expenses</p>
      </div>

      {expenses.length === 0 ? (
        <div className="card py-14 text-center">
          <p className="text-3xl">📊</p>
          <p className="mt-3 font-semibold" style={{ color: 'var(--text-muted)' }}>No expenses to analyze yet</p>
        </div>
      ) : (
        <>
          {/* Who spent most — bar chart */}
          {members.length > 0 && (
            <div className="card space-y-4">
              <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>Who paid most</p>
              {members.map((m, i) => (
                <div key={m.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-[10px] font-extrabold text-white"
                        style={{ background: m.color }}
                      >
                        {m.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{m.name}</p>
                    </div>
                    <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{formatCurrency(m.amount)}</p>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${(m.amount / maxMemberAmount) * 100}%`,
                        background: COLORS[i % COLORS.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Category donut */}
          {categories.length > 0 && (
            <div className="card flex flex-col items-center">
              <p className="mb-4 text-sm font-bold" style={{ color: 'var(--text)' }}>Spending by category</p>
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
                      strokeDashoffset={-(arcOffset - circumference / 4)}
                      strokeLinecap="butt"
                    />
                  );
                  arcOffset += arc;
                  return el;
                })}
                <text x={CX} y={CY - 6} textAnchor="middle" fontSize="10" fill="var(--text-muted)">Total</text>
                <text x={CX} y={CY + 10} textAnchor="middle" fontSize="12" fontWeight="800" fill="var(--text)">
                  {formatCurrency(total)}
                </text>
              </svg>
              <div className="mt-4 w-full space-y-3">
                {categories.map((item, i) => {
                  const cat = catMeta[item.cat];
                  return (
                    <div key={item.cat}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{cat?.emoji ?? '📦'}</span>
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
            </div>
          )}

          {/* Simplified debts */}
          {balances && balances.simplified_debts.length > 0 && (
            <div className="card space-y-3">
              <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>
                Settlement plan ({balances.simplified_debts.length} payments)
              </p>
              {balances.simplified_debts.map((debt, i) => (
                <div key={i} className="flex items-center justify-between gap-3 rounded-2xl border p-3" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text)' }}>
                    <span className="font-semibold">{debt.from_user.name}</span>
                    <span style={{ color: 'var(--text-muted)' }}>→</span>
                    <span className="font-semibold">{debt.to_user.name}</span>
                  </div>
                  <span className="font-extrabold text-sm text-positive">{formatCurrency(debt.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
