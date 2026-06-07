import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { friendsAPI } from '@/services/api/friendsAPI';
import { balancesAPI } from '@/services/api/balancesAPI';
import { expensesAPI, EXPENSE_CATEGORIES } from '@/services/api/expensesAPI';
import { useUserStore } from '@/state/userStore';
import { formatCurrency } from '@/utils/upi';
import { formatDate } from '@/utils/helpers';
import { Button } from '@/components/ui/Button';
import { SkeletonRow } from '@/components/ui/SkeletonCard';
import { ExpenseBadge, type BadgeType } from '@/components/ui/ExpenseBadge';

const catMeta = Object.fromEntries(EXPENSE_CATEGORIES.map(c => [c.value, c]));

function avatarInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export const FriendDetail: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: me } = useUserStore();
  const [tab, setTab] = useState<'expenses' | 'settlements'>('expenses');

  const { data: friends = [], isLoading: friendsLoading } = useQuery({
    queryKey: ['friends'],
    queryFn: friendsAPI.getFriends,
  });

  const { data: overview } = useQuery({
    queryKey: ['balances'],
    queryFn: balancesAPI.getOverallBalance,
  });

  const { data: expenses = [], isLoading: expLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => expensesAPI.getExpenses({}),
  });

  const friend = friends.find(f => f.user.id === userId);
  const balanceEntry = overview?.balances.find(b => b.user.id === userId);
  const balance = balanceEntry?.balance ?? 0;

  const sharedExpenses = expenses.filter(e =>
    e.paid_by.id === userId || (e.paid_by.id === me?.id && e.your_share > 0)
  );

  if (friendsLoading) {
    return (
      <div className="mx-auto max-w-lg space-y-3 pt-4">
        {[1, 2, 3].map(i => <SkeletonRow key={i} />)}
      </div>
    );
  }

  if (!friend) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <p className="text-lg font-bold" style={{ color: 'var(--text)' }}>Friend not found</p>
        <Link to="/friends" className="mt-3 inline-block text-sm font-bold text-primary-600">← Back to friends</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-5 pb-8">
      {/* Hero */}
      <div
        className={`rounded-3xl p-6 text-white shadow-button ${
          balance >= 0 ? 'bg-gradient-to-br from-positive to-emerald-700' : 'bg-gradient-to-br from-negative to-rose-700'
        }`}
      >
        <button onClick={() => navigate('/friends')} className="mb-4 flex items-center gap-2 text-sm font-bold text-white/70 hover:text-white">
          <ArrowLeftIcon className="h-4 w-4" /> Friends
        </button>
        <div className="flex items-center gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-3xl text-lg font-extrabold text-white"
            style={{ background: friend.user.avatar_color }}
          >
            {avatarInitials(friend.user.name)}
          </div>
          <div className="flex-1">
            <p className="font-extrabold text-xl">{friend.user.name}</p>
            {Math.abs(balance) > 0.01 && (
              <p className="text-sm text-white/80">
                {balance < 0 ? 'You owe' : 'Owes you'} {formatCurrency(Math.abs(balance))}
              </p>
            )}
            {Math.abs(balance) <= 0.01 && (
              <p className="text-sm text-white/80">All settled up!</p>
            )}
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button
            size="sm"
            className="bg-white/20 text-white hover:bg-white/30 border-0"
            onClick={() => navigate(`/settle-up/${userId}`)}
          >
            Settle up
          </Button>
          <Button
            size="sm"
            className="bg-white/20 text-white hover:bg-white/30 border-0"
            onClick={() => navigate(`/expenses/new`)}
          >
            Add expense
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-2xl border p-1" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
        {(['expenses', 'settlements'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-xl py-2 text-sm font-bold capitalize transition ${
              tab === t ? 'bg-primary-600 text-white' : ''
            }`}
            style={tab !== t ? { color: 'var(--text-muted)' } : undefined}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'expenses' && (
        <div className="card">
          {expLoading ? (
            <div className="space-y-3">{[1, 2, 3].map(i => <SkeletonRow key={i} />)}</div>
          ) : sharedExpenses.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-2xl">🤝</p>
              <p className="mt-2 font-semibold" style={{ color: 'var(--text-muted)' }}>No shared expenses yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sharedExpenses.map(exp => {
                const cat = catMeta[exp.category];
                const youPaid = exp.paid_by.id === me?.id;
                const badge: BadgeType = youPaid
                  ? (exp.your_share < exp.amount ? 'owes-you' : 'you-paid')
                  : 'you-owe';
                const shareLabel = youPaid
                  ? formatCurrency(exp.amount - exp.your_share)
                  : formatCurrency(exp.your_share);
                return (
                  <Link key={exp.id} to={`/expenses/${exp.id}`} className="flex items-center gap-3 rounded-2xl border p-3 transition hover:border-primary-300 hover:bg-primary-50/50 dark:hover:bg-primary-900/10" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-lg">
                      {cat?.emoji ?? '📦'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate font-semibold text-sm" style={{ color: 'var(--text)' }}>{exp.description}</p>
                        <ExpenseBadge type={badge} />
                      </div>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {youPaid ? 'You paid' : `${exp.paid_by.name} paid`} · {formatDate(exp.date)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>{formatCurrency(exp.amount)}</p>
                      <p className={`text-xs font-extrabold ${youPaid ? 'text-accent-500' : 'text-negative'}`}>
                        {shareLabel} each
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'settlements' && (
        <div className="card py-10 text-center">
          <p className="text-2xl">✅</p>
          <p className="mt-2 font-semibold" style={{ color: 'var(--text-muted)' }}>Settlement history coming soon</p>
        </div>
      )}
    </div>
  );
};
