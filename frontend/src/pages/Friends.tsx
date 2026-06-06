import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { friendsAPI, type Friend, type FriendRequest } from '@/services/api/friendsAPI';
import { formatCurrency } from '@/utils/upi';
import { SkeletonRow } from '@/components/ui/SkeletonCard';
import { FilterSheet } from '@/components/ui/FilterSheet';
import {
  AdjustmentsHorizontalIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  UserPlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

type BalanceFilter = 'None' | 'Outstanding' | 'You owe' | 'Owe you';

function avatarInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function FriendRow({ friend, onSettle, onRemind, onRemove }: {
  friend: Friend;
  onSettle: () => void;
  onRemind: () => void;
  onRemove: () => void;
}) {
  const navigate = useNavigate();
  const [swiped, setSwiped] = useState(false);
  const balance = friend.balance;
  const settled = Math.abs(balance) < 0.01;

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Action tray (revealed on swipe) */}
      <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-2">
        <button
          onClick={onSettle}
          className="flex h-12 w-16 flex-col items-center justify-center rounded-xl bg-primary-600 text-[10px] font-bold text-white"
        >
          <span className="text-base">💸</span>Settle
        </button>
        <button
          onClick={onRemind}
          className="flex h-12 w-16 flex-col items-center justify-center rounded-xl bg-warning text-[10px] font-bold text-white"
        >
          <span className="text-base">🔔</span>Remind
        </button>
        <button
          onClick={onRemove}
          className="flex h-12 w-16 flex-col items-center justify-center rounded-xl bg-negative text-[10px] font-bold text-white"
        >
          <span className="text-base">🗑</span>Remove
        </button>
      </div>

      {/* Main row */}
      <motion.div
        animate={{ x: swiped ? -160 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        drag="x"
        dragConstraints={{ left: -160, right: 0 }}
        dragElastic={0.05}
        onDragEnd={(_, info) => {
          if (info.offset.x < -60) setSwiped(true);
          else setSwiped(false);
        }}
        onClick={() => {
          if (swiped) { setSwiped(false); return; }
          navigate(`/friends/${friend.user.id}`);
        }}
        className="relative flex cursor-pointer items-center gap-3 rounded-2xl border p-3 transition-colors"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
        {/* Avatar */}
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-extrabold text-white"
          style={{ background: friend.user.avatar_color }}
        >
          {avatarInitials(friend.user.name)}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-sm" style={{ color: 'var(--text)' }}>{friend.user.name}</p>
          <p className="truncate text-xs" style={{ color: 'var(--text-muted)' }}>{friend.user.email}</p>
        </div>

        {/* Balance chip */}
        {settled ? (
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            Settled
          </span>
        ) : balance > 0 ? (
          <div className="text-right">
            <p className="text-[10px] font-semibold text-positive">owes you</p>
            <p className="text-sm font-extrabold text-positive">{formatCurrency(balance)}</p>
          </div>
        ) : (
          <div className="text-right">
            <p className="text-[10px] font-semibold text-negative">you owe</p>
            <p className="text-sm font-extrabold text-negative">{formatCurrency(Math.abs(balance))}</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export const Friends: React.FC = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter] = useState<BalanceFilter>('None');

  const { data: friends = [], isLoading } = useQuery({
    queryKey: ['friends'],
    queryFn: friendsAPI.getFriends,
  });

  const { data: requests = [] } = useQuery({
    queryKey: ['friend-requests'],
    queryFn: friendsAPI.getRequests,
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

  const totalOwedToYou = friends.reduce((s, f) => s + Math.max(0, f.balance), 0);
  const totalYouOwe = friends.reduce((s, f) => s + Math.max(0, -f.balance), 0);

  const filtered = useMemo(() => {
    let list = friends;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(f => f.user.name.toLowerCase().includes(q) || f.user.email.toLowerCase().includes(q));
    }
    if (filter === 'Outstanding') list = list.filter(f => Math.abs(f.balance) > 0.01);
    if (filter === 'You owe') list = list.filter(f => f.balance < -0.01);
    if (filter === 'Owe you') list = list.filter(f => f.balance > 0.01);
    return list;
  }, [friends, search, filter]);

  return (
    <div className="mx-auto max-w-lg space-y-4 pb-24">
      {/* Top bar */}
      <div className="flex items-center justify-between pt-1">
        <h1 className="font-display text-2xl font-extrabold" style={{ color: 'var(--text)' }}>Friends</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSearch(v => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-2xl transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <MagnifyingGlassIcon className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
          </button>
          <button
            onClick={() => setFilterOpen(true)}
            className={`flex h-9 w-9 items-center justify-center rounded-2xl transition ${filter !== 'None' ? 'bg-primary-100 dark:bg-primary-900/30' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            <AdjustmentsHorizontalIcon className={`h-5 w-5 ${filter !== 'None' ? 'text-primary-600' : ''}`} style={filter === 'None' ? { color: 'var(--text-muted)' } : undefined} />
          </button>
          <button
            onClick={() => navigate('/friends/add')}
            className="flex items-center gap-1.5 rounded-2xl bg-primary-600 px-3 py-1.5 text-sm font-bold text-white transition hover:bg-primary-700"
          >
            <UserPlusIcon className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>

      {/* Search bar */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search friends…"
                className="input-field pl-9 pr-9"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <XMarkIcon className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Balance summary chips */}
      {(totalOwedToYou > 0.01 || totalYouOwe > 0.01) && (
        <div className="flex gap-2">
          {totalOwedToYou > 0.01 && (
            <div className="flex items-center gap-1.5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5">
              <span className="text-xs font-semibold text-positive">Owed to you</span>
              <span className="text-sm font-extrabold text-positive">{formatCurrency(totalOwedToYou)}</span>
            </div>
          )}
          {totalYouOwe > 0.01 && (
            <div className="flex items-center gap-1.5 rounded-2xl bg-rose-50 dark:bg-rose-900/20 px-3 py-1.5">
              <span className="text-xs font-semibold text-negative">You owe</span>
              <span className="text-sm font-extrabold text-negative">{formatCurrency(totalYouOwe)}</span>
            </div>
          )}
        </div>
      )}

      {/* Active filter chip */}
      {filter !== 'None' && (
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Filter:</span>
          <button
            onClick={() => setFilter('None')}
            className="flex items-center gap-1 rounded-full bg-primary-100 dark:bg-primary-900/30 px-3 py-1 text-xs font-bold text-primary-700 dark:text-primary-400"
          >
            {filter} <XMarkIcon className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Pending requests */}
      <AnimatePresence>
        {requests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="card border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800"
          >
            <p className="mb-3 font-bold text-amber-800 dark:text-amber-300">
              Pending requests ({requests.length})
            </p>
            <div className="space-y-3">
              {requests.map((req: FriendRequest) => (
                <div key={req.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-sm font-extrabold text-white"
                      style={{ background: req.requester.avatar_color }}
                    >
                      {avatarInitials(req.requester.name)}
                    </div>
                    <div>
                      <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>{req.requester.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{req.requester.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => acceptMutation.mutate(req.id)}
                      disabled={acceptMutation.isPending}
                      className="flex items-center gap-1 rounded-xl bg-primary-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-primary-700 disabled:opacity-60"
                    >
                      <CheckIcon className="h-3.5 w-3.5" /> Accept
                    </button>
                    <button
                      onClick={() => rejectMutation.mutate(req.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-xl transition hover:bg-rose-100 dark:hover:bg-rose-900/30"
                    >
                      <XMarkIcon className="h-4 w-4 text-negative" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Friends list */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => <SkeletonRow key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card py-14 text-center">
          <UserGroupIcon className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
          {friends.length === 0 ? (
            <>
              <p className="mt-3 font-bold text-base" style={{ color: 'var(--text)' }}>No friends yet</p>
              <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Add friends to start splitting expenses</p>
              <button
                onClick={() => navigate('/friends/add')}
                className="mx-auto mt-4 flex items-center gap-2 rounded-2xl bg-primary-600 px-4 py-2 text-sm font-bold text-white hover:bg-primary-700"
              >
                <UserPlusIcon className="h-4 w-4" /> Add your first friend
              </button>
            </>
          ) : (
            <>
              <p className="mt-3 font-bold text-base" style={{ color: 'var(--text)' }}>No results</p>
              <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Try a different search or filter</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(f => (
            <FriendRow
              key={f.friendship_id}
              friend={f}
              onSettle={() => navigate(`/settle-up/${f.user.id}`)}
              onRemind={() => alert(`Reminder sent to ${f.user.name}`)}
              onRemove={() => removeMutation.mutate(f.user.id)}
            />
          ))}
        </div>
      )}

      {/* All settled up banner */}
      {!isLoading && friends.length > 0 && totalOwedToYou < 0.01 && totalYouOwe < 0.01 && (
        <div className="card border-positive/30 bg-emerald-50/50 dark:bg-emerald-900/10 py-5 text-center">
          <p className="text-xl">🎉</p>
          <p className="mt-1 font-bold text-sm text-positive">You are all settled up!</p>
        </div>
      )}

      {/* Filter sheet */}
      <FilterSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter friends"
        options={[
          { value: 'None', label: 'All friends' },
          { value: 'Outstanding', label: 'Outstanding' },
          { value: 'You owe', label: 'You owe' },
          { value: 'Owe you', label: 'Owe you' },
        ]}
        value={filter}
        onChange={(v: string) => { setFilter(v as BalanceFilter); }}
      />
    </div>
  );
};
