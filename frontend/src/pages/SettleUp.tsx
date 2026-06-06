import React, { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { balancesAPI } from '@/services/api/balancesAPI';
import { friendsAPI } from '@/services/api/friendsAPI';
import { formatCurrency } from '@/utils/upi';
import { getAPIErrorMessage } from '@/services/api/errorMessage';
import { ArrowLeftIcon, CheckCircleIcon, QrCodeIcon } from '@heroicons/react/24/outline';

type PaymentMethod = 'gpay' | 'phonepe' | 'paytm' | 'cash' | 'other';

const PAYMENT_METHODS: { id: PaymentMethod; label: string; emoji: string; color: string }[] = [
  { id: 'gpay',    label: 'GPay',     emoji: '🟢', color: 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' },
  { id: 'phonepe', label: 'PhonePe',  emoji: '🟣', color: 'border-violet-400 bg-violet-50 dark:bg-violet-900/20' },
  { id: 'paytm',   label: 'Paytm',    emoji: '🔵', color: 'border-sky-400 bg-sky-50 dark:bg-sky-900/20' },
  { id: 'cash',    label: 'Cash',     emoji: '💵', color: 'border-amber-400 bg-amber-50 dark:bg-amber-900/20' },
  { id: 'other',   label: 'Other',    emoji: '💳', color: 'border-slate-400 bg-slate-50 dark:bg-slate-800/50' },
];

function avatarInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export const SettleUp: React.FC = () => {
  const { userId } = useParams<{ userId?: string }>();
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get('group');
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [txnId, setTxnId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('gpay');
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ upi_link?: string; qr_code?: string; amount: number; to_name: string } | null>(null);

  const { data: friends = [] } = useQuery({
    queryKey: ['friends'],
    queryFn: friendsAPI.getFriends,
  });

  const { data: overview } = useQuery({
    queryKey: ['balances'],
    queryFn: balancesAPI.getOverallBalance,
  });

  const targetFriend = userId ? friends.find(f => f.user.id === userId) : null;
  const targetBalance = overview?.balances.find(b => b.user.id === userId)?.balance ?? 0;
  const amountOwed = Math.abs(targetBalance);

  const settleMutation = useMutation({
    mutationFn: () =>
      balancesAPI.createSettlement({
        to_user_id: userId ?? '',
        amount: parseFloat(amount),
        group_id: groupId ?? null,
        notes: notes ? `[${paymentMethod.toUpperCase()}] ${notes}` : `[${paymentMethod.toUpperCase()}]`,
        upi_transaction_id: txnId || undefined,
      }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['balances'] });
      qc.invalidateQueries({ queryKey: ['activity'] });
      qc.invalidateQueries({ queryKey: ['friends'] });
      setResult({ upi_link: data.upi_link, qr_code: data.qr_code, amount: data.amount, to_name: data.to_user.name });
    },
    onError: (err) => setError(getAPIErrorMessage(err, 'Could not record settlement.')),
  });

  // Success screen
  if (result) {
    return (
      <div className="mx-auto max-w-sm space-y-5 py-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="card text-center"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <CheckCircleIcon className="h-9 w-9 text-positive" />
          </div>
          <h2 className="font-display text-2xl font-extrabold" style={{ color: 'var(--text)' }}>Payment recorded!</h2>
          <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
            {formatCurrency(result.amount)} to {result.to_name}
          </p>

          {result.qr_code && (
            <div className="mt-5">
              <p className="mb-3 text-sm font-bold" style={{ color: 'var(--text)' }}>Scan to pay via UPI</p>
              <img src={result.qr_code} alt="UPI QR" className="mx-auto h-48 w-48 rounded-2xl border" style={{ borderColor: 'var(--border)' }} />
            </div>
          )}

          {result.upi_link && (
            <a
              href={result.upi_link}
              className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-700"
            >
              <QrCodeIcon className="h-4 w-4" />
              Open UPI app
            </a>
          )}

          <div className="mt-5 flex gap-3">
            <button
              onClick={() => navigate('/friends')}
              className="flex-1 rounded-2xl border py-3 text-sm font-bold transition hover:border-primary-300"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            >
              Back to friends
            </button>
            <button
              onClick={() => navigate('/activity')}
              className="flex-1 rounded-2xl bg-primary-600 py-3 text-sm font-bold text-white hover:bg-primary-700"
            >
              Activity
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-2xl transition hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ArrowLeftIcon className="h-5 w-5" style={{ color: 'var(--text)' }} />
        </button>
        <h1 className="font-display text-2xl font-extrabold" style={{ color: 'var(--text)' }}>Settle up</h1>
      </div>

      {/* Friend card */}
      {targetFriend && (
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-extrabold text-white"
              style={{ background: targetFriend.user.avatar_color }}>
              {avatarInitials(targetFriend.user.name)}
            </div>
            <div>
              <p className="font-bold" style={{ color: 'var(--text)' }}>{targetFriend.user.name}</p>
              {amountOwed > 0.01 && (
                <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
                  {targetBalance < 0 ? 'You owe' : 'Owes you'}{' '}
                  <span className={targetBalance < 0 ? 'text-negative font-bold' : 'text-positive font-bold'}>
                    {formatCurrency(amountOwed)}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Friend picker if no userId */}
      {!userId && (
        <div className="card">
          <label className="mb-1.5 block text-sm font-semibold" style={{ color: 'var(--text)' }}>Settle with</label>
          <select
            className="input-field"
            onChange={e => navigate(`/settle-up/${e.target.value}`, { replace: true })}
            defaultValue=""
          >
            <option value="" disabled>Select a friend…</option>
            {friends.map(f => (
              <option key={f.user.id} value={f.user.id}>{f.user.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Payment method tabs */}
      <div className="card space-y-3">
        <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Payment method</p>
        <div className="grid grid-cols-5 gap-2">
          {PAYMENT_METHODS.map(method => (
            <button
              key={method.id}
              onClick={() => setPaymentMethod(method.id)}
              className={`flex flex-col items-center gap-1.5 rounded-2xl border py-3 text-center transition ${
                paymentMethod === method.id ? method.color + ' border-2' : ''
              }`}
              style={{ borderColor: paymentMethod !== method.id ? 'var(--border)' : undefined }}
            >
              <span className="text-xl">{method.emoji}</span>
              <span className="text-[10px] font-bold" style={{ color: 'var(--text)' }}>{method.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* AI suggestion */}
      {amountOwed > 0.01 && (
        <div className="card border-primary-200 bg-primary-50/50 dark:bg-primary-900/10">
          <p className="text-xs font-bold text-primary-700 dark:text-primary-400">
            ✨ AI suggestion
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--text)' }}>
            Settle the full {formatCurrency(amountOwed)} to clear all debts with {targetFriend?.user.name ?? 'this person'}
          </p>
        </div>
      )}

      {/* Amount + details */}
      <div className="card space-y-4">
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 dark:bg-rose-900/20 p-3 text-sm font-semibold text-negative">
            {error}
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-semibold" style={{ color: 'var(--text)' }}>Amount (₹)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-extrabold text-primary-600">₹</span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder={amountOwed > 0 ? amountOwed.toFixed(2) : '0.00'}
              className="input-field pl-9 font-display text-xl font-extrabold"
              style={{ color: 'var(--text)' }}
            />
          </div>
          {amountOwed > 0.01 && (
            <button
              type="button"
              onClick={() => setAmount(amountOwed.toFixed(2))}
              className="mt-1.5 text-xs font-bold text-primary-600"
            >
              Use full amount ({formatCurrency(amountOwed)})
            </button>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold" style={{ color: 'var(--text)' }}>Notes (optional)</label>
          <input
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="input-field"
            placeholder="Dinner, rent split…"
          />
        </div>

        {paymentMethod !== 'cash' && (
          <div>
            <label className="mb-1.5 block text-sm font-semibold" style={{ color: 'var(--text)' }}>Transaction ID (optional)</label>
            <input
              value={txnId}
              onChange={e => setTxnId(e.target.value)}
              className="input-field"
              placeholder="UPI ref / transaction number"
            />
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex-1 rounded-2xl border py-3.5 text-sm font-bold transition hover:border-primary-300"
          style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
        >
          Cancel
        </button>
        <button
          onClick={() => { setError(''); settleMutation.mutate(); }}
          disabled={settleMutation.isPending || !amount || parseFloat(amount) <= 0 || !userId}
          className="flex-1 rounded-2xl bg-primary-600 py-3.5 text-sm font-bold text-white shadow-button transition hover:bg-primary-700 disabled:opacity-60"
        >
          {settleMutation.isPending ? 'Recording…' : 'Record payment'}
        </button>
      </div>
    </div>
  );
};
