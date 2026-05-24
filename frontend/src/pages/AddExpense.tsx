import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { expensesAPI, EXPENSE_CATEGORIES, type SplitType } from '@/services/api/expensesAPI';
import { groupsAPI } from '@/services/api/groupsAPI';
import { friendsAPI } from '@/services/api/friendsAPI';
import { useUserStore } from '@/state/userStore';
import { getAPIErrorMessage } from '@/services/api/errorMessage';
import { formatCurrency } from '@/utils/upi';

const SPLIT_TYPES = [
  { value: 'equal', label: 'Equally', description: 'Split evenly' },
  { value: 'exact', label: 'Exact', description: 'Enter amounts' },
  { value: 'percentage', label: '%', description: 'By percentage' },
  { value: 'shares', label: 'Shares', description: 'By shares' },
] as const;

interface ShareRow {
  user_id: string;
  name: string;
  value: number;
}

interface FormData {
  description: string;
  amount: string;
  category: string;
  paid_by_user_id: string;
  split_type: SplitType;
  date: string;
  notes: string;
  is_recurring: boolean;
  recurring_frequency: string;
}

interface Participant {
  user_id: string;
  name: string;
  avatar_color: string;
}

export const AddExpense: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get('group');
  const { user } = useUserStore();
  const qc = useQueryClient();

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [shares, setShares] = useState<ShareRow[]>([]);
  const [submitError, setSubmitError] = useState('');

  const { register, handleSubmit, watch } = useForm<FormData>({
    defaultValues: {
      description: '',
      amount: '',
      category: 'other',
      paid_by_user_id: user?.id ?? '',
      split_type: 'equal',
      date: new Date().toISOString().split('T')[0],
      notes: '',
      is_recurring: false,
      recurring_frequency: '',
    },
  });

  const splitType = watch('split_type');
  const amount = parseFloat(watch('amount') || '0');

  // Load group members or friends as candidates
  const { data: group } = useQuery({
    queryKey: ['group', groupId],
    queryFn: () => groupsAPI.getGroup(groupId!),
    enabled: !!groupId,
  });

  const { data: friends = [] } = useQuery({
    queryKey: ['friends'],
    queryFn: friendsAPI.getFriends,
    enabled: !groupId,
  });

  useEffect(() => {
    const base: Participant[] = user ? [{ user_id: user.id, name: user.name, avatar_color: '#5b34cd' }] : [];

    if (groupId && group) {
      const members = group.members
        .filter(m => m.user.id !== user?.id)
        .map(m => ({ user_id: m.user.id, name: m.user.name, avatar_color: m.user.avatar_color }));
      setParticipants([...base, ...members]);
    } else {
      const friendParticipants = friends
        .filter(f => f.user.id !== user?.id)
        .map(f => ({ user_id: f.user.id, name: f.user.name, avatar_color: f.user.avatar_color }));
      setParticipants([...base, ...friendParticipants]);
    }
  }, [group, friends, user, groupId]);

  const [selected, setSelected] = useState<Set<string>>(() => new Set(user ? [user.id] : []));

  useEffect(() => {
    // Sync shares rows with selected participants
    setShares(prev => {
      const result: ShareRow[] = [];
      for (const p of participants) {
        if (selected.has(p.user_id)) {
          const existing = prev.find(s => s.user_id === p.user_id);
          result.push(existing ?? { user_id: p.user_id, name: p.name, value: 0 });
        }
      }
      return result;
    });
  }, [selected, participants]);

  const toggleParticipant = (uid: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(uid)) {
        if (uid === user?.id) return prev;
        next.delete(uid);
      } else {
        next.add(uid);
      }
      return next;
    });
  };

  // Auto-calculate equal shares for preview
  const equalShare = selected.size > 0 && amount > 0
    ? Math.floor(amount * 100 / selected.size) / 100
    : 0;

  const createMutation = useMutation({
    mutationFn: (data: FormData) => {
      const participant_ids = Array.from(selected);
      const sharesPayload = splitType !== 'equal'
        ? shares.map(s => ({ user_id: s.user_id, value: s.value }))
        : [];

      return expensesAPI.createExpense({
        group_id: groupId ?? null,
        description: data.description,
        amount: parseFloat(data.amount),
        currency: 'INR',
        category: data.category as any,
        paid_by_user_id: data.paid_by_user_id,
        split_type: data.split_type,
        date: data.date,
        notes: data.notes,
        is_recurring: data.is_recurring,
        recurring_frequency: data.recurring_frequency || undefined,
        participant_ids: splitType === 'equal' ? participant_ids : [],
        shares: sharesPayload,
      });
    },
    onSuccess: (expense) => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['group-balances', groupId] });
      qc.invalidateQueries({ queryKey: ['balances'] });
      qc.invalidateQueries({ queryKey: ['activity'] });
      navigate(`/expenses/${expense.id}`);
    },
    onError: (err) => setSubmitError(getAPIErrorMessage(err, 'Could not create expense.')),
  });

  const shareSum = shares.reduce((s, r) => s + (r.value || 0), 0);
  const isSharesValid = splitType === 'equal' || (
    splitType === 'exact' ? Math.abs(shareSum - amount) < 0.02 :
    splitType === 'percentage' ? Math.abs(shareSum - 100) < 0.01 :
    shareSum > 0
  );

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="rounded-lg bg-gradient-to-br from-primary-700 to-sky-500 p-5 text-white shadow-button">
        <p className="text-sm font-bold text-white/70">New expense</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold tracking-normal">
          {groupId ? group?.name ?? 'Group expense' : 'Add expense'}
        </h1>
      </div>

      {submitError && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit(d => createMutation.mutate(d))} className="space-y-5">
        <Card>
          <h2 className="mb-4 font-bold text-slate-700">Expense details</h2>
          <div className="space-y-4">
            <Input label="Description" {...register('description', { required: true })} placeholder="Dinner, Petrol, Rent..." />
            <Input
              label="Amount (₹)"
              type="number"
              step="0.01"
              inputMode="decimal"
              {...register('amount', { required: true, min: 0.01 })}
              placeholder="0.00"
            />
            <Input label="Date" type="date" {...register('date', { required: true })} />

            <div>
              <p className="mb-2 text-sm font-semibold text-slate-700">Category</p>
              <div className="grid grid-cols-5 gap-1.5">
                {EXPENSE_CATEGORIES.map(cat => (
                  <label
                    key={cat.value}
                    className={`flex cursor-pointer flex-col items-center gap-1 rounded-lg border p-2 text-center transition ${
                      watch('category') === cat.value
                        ? 'border-primary-400 bg-primary-50 ring-2 ring-primary-200'
                        : 'border-slate-200 hover:border-primary-200'
                    }`}
                  >
                    <input type="radio" value={cat.value} {...register('category')} className="sr-only" />
                    <span className="text-lg">{cat.emoji}</span>
                    <span className="text-[10px] font-bold text-slate-600 leading-tight">{cat.label.split(' ')[0]}</span>
                  </label>
                ))}
              </div>
            </div>

            <Input label="Notes (optional)" {...register('notes')} placeholder="Any details..." />
          </div>
        </Card>

        {/* Who paid */}
        <Card>
          <h2 className="mb-4 font-bold text-slate-700">Paid by</h2>
          <div className="flex flex-wrap gap-2">
            {participants.map(p => (
              <label
                key={p.user_id}
                className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
                  watch('paid_by_user_id') === p.user_id
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-slate-200 text-slate-600 hover:border-primary-300'
                }`}
              >
                <input type="radio" value={p.user_id} {...register('paid_by_user_id')} className="sr-only" />
                <div
                  className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-extrabold text-white"
                  style={{ background: p.avatar_color }}
                >
                  {p.name[0]}
                </div>
                {p.user_id === user?.id ? 'You' : p.name}
              </label>
            ))}
          </div>
        </Card>

        {/* Who splits */}
        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-bold text-slate-700">Split between</h2>
            <div className="flex gap-1">
              {SPLIT_TYPES.map(st => (
                <label
                  key={st.value}
                  className={`cursor-pointer rounded-lg border px-2.5 py-1 text-xs font-bold transition ${
                    splitType === st.value
                      ? 'border-primary-500 bg-primary-600 text-white'
                      : 'border-slate-200 text-slate-600 hover:border-primary-300'
                  }`}
                >
                  <input type="radio" value={st.value} {...register('split_type')} className="sr-only" />
                  {st.label}
                </label>
              ))}
            </div>
          </div>

          {/* Participant toggles */}
          <div className="mb-4 flex flex-wrap gap-2">
            {participants.map(p => {
              const isSelected = selected.has(p.user_id);
              return (
                <button
                  key={p.user_id}
                  type="button"
                  onClick={() => toggleParticipant(p.user_id)}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-slate-200 text-slate-400'
                  }`}
                >
                  <div
                    className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-extrabold text-white"
                    style={{ background: isSelected ? p.avatar_color : '#94a3b8' }}
                  >
                    {p.name[0]}
                  </div>
                  {p.user_id === user?.id ? 'You' : p.name}
                </button>
              );
            })}
          </div>

          {/* Share input rows */}
          {splitType === 'equal' ? (
            <div className="space-y-2">
              {Array.from(selected).map(uid => {
                const p = participants.find(x => x.user_id === uid);
                return p ? (
                  <div key={uid} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                    <span className="font-semibold text-slate-700">{uid === user?.id ? 'You' : p.name}</span>
                    <span className="font-extrabold text-primary-700">{formatCurrency(equalShare)}</span>
                  </div>
                ) : null;
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {shares.map((share, idx) => (
                <div key={share.user_id} className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2">
                  <span className="flex-1 font-semibold text-slate-700 text-sm">
                    {share.user_id === user?.id ? 'You' : share.name}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={share.value || ''}
                    onChange={e => {
                      const v = parseFloat(e.target.value) || 0;
                      setShares(prev => prev.map((s, i) => i === idx ? { ...s, value: v } : s));
                    }}
                    className="w-24 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-right text-sm font-bold focus:border-primary-500 focus:outline-none"
                    placeholder={splitType === 'percentage' ? '33.33' : splitType === 'shares' ? '1' : '0.00'}
                  />
                  <span className="text-sm font-semibold text-slate-400 w-4">
                    {splitType === 'percentage' ? '%' : splitType === 'shares' ? 'sh' : '₹'}
                  </span>
                </div>
              ))}

              <div className={`flex justify-between rounded-lg px-3 py-2 text-sm font-bold ${
                isSharesValid ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}>
                <span>Sum</span>
                <span>
                  {shareSum.toFixed(2)}{splitType === 'percentage' ? '%' : splitType === 'shares' ? ' shares' : ''}
                  {splitType === 'exact' && ` / ${amount.toFixed(2)}`}
                  {splitType === 'percentage' && ' / 100%'}
                </span>
              </div>
            </div>
          )}
        </Card>

        {/* Recurring */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900">Recurring expense</p>
              <p className="text-sm text-slate-500">Automatically remind each period</p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" {...register('is_recurring')} className="sr-only peer" />
              <div className="peer h-6 w-11 rounded-full bg-slate-200 transition peer-checked:bg-primary-600 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition after:content-[''] peer-checked:after:translate-x-full" />
            </label>
          </div>
          {watch('is_recurring') && (
            <div className="mt-4">
              <select
                {...register('recurring_frequency')}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm"
              >
                <option value="">Select frequency</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          )}
        </Card>

        <div className="flex gap-3 pb-4">
          <Button type="button" variant="secondary" className="flex-1" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button
            type="submit"
            loading={createMutation.isPending}
            disabled={!isSharesValid}
            className="flex-1"
          >
            Save expense
          </Button>
        </div>
      </form>
    </div>
  );
};
