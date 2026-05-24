import React, { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { balancesAPI } from '@/services/api/balancesAPI';
import { friendsAPI } from '@/services/api/friendsAPI';
import { formatCurrency } from '@/utils/upi';
import { getAPIErrorMessage } from '@/services/api/errorMessage';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  QrCodeIcon,
} from '@heroicons/react/24/outline';

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
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ upi_link?: string; qr_code?: string; amount: number; to_name: string } | null>(null);

  const { data: friends = [] } = useQuery({
    queryKey: ['friends'],
    queryFn: friendsAPI.getFriends,
  });

  const { data: overview } = useQuery({
    queryKey: ['balances'],
    queryFn: balancesAPI.getOverallBalance,
    enabled: !userId,
  });

  // Determine who we're settling with
  const targetFriend = userId ? friends.find(f => f.user.id === userId) : null;
  const targetBalance = userId
    ? overview?.balances.find(b => b.user.id === userId)?.balance ?? 0
    : 0;
  const amountOwed = Math.abs(targetBalance);

  const settleMutation = useMutation({
    mutationFn: () =>
      balancesAPI.createSettlement({
        to_user_id: userId ?? '',
        amount: parseFloat(amount),
        group_id: groupId ?? null,
        notes: notes || undefined,
        upi_transaction_id: txnId || undefined,
      }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['balances'] });
      qc.invalidateQueries({ queryKey: ['activity'] });
      qc.invalidateQueries({ queryKey: ['friends'] });
      setResult({
        upi_link: data.upi_link,
        qr_code: data.qr_code,
        amount: data.amount,
        to_name: data.to_user.name,
      });
    },
    onError: (err) => setError(getAPIErrorMessage(err, 'Could not record settlement.')),
  });

  if (result) {
    return (
      <div className="mx-auto max-w-md space-y-5">
        <Card className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircleIcon className="h-9 w-9 text-emerald-600" />
          </div>
          <h2 className="font-display text-2xl font-extrabold text-ink">Payment recorded!</h2>
          <p className="mt-1 text-slate-500">
            {formatCurrency(result.amount)} to {result.to_name}
          </p>

          {result.qr_code && (
            <div className="mt-5">
              <p className="mb-3 text-sm font-bold text-slate-700">Scan to pay via UPI</p>
              <img
                src={result.qr_code}
                alt="UPI QR code"
                className="mx-auto h-48 w-48 rounded-lg border border-slate-200"
              />
            </div>
          )}

          {result.upi_link && (
            <a
              href={result.upi_link}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-700"
            >
              <QrCodeIcon className="h-4 w-4" />
              Open UPI app
            </a>
          )}

          <div className="mt-5 flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => navigate('/balances')}>
              View balances
            </Button>
            <Button className="flex-1" onClick={() => navigate('/activity')}>
              Activity
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-5">
      {/* Hero */}
      <div className="rounded-lg bg-gradient-to-br from-emerald-600 to-teal-500 p-5 text-white shadow-button">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-white/75 hover:text-white"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back
        </button>
        <h1 className="font-display text-3xl font-extrabold tracking-normal">Settle up</h1>
        {targetFriend && (
          <div className="mt-4 flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-extrabold text-white"
              style={{ background: targetFriend.user.avatar_color }}
            >
              {avatarInitials(targetFriend.user.name)}
            </div>
            <div>
              <p className="font-extrabold text-lg">{targetFriend.user.name}</p>
              {amountOwed > 0 && (
                <p className="text-sm font-semibold text-white/80">
                  {targetBalance < 0 ? 'You owe' : 'Owes you'} {formatCurrency(amountOwed)}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Form */}
      <Card>
        <h2 className="mb-4 font-bold text-slate-700">Record payment</h2>

        {error && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        {!userId && (
          <div className="mb-4">
            <label className="mb-2 block text-sm font-semibold text-slate-700">Pay to</label>
            <select
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              onChange={e => navigate(`/settle-up/${e.target.value}`, { replace: true })}
              defaultValue=""
            >
              <option value="" disabled>Select friend…</option>
              {friends.map(f => (
                <option key={f.user.id} value={f.user.id}>{f.user.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Amount (₹)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-500 font-semibold">₹</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder={amountOwed > 0 ? amountOwed.toFixed(2) : '0.00'}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3.5 text-sm font-bold focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </div>
            {amountOwed > 0 && (
              <button
                type="button"
                className="mt-1.5 text-xs font-bold text-primary-600"
                onClick={() => setAmount(amountOwed.toFixed(2))}
              >
                Use full amount ({formatCurrency(amountOwed)})
              </button>
            )}
          </div>

          <Input
            label="Notes (optional)"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Dinner, rent split, etc."
          />

          <Input
            label="UPI Transaction ID (optional)"
            value={txnId}
            onChange={e => setTxnId(e.target.value)}
            placeholder="UPI ref number"
          />
        </div>

        <div className="mt-5 flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            loading={settleMutation.isPending}
            disabled={!amount || parseFloat(amount) <= 0 || !userId}
            onClick={() => {
              setError('');
              settleMutation.mutate();
            }}
          >
            Record payment
          </Button>
        </div>
      </Card>
    </div>
  );
};
