import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { expensesAPI, EXPENSE_CATEGORIES } from '@/services/api/expensesAPI';
import { useUserStore } from '@/state/userStore';
import { formatCurrency } from '@/utils/upi';
import { formatDate } from '@/utils/helpers';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ChatBubbleLeftIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

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

  if (isLoading) {
    return (
      <div className="space-y-4 mx-auto max-w-2xl">
        {[0, 1, 2].map(i => <div key={i} className="h-28 animate-pulse rounded-lg bg-white shadow-soft" />)}
      </div>
    );
  }

  if (!expense) {
    return (
      <Card className="mx-auto max-w-md text-center">
        <p className="font-bold text-slate-900">Expense not found</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate(-1)}>Go back</Button>
      </Card>
    );
  }

  const cat = categoryMap[expense.category];
  const isCreator = expense.created_by.id === user?.id;
  const myShare = expense.shares.find(s => s.user.id === user?.id);
  const totalSettled = expense.shares.filter(s => s.is_settled).reduce((sum, s) => sum + s.amount_owed, 0);
  const settledPct = expense.amount > 0 ? (totalSettled / expense.amount) * 100 : 0;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {/* Hero */}
      <div className="rounded-lg bg-gradient-to-br from-primary-700 to-primary-500 p-5 text-white shadow-button">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-white/75 hover:text-white"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back
        </button>

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/15 text-2xl">
              {cat?.emoji ?? '📦'}
            </span>
            <div>
              <p className="text-sm font-bold text-white/70 capitalize">{expense.category}</p>
              <h1 className="font-display text-2xl font-extrabold tracking-normal">{expense.description}</h1>
            </div>
          </div>
          {isCreator && (
            <Button
              size="sm"
              variant="ghost"
              className="shrink-0 bg-white/10 text-white hover:bg-white/20"
              onClick={() => {
                if (window.confirm('Delete this expense?')) deleteExpenseMutation.mutate();
              }}
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="mt-5">
          <p className="text-sm font-semibold text-white/70">Total</p>
          <p className="text-4xl font-extrabold">{formatCurrency(expense.amount)}</p>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg bg-white/12 p-2.5">
            <p className="text-xs font-semibold text-white/70">Paid by</p>
            <p className="mt-1 text-sm font-extrabold">{expense.paid_by.id === user?.id ? 'You' : expense.paid_by.name}</p>
          </div>
          <div className="rounded-lg bg-white/12 p-2.5">
            <p className="text-xs font-semibold text-white/70">Date</p>
            <p className="mt-1 text-sm font-extrabold">{expense.date}</p>
          </div>
          <div className="rounded-lg bg-white/12 p-2.5">
            <p className="text-xs font-semibold text-white/70">Your share</p>
            <p className="mt-1 text-sm font-extrabold">{myShare ? formatCurrency(myShare.amount_owed) : '—'}</p>
          </div>
        </div>

        {/* Settlement progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs font-semibold text-white/70 mb-1">
            <span>{settledPct.toFixed(0)}% settled</span>
            <span>{formatCurrency(totalSettled)} / {formatCurrency(expense.amount)}</span>
          </div>
          <div className="h-2 rounded-full bg-white/20">
            <div
              className="h-2 rounded-full bg-emerald-300 transition-all"
              style={{ width: `${Math.min(settledPct, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Group */}
      {expense.group_name && (
        <Card className="flex items-center gap-3 bg-slate-50">
          <span className="rounded-lg bg-primary-50 p-2 text-primary-700 text-lg">👥</span>
          <div>
            <p className="text-xs font-semibold text-slate-500">Group expense</p>
            <p className="font-bold text-slate-900">{expense.group_name}</p>
          </div>
        </Card>
      )}

      {/* Shares */}
      <Card>
        <div className="mb-4 flex items-center gap-3">
          <span className="rounded-lg bg-primary-50 p-2 text-primary-700">
            <CheckCircleIcon className="h-5 w-5" />
          </span>
          <h2 className="font-display text-xl font-bold text-ink">Who owes what</h2>
        </div>

        <div className="space-y-3">
          {expense.shares.map(share => (
            <motion.div
              key={share.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex items-center justify-between gap-3 rounded-lg border p-3 ${
                share.is_settled
                  ? 'border-emerald-200 bg-emerald-50/60'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-white"
                  style={{ background: share.user.avatar_color }}
                >
                  {avatarInitials(share.user.name)}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900">
                    {share.user.id === user?.id ? 'You' : share.user.name}
                    {share.user.id === expense.paid_by.id && (
                      <span className="ml-2 rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-bold text-primary-700">paid</span>
                    )}
                  </p>
                  <p className="text-xs text-slate-400">
                    {share.is_settled ? `Settled ${share.settled_at ? formatDate(share.settled_at) : ''}` : 'Pending'}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className={`font-extrabold ${share.is_settled ? 'text-emerald-600 line-through' : 'text-slate-900'}`}>
                  {formatCurrency(share.amount_owed)}
                </p>
                {share.is_settled && (
                  <CheckCircleIcon className="ml-auto h-4 w-4 text-emerald-600" />
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {expense.notes && (
          <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-3">
            <p className="text-xs font-semibold text-slate-500">Notes</p>
            <p className="mt-1 text-sm text-slate-700">{expense.notes}</p>
          </div>
        )}

        {expense.is_recurring && (
          <div className="mt-3 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2">
            <p className="text-xs font-bold text-amber-700">
              🔁 Recurring {expense.recurring_frequency}
            </p>
          </div>
        )}
      </Card>

      {/* Comments */}
      <Card>
        <div className="mb-4 flex items-center gap-3">
          <span className="rounded-lg bg-slate-100 p-2 text-slate-700">
            <ChatBubbleLeftIcon className="h-5 w-5" />
          </span>
          <h2 className="font-display text-xl font-bold text-ink">
            Comments {expense.comments.length > 0 && `(${expense.comments.length})`}
          </h2>
        </div>

        {expense.comments.length > 0 && (
          <div className="mb-4 space-y-3">
            {expense.comments.map(c => (
              <div key={c.id} className="flex gap-3">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-white"
                  style={{ background: c.user.avatar_color }}
                >
                  {avatarInitials(c.user.name)}
                </div>
                <div className="flex-1 rounded-lg bg-slate-50 p-3">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-900">{c.user.id === user?.id ? 'You' : c.user.name}</p>
                    <p className="text-xs text-slate-400">{formatDate(c.created_at)}</p>
                  </div>
                  <p className="mt-1 text-sm text-slate-700">{c.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <input
            value={comment}
            onChange={e => setComment(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey && comment.trim()) {
                e.preventDefault();
                addCommentMutation.mutate(comment.trim());
              }
            }}
            placeholder="Add a comment..."
            className="flex-1 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
          />
          <Button
            onClick={() => comment.trim() && addCommentMutation.mutate(comment.trim())}
            loading={addCommentMutation.isPending}
            disabled={!comment.trim()}
            size="sm"
          >
            Send
          </Button>
        </div>
      </Card>
    </div>
  );
};
