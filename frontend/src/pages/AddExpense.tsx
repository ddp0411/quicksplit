import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { expensesAPI, EXPENSE_CATEGORIES, type SplitType } from '@/services/api/expensesAPI';
import { groupsAPI } from '@/services/api/groupsAPI';
import { friendsAPI } from '@/services/api/friendsAPI';
import { useUserStore } from '@/state/userStore';
import { getAPIErrorMessage } from '@/services/api/errorMessage';
import { formatCurrency } from '@/utils/upi';
import {
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CalendarIcon,
  UserGroupIcon,
  CameraIcon,
  DocumentTextIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

const SPLIT_TYPES: { value: SplitType; label: string }[] = [
  { value: 'equal', label: 'Equally' },
  { value: 'exact', label: 'Exact' },
  { value: 'percentage', label: '%' },
  { value: 'shares', label: 'Shares' },
];

interface Participant { user_id: string; name: string; avatar_color: string; }
interface ShareRow { user_id: string; name: string; value: number; }

export const AddExpense: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get('group');
  const amountParam = searchParams.get('amount');
  const { user } = useUserStore();
  const qc = useQueryClient();

  // Form state
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(amountParam ?? '');
  const [category, setCategory] = useState('other');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFreq, setRecurringFreq] = useState('');
  const [paidByUserId, setPaidByUserId] = useState(user?.id ?? '');
  const [splitType, setSplitType] = useState<SplitType>('equal');
  const [selected, setSelected] = useState<Set<string>>(new Set(user ? [user.id] : []));
  const [shares, setShares] = useState<ShareRow[]>([]);

  // UI state
  const [splitOpen, setSplitOpen] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);

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
    const base: Participant[] = user ? [{ user_id: user.id, name: user.name, avatar_color: '#0F9D94' }] : [];
    if (groupId && group) {
      const members = group.members
        .filter(m => m.user.id !== user?.id)
        .map(m => ({ user_id: m.user.id, name: m.user.name, avatar_color: m.user.avatar_color }));
      setParticipants([...base, ...members]);
    } else {
      const friendPs = friends
        .filter(f => f.user.id !== user?.id)
        .map(f => ({ user_id: f.user.id, name: f.user.name, avatar_color: f.user.avatar_color }));
      setParticipants([...base, ...friendPs]);
    }
  }, [group, friends, user, groupId]);

  useEffect(() => {
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
    if (uid === user?.id) return;
    setSelected(prev => {
      const next = new Set(prev);
      next.has(uid) ? next.delete(uid) : next.add(uid);
      return next;
    });
  };

  const amountNum = parseFloat(amount || '0');
  const equalShare = selected.size > 0 && amountNum > 0 ? Math.floor(amountNum * 100 / selected.size) / 100 : 0;
  const shareSum = shares.reduce((s, r) => s + (r.value || 0), 0);
  const isSharesValid = splitType === 'equal' || (
    splitType === 'exact' ? Math.abs(shareSum - amountNum) < 0.02 :
    splitType === 'percentage' ? Math.abs(shareSum - 100) < 0.01 :
    shareSum > 0
  );

  const selectedCat = EXPENSE_CATEGORIES.find(c => c.value === category);

  const splitSummary = () => {
    const payer = paidByUserId === user?.id ? 'You' : participants.find(p => p.user_id === paidByUserId)?.name ?? 'Someone';
    const splitDesc = splitType === 'equal' ? 'split equally' : `split by ${splitType}`;
    return `${payer} paid and ${splitDesc}`;
  };

  const createMutation = useMutation({
    mutationFn: () => {
      const participant_ids = Array.from(selected);
      const sharesPayload = splitType !== 'equal'
        ? shares.map(s => ({ user_id: s.user_id, value: s.value }))
        : [];
      return expensesAPI.createExpense({
        group_id: groupId ?? null,
        description,
        amount: amountNum,
        currency: 'INR',
        category: category as any,
        paid_by_user_id: paidByUserId,
        split_type: splitType,
        date,
        notes,
        is_recurring: isRecurring,
        recurring_frequency: recurringFreq || undefined,
        participant_ids: splitType === 'equal' ? participant_ids : [],
        shares: sharesPayload,
      });
    },
    onSuccess: (expense) => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['group-balances', groupId] });
      qc.invalidateQueries({ queryKey: ['balances'] });
      navigate(`/expenses/${expense.id}`);
    },
    onError: (err) => setSubmitError(getAPIErrorMessage(err, 'Could not create expense.')),
  });

  const handleSave = () => {
    if (!description.trim()) { setSubmitError('Enter a description'); return; }
    if (!amountNum || amountNum <= 0) { setSubmitError('Enter a valid amount'); return; }
    if (!isSharesValid) { setSubmitError('Shares must balance correctly'); return; }
    setSubmitError('');
    createMutation.mutate();
  };

  return (
    <div className="mx-auto max-w-lg pb-24">
      {/* Header bar */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-2xl transition hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <XMarkIcon className="h-5 w-5" style={{ color: 'var(--text)' }} />
        </button>
        <h1 className="font-display text-base font-extrabold" style={{ color: 'var(--text)' }}>
          {groupId ? group?.name ?? 'Add expense' : 'Add an expense'}
        </h1>
        <button
          onClick={handleSave}
          disabled={createMutation.isPending}
          className="rounded-2xl bg-accent-500 px-4 py-1.5 text-sm font-bold text-white transition hover:bg-accent-600 disabled:opacity-60"
        >
          {createMutation.isPending ? '…' : 'Save'}
        </button>
      </div>

      {submitError && (
        <div className="mb-3 rounded-2xl border border-rose-200 bg-rose-50 dark:bg-rose-900/20 p-3 text-sm font-semibold text-negative">
          {submitError}
        </div>
      )}

      {/* "With you and:" chip picker */}
      <div className="card mb-3">
        <p className="mb-2 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>With you and:</p>
        <div className="flex flex-wrap gap-2">
          {participants.map(p => {
            const isMe = p.user_id === user?.id;
            const isSelected = selected.has(p.user_id);
            return (
              <button
                key={p.user_id}
                onClick={() => toggleParticipant(p.user_id)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold transition ${
                  isSelected
                    ? 'text-white'
                    : 'border'
                }`}
                style={isSelected
                  ? { background: p.avatar_color }
                  : { borderColor: 'var(--border)', color: 'var(--text-muted)' }
                }
              >
                <span className="text-xs">{isMe ? '👤' : p.name[0].toUpperCase()}</span>
                {isMe ? 'You' : p.name}
                {isSelected && !isMe && <CheckIcon className="h-3 w-3" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Description + Amount — the two hero fields */}
      <div className="card mb-3 space-y-4">
        <div className="flex items-center gap-3">
          {/* Category icon as left adornment */}
          <button
            onClick={() => setSplitOpen(v => !v)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-xl"
          >
            {selectedCat?.emoji ?? '📦'}
          </button>
          <input
            autoFocus
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="flex-1 bg-transparent text-base font-semibold focus:outline-none"
            style={{ color: 'var(--text)' }}
            placeholder="What was it for?"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-2xl font-extrabold text-primary-600">₹</span>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            inputMode="decimal"
            className="flex-1 bg-transparent font-display text-4xl font-extrabold focus:outline-none"
            style={{ color: 'var(--text)' }}
            placeholder="0"
          />
        </div>
      </div>

      {/* Category grid (collapsed by default) */}
      <AnimatePresence>
        {splitOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 overflow-hidden"
          >
            <div className="card grid grid-cols-5 gap-2">
              {EXPENSE_CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => { setCategory(cat.value); setSplitOpen(false); }}
                  className={`flex flex-col items-center gap-1 rounded-2xl border py-2.5 text-center transition ${
                    category === cat.value ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'hover:border-primary-300'
                  }`}
                  style={{ borderColor: category !== cat.value ? 'var(--border)' : undefined }}
                >
                  <span className="text-lg">{cat.emoji}</span>
                  <span className="text-[9px] font-bold leading-tight" style={{ color: 'var(--text)' }}>{cat.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* "Paid by … split …" tap-to-expand */}
      <button
        onClick={() => setSplitOpen(v => !v)}
        className="mb-3 flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold transition hover:border-primary-300"
        style={{ borderColor: 'var(--border)', background: 'var(--card)', color: 'var(--text)' }}
      >
        <span>{splitSummary()}</span>
        {splitOpen ? <ChevronUpIcon className="h-4 w-4" style={{ color: 'var(--text-muted)' }} /> : <ChevronDownIcon className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />}
      </button>

      {/* Expanded split panel */}
      <AnimatePresence>
        {splitOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 overflow-hidden"
          >
            <div className="card space-y-4">
              {/* Paid by */}
              <div>
                <p className="mb-2 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Paid by</p>
                <div className="flex flex-wrap gap-2">
                  {participants.map(p => (
                    <button
                      key={p.user_id}
                      onClick={() => setPaidByUserId(p.user_id)}
                      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-bold transition ${
                        paidByUserId === p.user_id ? 'text-white border-transparent' : ''
                      }`}
                      style={paidByUserId === p.user_id
                        ? { background: p.avatar_color }
                        : { borderColor: 'var(--border)', color: 'var(--text-muted)' }
                      }
                    >
                      {p.user_id === user?.id ? 'You' : p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Split type tabs */}
              <div>
                <p className="mb-2 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Split type</p>
                <div className="flex gap-1.5">
                  {SPLIT_TYPES.map(st => (
                    <button
                      key={st.value}
                      onClick={() => setSplitType(st.value)}
                      className={`flex-1 rounded-xl border py-2 text-xs font-bold transition ${
                        splitType === st.value ? 'bg-primary-600 text-white border-primary-600' : ''
                      }`}
                      style={splitType !== st.value ? { borderColor: 'var(--border)', color: 'var(--text-muted)' } : undefined}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Share rows */}
              {splitType === 'equal' ? (
                <div className="space-y-1.5">
                  {Array.from(selected).map(uid => {
                    const p = participants.find(x => x.user_id === uid);
                    return p ? (
                      <div key={uid} className="flex items-center justify-between rounded-2xl bg-slate-50 dark:bg-slate-800/50 px-3 py-2.5">
                        <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{uid === user?.id ? 'You' : p.name}</span>
                        <span className="font-extrabold text-sm text-primary-600">{formatCurrency(equalShare)}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              ) : (
                <div className="space-y-2">
                  {shares.map((share, idx) => (
                    <div key={share.user_id} className="flex items-center gap-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 px-3 py-2">
                      <span className="flex-1 text-sm font-semibold" style={{ color: 'var(--text)' }}>
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
                        className="w-20 rounded-xl border px-2.5 py-1.5 text-right text-sm font-bold focus:border-primary-500 focus:outline-none"
                        style={{ borderColor: 'var(--border)', background: 'var(--card)', color: 'var(--text)' }}
                        placeholder={splitType === 'percentage' ? '33.3' : '0'}
                      />
                      <span className="w-4 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                        {splitType === 'percentage' ? '%' : splitType === 'shares' ? 'sh' : '₹'}
                      </span>
                    </div>
                  ))}
                  <div className={`flex justify-between rounded-2xl px-3 py-2 text-sm font-bold ${isSharesValid ? 'bg-emerald-50 dark:bg-emerald-900/20 text-positive' : 'bg-rose-50 dark:bg-rose-900/20 text-negative'}`}>
                    <span>Total</span>
                    <span>{shareSum.toFixed(2)}{splitType === 'percentage' ? '%' : ''}{splitType === 'exact' ? ` / ₹${amountNum.toFixed(2)}` : splitType === 'percentage' ? ' / 100%' : ''}</span>
                  </div>
                </div>
              )}

              {/* Recurring */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Recurring expense</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Set reminder each period</p>
                </div>
                <button
                  onClick={() => setIsRecurring(v => !v)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${isRecurring ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${isRecurring ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
              {isRecurring && (
                <select
                  value={recurringFreq}
                  onChange={e => setRecurringFreq(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select frequency</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom toolbar */}
      <div className="flex items-center gap-3 rounded-2xl border px-4 py-3" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
        <button
          onClick={() => setShowDatePicker(v => !v)}
          className="flex items-center gap-1.5 text-xs font-semibold"
          style={{ color: 'var(--text-muted)' }}
        >
          <CalendarIcon className="h-4 w-4" />
          {new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </button>
        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
        {groupId ? (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary-600">
            <UserGroupIcon className="h-4 w-4" />
            {group?.name ?? 'Group'}
          </div>
        ) : (
          <button
            onClick={() => navigate('/groups')}
            className="flex items-center gap-1.5 text-xs font-semibold"
            style={{ color: 'var(--text-muted)' }}
          >
            <UserGroupIcon className="h-4 w-4" />
            Add to group
          </button>
        )}
        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
        <button
          onClick={() => navigate('/scan')}
          className="flex items-center gap-1.5 text-xs font-semibold"
          style={{ color: 'var(--text-muted)' }}
        >
          <CameraIcon className="h-4 w-4" />
          Scan
        </button>
        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
        <button
          onClick={() => setShowNotes(v => !v)}
          className="flex items-center gap-1.5 text-xs font-semibold"
          style={{ color: showNotes ? 'var(--text)' : 'var(--text-muted)' }}
        >
          <DocumentTextIcon className="h-4 w-4" />
          Notes
        </button>
      </div>

      {/* Date picker row */}
      {showDatePicker && (
        <div className="mt-2">
          <input
            type="date"
            value={date}
            onChange={e => { setDate(e.target.value); setShowDatePicker(false); }}
            className="input-field"
          />
        </div>
      )}

      {/* Notes row */}
      {showNotes && (
        <div className="mt-2">
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="input-field resize-none"
            rows={2}
            placeholder="Any notes…"
          />
        </div>
      )}
    </div>
  );
};
