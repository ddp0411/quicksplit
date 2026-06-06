import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { expensesAPI, EXPENSE_CATEGORIES } from '@/services/api/expensesAPI';
import { useUserStore } from '@/state/userStore';
import { formatCurrency } from '@/utils/upi';
import { formatDate } from '@/utils/helpers';
import { SkeletonRow } from '@/components/ui/SkeletonCard';
import { ArrowLeftIcon, CheckCircleIcon, TrashIcon } from '@heroicons/react/24/outline';

const EMOJI_REACTIONS = ['👍', '❤️', '😂', '😮', '🎉', '🙏'];

function avatarInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

const categoryMap = Object.fromEntries(EXPENSE_CATEGORIES.map(c => [c.value, c]));

export const ExpenseDetail: React.FC = () => {
  const { expenseId } = useParams<{ expenseId: string }>();
  const { user } = useUserStore();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [comment, setComment] = useState('');
  const [reactions, setReactions] = useState<Record<string, string[]>>({});

  const { data: expense, isLoading } = useQuery({
    queryKey: ['expense', expenseId],
    queryFn: () => expensesAPI.getExpense(expenseId!),
    enabled: !!expenseId,
  });

  const addCommentMutation = useMutation({
    mutationFn: (content: string) => expensesAPI.addComment(expenseId!, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expense', expenseId] });
      setComment('');
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: () => expensesAPI.deleteExpense(expenseId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['balances'] });
      navigate(-1);
    },
  });

  const toggleReaction = (emoji: string) => {
    setReactions(prev => {
      const existing = prev[emoji] ?? [];
      const userId = user?.id ?? '';
      return {
        ...prev,
        [emoji]: existing.includes(userId)
          ? existing.filter(id => id !== userId)
          : [...existing, userId],
      };
    });
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg space-y-3 pt-4">
        {[1, 2, 3].map(i => <SkeletonRow key={i} />)}
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <p className="font-bold" style={{ color: 'var(--text)' }}>Expense not found</p>
        <button onClick={() => navigate(-1)} className="mt-3 text-sm font-bold text-primary-600">← Go back</button>
      </div>
    );
  }

  const cat = categoryMap[expense.category];
  const isCreator = expense.created_by.id === user?.id;
  const myShare = expense.shares.find(s => s.user.id === user?.id);
  const totalSettled = expense.shares.filter(s => s.is_settled).reduce((sum, s) => sum + s.amount_owed, 0);
  const settledPct = expense.amount > 0 ? (totalSettled / expense.amount) * 100 : 0;

  return (
    <div className="mx-auto max-w-lg space-y-4 pb-24">
      {/* Hero */}
      <div className="rounded-3xl bg-gradient-to-br from-primary-600 to-primary-800 p-5 text-white shadow-button">
        <div className="mb-4 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-white/70 hover:text-white">
            <ArrowLeftIcon className="h-4 w-4" /> Back
          </button>
          {isCreator && (
            <button
              onClick={() => { if (window.confirm('Delete this expense?')) deleteExpenseMutation.mutate(); }}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 text-white hover:bg-white/25 transition"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-2xl">
            {cat?.emoji ?? '📦'}
          </div>
          <div>
            <p className="text-xs font-bold text-white/60 capitalize">{expense.category}</p>
            <h1 className="font-display text-2xl font-extrabold">{expense.description}</h1>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold text-white/60">Total amount</p>
          <p className="font-display text-4xl font-extrabold">{formatCurrency(expense.amount)}</p>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-white/15 p-3 text-center">
            <p className="text-[10px] font-semibold text-white/60">Paid by</p>
            <p className="mt-0.5 text-sm font-extrabold truncate">{expense.paid_by.id === user?.id ? 'You' : expense.paid_by.name}</p>
          </div>
          <div className="rounded-2xl bg-white/15 p-3 text-center">
            <p className="text-[10px] font-semibold text-white/60">Date</p>
            <p className="mt-0.5 text-sm font-extrabold">{formatDate(expense.date)}</p>
          </div>
          <div className="rounded-2xl bg-white/15 p-3 text-center">
            <p className="text-[10px] font-semibold text-white/60">Your share</p>
            <p className="mt-0.5 text-sm font-extrabold">{myShare ? formatCurrency(myShare.amount_owed) : '—'}</p>
          </div>
        </div>

        {/* Settlement progress */}
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs font-semibold text-white/60">
            <span>{Math.round(settledPct)}% settled</span>
            <span>{formatCurrency(totalSettled)} / {formatCurrency(expense.amount)}</span>
          </div>
          <div className="h-2 rounded-full bg-white/20">
            <div className="h-2 rounded-full bg-emerald-300 transition-all" style={{ width: `${Math.min(settledPct, 100)}%` }} />
          </div>
        </div>
      </div>

      {/* Receipt thumbnail placeholder */}
      <div
        className="card flex cursor-pointer items-center gap-3 border-dashed"
        style={{ borderStyle: 'dashed' }}
        onClick={() => navigate('/scan')}
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-2xl">
          🧾
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Attach receipt</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Scan or upload a photo of the bill</p>
        </div>
        <span className="ml-auto text-xs font-bold text-primary-600">+ Add</span>
      </div>

      {/* Emoji reactions */}
      <div className="card">
        <div className="flex flex-wrap gap-2">
          {EMOJI_REACTIONS.map(emoji => {
            const reacted = (reactions[emoji] ?? []).includes(user?.id ?? '');
            const count = (reactions[emoji] ?? []).length;
            return (
              <button
                key={emoji}
                onClick={() => toggleReaction(emoji)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition ${
                  reacted ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/30' : ''
                }`}
                style={{ borderColor: reacted ? undefined : 'var(--border)' }}
              >
                <span>{emoji}</span>
                {count > 0 && <span className={`text-xs font-bold ${reacted ? 'text-primary-700' : ''}`} style={!reacted ? { color: 'var(--text-muted)' } : undefined}>{count}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Who owes what */}
      <div className="card">
        <div className="mb-3 flex items-center gap-2">
          <CheckCircleIcon className="h-4 w-4 text-primary-600" />
          <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>Who owes what</p>
        </div>
        <div className="space-y-2">
          {expense.shares.map(share => (
            <motion.div
              key={share.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex items-center justify-between gap-3 rounded-2xl border p-3 ${
                share.is_settled ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-900/10' : ''
              }`}
              style={{ borderColor: share.is_settled ? undefined : 'var(--border)' }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-xs font-extrabold text-white"
                  style={{ background: share.user.avatar_color }}>
                  {avatarInitials(share.user.name)}
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                    {share.user.id === user?.id ? 'You' : share.user.name}
                    {share.user.id === expense.paid_by.id && (
                      <span className="ml-2 rounded-full bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 text-[10px] font-bold text-primary-700">paid</span>
                    )}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {share.is_settled ? `Settled ${share.settled_at ? formatDate(share.settled_at) : ''}` : 'Pending'}
                  </p>
                </div>
              </div>
              <p className={`font-extrabold text-sm ${share.is_settled ? 'text-positive line-through' : ''}`} style={!share.is_settled ? { color: 'var(--text)' } : undefined}>
                {formatCurrency(share.amount_owed)}
              </p>
            </motion.div>
          ))}
        </div>

        {expense.notes && (
          <div className="mt-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-3">
            <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Notes</p>
            <p className="mt-1 text-sm" style={{ color: 'var(--text)' }}>{expense.notes}</p>
          </div>
        )}

        {expense.is_recurring && (
          <div className="mt-3 rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10 px-3 py-2">
            <p className="text-xs font-bold text-warning">🔁 Recurring {expense.recurring_frequency}</p>
          </div>
        )}
      </div>

      {/* Group */}
      {expense.group_name && (
        <div className="card flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-900/30 text-xl">
            👥
          </div>
          <div>
            <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Group expense</p>
            <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>{expense.group_name}</p>
          </div>
        </div>
      )}

      {/* Comments */}
      <div className="card space-y-4">
        <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>
          Comments {expense.comments.length > 0 && `(${expense.comments.length})`}
        </p>

        {expense.comments.length > 0 && (
          <div className="space-y-3">
            {expense.comments.map(c => (
              <div key={c.id} className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl text-[10px] font-extrabold text-white"
                  style={{ background: c.user.avatar_color }}>
                  {avatarInitials(c.user.name)}
                </div>
                <div className="flex-1 rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-3">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{c.user.id === user?.id ? 'You' : c.user.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(c.created_at)}</p>
                  </div>
                  <p className="mt-1 text-sm" style={{ color: 'var(--text)' }}>{c.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            value={comment}
            onChange={e => setComment(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey && comment.trim()) {
                e.preventDefault();
                addCommentMutation.mutate(comment.trim());
              }
            }}
            placeholder="Add a comment…"
            className="input-field flex-1"
          />
          <button
            onClick={() => comment.trim() && addCommentMutation.mutate(comment.trim())}
            disabled={!comment.trim() || addCommentMutation.isPending}
            className="rounded-2xl bg-primary-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary-700 disabled:opacity-60"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
