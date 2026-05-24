import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { balancesAPI } from '@/services/api/balancesAPI';
import { formatCurrency } from '@/utils/upi';
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ScaleIcon,
} from '@heroicons/react/24/outline';

function avatarInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export const Balances: React.FC = () => {
  const { data: overview, isLoading } = useQuery({
    queryKey: ['balances'],
    queryFn: balancesAPI.getOverallBalance,
  });

  if (isLoading) {
    return (
      <div className="space-y-4 mx-auto max-w-2xl">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-white shadow-soft" />
        ))}
      </div>
    );
  }

  const net = overview?.net_balance ?? 0;
  const owed = overview?.total_owed_to_you ?? 0;
  const owing = overview?.total_you_owe ?? 0;
  const balances = overview?.balances ?? [];

  const positives = balances.filter(b => b.balance > 0.009);
  const negatives = balances.filter(b => b.balance < -0.009);
  const settled = balances.filter(b => Math.abs(b.balance) < 0.01);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {/* Hero */}
      <div className={`rounded-lg p-5 text-white shadow-button ${net >= 0 ? 'bg-gradient-to-br from-emerald-600 to-teal-500' : 'bg-gradient-to-br from-rose-600 to-pink-500'}`}>
        <div className="flex items-center gap-3 mb-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15">
            <ScaleIcon className="h-6 w-6" />
          </span>
          <div>
            <p className="text-sm font-bold text-white/70">Your net balance</p>
            <h1 className="font-display text-3xl font-extrabold">
              {net >= 0 ? '+' : ''}{formatCurrency(net)}
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-white/12 p-3">
            <p className="text-xs font-semibold text-white/70">Owed to you</p>
            <p className="mt-1 text-xl font-extrabold text-emerald-200">{formatCurrency(owed)}</p>
          </div>
          <div className="rounded-lg bg-white/12 p-3">
            <p className="text-xs font-semibold text-white/70">You owe</p>
            <p className="mt-1 text-xl font-extrabold text-rose-200">{formatCurrency(owing)}</p>
          </div>
        </div>
      </div>

      {/* People who owe you */}
      {positives.length > 0 && (
        <Card>
          <div className="mb-4 flex items-center gap-3">
            <span className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
              <CheckCircleIcon className="h-5 w-5" />
            </span>
            <h2 className="font-display text-xl font-bold text-ink">Owed to you</h2>
          </div>
          <div className="space-y-2">
            {positives.map((b, i) => (
              <motion.div
                key={b.user.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between gap-3 rounded-lg border border-emerald-100 bg-emerald-50/50 p-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-white"
                    style={{ background: b.user.avatar_color }}
                  >
                    {avatarInitials(b.user.name)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{b.user.name}</p>
                    <p className="text-xs text-slate-500">{b.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-extrabold text-emerald-700">{formatCurrency(b.balance)}</p>
                  <Link to={`/settle-up/${b.user.id}`}>
                    <Button size="sm" variant="secondary">Remind</Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* People you owe */}
      {negatives.length > 0 && (
        <Card>
          <div className="mb-4 flex items-center gap-3">
            <span className="rounded-lg bg-rose-50 p-2 text-rose-600">
              <ArrowRightIcon className="h-5 w-5" />
            </span>
            <h2 className="font-display text-xl font-bold text-ink">You owe</h2>
          </div>
          <div className="space-y-2">
            {negatives.map((b, i) => (
              <motion.div
                key={b.user.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between gap-3 rounded-lg border border-rose-100 bg-rose-50/50 p-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-white"
                    style={{ background: b.user.avatar_color }}
                  >
                    {avatarInitials(b.user.name)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{b.user.name}</p>
                    <p className="text-xs text-slate-500">{b.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-extrabold text-rose-600">{formatCurrency(Math.abs(b.balance))}</p>
                  <Link to={`/settle-up/${b.user.id}`}>
                    <Button size="sm">Settle up</Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* All settled */}
      {settled.length > 0 && (positives.length > 0 || negatives.length > 0) && (
        <Card className="border-slate-100 bg-slate-50">
          <p className="mb-3 text-sm font-bold text-slate-500">All settled up</p>
          <div className="flex flex-wrap gap-2">
            {settled.map(b => (
              <div
                key={b.user.id}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5"
              >
                <div
                  className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-extrabold text-white"
                  style={{ background: b.user.avatar_color }}
                >
                  {b.user.name[0]}
                </div>
                <span className="text-sm font-semibold text-slate-600">{b.user.name}</span>
                <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-500" />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Empty state */}
      {balances.length === 0 && (
        <Card className="py-12 text-center">
          <ScaleIcon className="mx-auto h-10 w-10 text-slate-400" />
          <p className="mt-3 font-bold text-slate-900">All clear!</p>
          <p className="mt-1 text-sm text-slate-500">No outstanding balances with anyone.</p>
          <Link to="/expenses/new">
            <Button className="mt-5">Add an expense</Button>
          </Link>
        </Card>
      )}
    </div>
  );
};
