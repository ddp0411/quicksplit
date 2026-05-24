import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { friendsAPI, type Friend, type FriendRequest } from '@/services/api/friendsAPI';
import { getAPIErrorMessage } from '@/services/api/errorMessage';
import { formatCurrency } from '@/utils/upi';
import {
  CheckIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  UserGroupIcon,
  UserMinusIcon,
  UserPlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

function avatarInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function Avatar({ name, color, size = 'md' }: { name: string; color: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-12 w-12 text-base' };
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-extrabold text-white ${sizes[size]}`}
      style={{ background: color }}
    >
      {avatarInitials(name)}
    </div>
  );
}

function BalanceBadge({ balance }: { balance: number }) {
  if (Math.abs(balance) < 0.01) {
    return <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-500">Settled</span>;
  }
  if (balance > 0) {
    return (
      <div className="text-right">
        <p className="text-[11px] font-semibold text-emerald-600">owes you</p>
        <p className="font-extrabold text-emerald-700">{formatCurrency(balance)}</p>
      </div>
    );
  }
  return (
    <div className="text-right">
      <p className="text-[11px] font-semibold text-rose-500">you owe</p>
      <p className="font-extrabold text-rose-600">{formatCurrency(Math.abs(balance))}</p>
    </div>
  );
}

export const Friends: React.FC = () => {
  const qc = useQueryClient();
  const [addEmail, setAddEmail] = useState('');
  const [addError, setAddError] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const { data: friends = [], isLoading } = useQuery({
    queryKey: ['friends'],
    queryFn: friendsAPI.getFriends,
  });

  const { data: requests = [] } = useQuery({
    queryKey: ['friend-requests'],
    queryFn: friendsAPI.getRequests,
  });

  const addMutation = useMutation({
    mutationFn: (email: string) => friendsAPI.addFriend(email),
    onSuccess: () => {
      setAddEmail('');
      setShowAdd(false);
      setAddError('');
      qc.invalidateQueries({ queryKey: ['friends'] });
      qc.invalidateQueries({ queryKey: ['friend-requests'] });
    },
    onError: (err) => setAddError(getAPIErrorMessage(err, 'Could not add friend.')),
  });

  const acceptMutation = useMutation({
    mutationFn: (id: number) => friendsAPI.acceptRequest(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['friends'] });
      qc.invalidateQueries({ queryKey: ['friend-requests'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: number) => friendsAPI.rejectRequest(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['friend-requests'] }),
  });

  const removeMutation = useMutation({
    mutationFn: (userId: string) => friendsAPI.removeFriend(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['friends'] }),
  });

  const handleAdd = () => {
    if (!addEmail.trim()) return;
    setAddError('');
    addMutation.mutate(addEmail.trim().toLowerCase());
  };

  const totalOwedToYou = friends.reduce((s, f) => s + Math.max(0, f.balance), 0);
  const totalYouOwe = friends.reduce((s, f) => s + Math.max(0, -f.balance), 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 rounded-lg bg-gradient-to-br from-primary-700 to-sky-500 p-5 text-white shadow-button md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold text-white/70">People</p>
          <h1 className="mt-1 font-display text-4xl font-extrabold tracking-normal">Friends</h1>
          <p className="mt-2 text-sm font-semibold text-white/70">{friends.length} people</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:min-w-72">
          <div className="rounded-lg bg-white/14 p-3">
            <p className="text-xs font-semibold text-white/70">Owed to you</p>
            <p className="mt-1 text-xl font-extrabold text-emerald-200">{formatCurrency(totalOwedToYou)}</p>
          </div>
          <div className="rounded-lg bg-white/14 p-3">
            <p className="text-xs font-semibold text-white/70">You owe</p>
            <p className="mt-1 text-xl font-extrabold text-rose-200">{formatCurrency(totalYouOwe)}</p>
          </div>
        </div>
      </div>

      {/* Pending requests */}
      <AnimatePresence>
        {requests.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-amber-200 bg-amber-50">
              <p className="mb-3 font-bold text-amber-800">Pending requests ({requests.length})</p>
              <div className="space-y-3">
                {requests.map((req: FriendRequest) => (
                  <div key={req.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={req.requester.name} color={req.requester.avatar_color} />
                      <div>
                        <p className="font-bold text-slate-900">{req.requester.name}</p>
                        <p className="text-sm text-slate-500">{req.requester.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => acceptMutation.mutate(req.id)}
                        loading={acceptMutation.isPending}
                      >
                        <CheckIcon className="mr-1 h-4 w-4" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => rejectMutation.mutate(req.id)}
                        className="text-rose-600 hover:bg-rose-50"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add friend */}
      <Card>
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="font-display text-xl font-bold text-ink">Your friends</h2>
          <Button size="sm" onClick={() => setShowAdd(v => !v)}>
            <PlusIcon className="mr-1.5 h-4 w-4" />
            Add friend
          </Button>
        </div>

        <AnimatePresence>
          {showAdd && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 overflow-hidden"
            >
              <div className="flex gap-3 rounded-lg border border-primary-200 bg-primary-50/60 p-4">
                <div className="flex-1">
                  <Input
                    placeholder="friend@email.com"
                    value={addEmail}
                    onChange={e => setAddEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                    error={addError}
                  />
                </div>
                <div className="flex shrink-0 items-start gap-2">
                  <Button onClick={handleAdd} loading={addMutation.isPending}>
                    <UserPlusIcon className="mr-1.5 h-4 w-4" />
                    Send
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => { setShowAdd(false); setAddError(''); }}>
                    <XMarkIcon className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map(i => <div key={i} className="h-16 animate-pulse rounded-lg bg-slate-100" />)}
          </div>
        ) : friends.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center">
            <UserGroupIcon className="mx-auto h-10 w-10 text-slate-400" />
            <p className="mt-3 font-bold text-slate-900">No friends yet</p>
            <p className="mt-1 text-sm text-slate-500">Add friends to start splitting expenses.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {friends.map((f: Friend) => (
              <motion.div
                key={f.friendship_id}
                layout
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 p-3 transition hover:border-primary-200 hover:bg-primary-50/40"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={f.user.name} color={f.user.avatar_color} />
                  <div className="min-w-0">
                    <p className="truncate font-bold text-slate-900">{f.user.name}</p>
                    <p className="truncate text-sm text-slate-500">{f.user.email}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <BalanceBadge balance={f.balance} />
                  <Link to={`/settle-up/${f.user.id}`}>
                    <Button size="sm" variant="secondary">Settle</Button>
                  </Link>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-slate-400 hover:text-rose-600"
                    onClick={() => removeMutation.mutate(f.user.id)}
                    aria-label="Remove friend"
                  >
                    <UserMinusIcon className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Link to="/expenses/new">
          <Card hover className="flex cursor-pointer items-center gap-4">
            <span className="rounded-lg bg-primary-50 p-3 text-primary-700">
              <PlusIcon className="h-6 w-6" />
            </span>
            <div>
              <p className="font-bold text-slate-900">Add expense</p>
              <p className="text-sm text-slate-500">Split a bill with friends</p>
            </div>
          </Card>
        </Link>
        <Link to="/balances">
          <Card hover className="flex cursor-pointer items-center gap-4">
            <span className="rounded-lg bg-emerald-50 p-3 text-emerald-700">
              <MagnifyingGlassIcon className="h-6 w-6" />
            </span>
            <div>
              <p className="font-bold text-slate-900">View balances</p>
              <p className="text-sm text-slate-500">See all outstanding amounts</p>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
};
