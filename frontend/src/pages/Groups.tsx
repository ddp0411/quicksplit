import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { groupsAPI, type Group } from '@/services/api/groupsAPI';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { PageTransition } from '@/components/layout/PageTransition';
import { formatCurrency } from '@/utils/upi';
import { SkeletonRow } from '@/components/ui/SkeletonCard';
import { FilterSheet } from '@/components/ui/FilterSheet';
import {
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

type BalanceFilter = 'None' | 'Outstanding' | 'You owe' | 'Owe you';

const AVATAR_COLORS = ['#1B4332', '#FF6B35', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#0EA5E9', '#EC4899'];

function avatarColorFromIndex(groupId: string, idx: number): string {
  const seed = groupId.charCodeAt(idx % groupId.length) + idx * 7;
  return AVATAR_COLORS[seed % AVATAR_COLORS.length];
}

function MemberAvatarStack({ memberCount, groupId }: { memberCount: number; groupId: string }) {
  const show = Math.min(memberCount, 4);
  const extra = memberCount - show;
  return (
    <div className="flex items-center">
      {Array.from({ length: show }).map((_, i) => (
        <div
          key={i}
          className="h-6 w-6 rounded-full border-2 border-white dark:border-[#1A2E22] flex items-center justify-center text-[9px] font-bold text-white shadow-sm"
          style={{ background: avatarColorFromIndex(groupId, i), marginLeft: i === 0 ? 0 : '-6px', zIndex: show - i }}
        />
      ))}
      {extra > 0 && (
        <div
          className="h-6 w-6 rounded-full border-2 border-white dark:border-[#1A2E22] flex items-center justify-center text-[9px] font-bold text-white shadow-sm bg-slate-400"
          style={{ marginLeft: '-6px' }}
        >
          +{extra}
        </div>
      )}
    </div>
  );
}

const CATEGORY_META: Record<string, { emoji: string; label: string; gradient: string }> = {
  home:   { emoji: '🏠', label: 'Home',   gradient: 'from-sky-500 to-sky-700' },
  trip:   { emoji: '✈️', label: 'Trip',   gradient: 'from-amber-500 to-amber-700' },
  couple: { emoji: '❤️', label: 'Couple', gradient: 'from-rose-500 to-rose-700' },
  work:   { emoji: '💼', label: 'Office', gradient: 'from-slate-500 to-slate-700' },
  event:  { emoji: '📅', label: 'Event',  gradient: 'from-violet-500 to-violet-700' },
  other:  { emoji: '📁', label: 'Other',  gradient: 'from-primary-500 to-primary-700' },
};

function GroupCard({ group }: { group: Group }) {
  const navigate = useNavigate();
  const meta = CATEGORY_META[group.category] ?? CATEGORY_META.other;
  const settled = Math.abs(group.your_balance) < 0.01;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => navigate(`/groups/${group.id}`)}
      className="cursor-pointer rounded-2xl border p-4 transition hover:border-primary-300 hover:shadow-sm active:scale-[0.99]"
      style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${meta.gradient} text-xl shadow-sm`}>
          {meta.emoji}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-sm" style={{ color: 'var(--text)' }}>{group.name}</p>
          <div className="mt-1 flex items-center gap-2">
            <MemberAvatarStack memberCount={group.member_count} groupId={group.id} />
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {group.member_count} {group.member_count === 1 ? 'member' : 'members'}
            </p>
          </div>
        </div>

        {/* Balance chip */}
        {settled ? (
          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            Settled
          </span>
        ) : group.your_balance > 0 ? (
          <div className="shrink-0 text-right">
            <p className="text-[10px] font-semibold text-positive">owed</p>
            <p className="text-sm font-extrabold text-positive">{formatCurrency(group.your_balance)}</p>
          </div>
        ) : (
          <div className="shrink-0 text-right">
            <p className="text-[10px] font-semibold text-negative">you owe</p>
            <p className="text-sm font-extrabold text-negative">{formatCurrency(Math.abs(group.your_balance))}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export const Groups: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter] = useState<BalanceFilter>('None');

  const { data: groups = [], isLoading, refetch } = useQuery({
    queryKey: ['groups'],
    queryFn: groupsAPI.getGroups,
  });

  const { indicatorRef } = usePullToRefresh(refetch);

  const totalOwed = groups.reduce((s, g) => s + Math.max(0, g.your_balance), 0);
  const totalYouOwe = groups.reduce((s, g) => s + Math.max(0, -g.your_balance), 0);

  const filtered = useMemo(() => {
    let list = groups;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(g => g.name.toLowerCase().includes(q));
    }
    if (filter === 'Outstanding') list = list.filter(g => Math.abs(g.your_balance) > 0.01);
    if (filter === 'You owe') list = list.filter(g => g.your_balance < -0.01);
    if (filter === 'Owe you') list = list.filter(g => g.your_balance > 0.01);
    return list;
  }, [groups, search, filter]);

  return (
    <PageTransition>
    <div className="mx-auto max-w-lg space-y-4 pb-24">
      {/* Pull-to-refresh indicator */}
      <div
        ref={indicatorRef}
        className="flex justify-center opacity-0 -mt-6 mb-0 transition-all"
        style={{ transform: 'translateY(0px)' }}
      >
        <div className="h-6 w-6 rounded-full border-2 border-primary-600 border-t-transparent animate-spin" />
      </div>
      {/* Top bar */}
      <div className="flex items-center justify-between pt-1">
        <h1 className="font-display text-2xl font-extrabold" style={{ color: 'var(--text)' }}>Groups</h1>
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
            <AdjustmentsHorizontalIcon
              className={`h-5 w-5 ${filter !== 'None' ? 'text-primary-600' : ''}`}
              style={filter === 'None' ? { color: 'var(--text-muted)' } : undefined}
            />
          </button>
          <button
            onClick={() => navigate('/groups/import')}
            className="flex items-center gap-1.5 rounded-2xl border px-3 py-1.5 text-sm font-bold transition hover:border-primary-300 hover:text-primary-600"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            Import
          </button>
          <button
            onClick={() => navigate('/groups/new')}
            className="flex items-center gap-1.5 rounded-2xl bg-primary-600 px-3 py-1.5 text-sm font-bold text-white transition hover:bg-primary-700"
          >
            <PlusIcon className="h-4 w-4" />
            New
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
                placeholder="Search groups…"
                className="input-field pl-9 pr-9"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <XMarkIcon className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Balance summary */}
      {(totalOwed > 0.01 || totalYouOwe > 0.01) && (
        <div className="flex gap-2 flex-wrap">
          {totalOwed > 0.01 && (
            <div className="flex items-center gap-1.5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5">
              <span className="text-xs font-semibold text-positive">Owed to you</span>
              <span className="text-sm font-extrabold text-positive">{formatCurrency(totalOwed)}</span>
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

      {/* Category quick filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {Object.entries(CATEGORY_META).map(([key, meta]) => (
          <button
            key={key}
            onClick={() => navigate(`/groups/new?category=${key}`)}
            className="flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/10"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            {meta.emoji} {meta.label}
          </button>
        ))}
      </div>

      {/* Groups list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <SkeletonRow key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card py-14 text-center">
          <p className="text-4xl">👥</p>
          {groups.length === 0 ? (
            <>
              <p className="mt-3 font-bold text-base" style={{ color: 'var(--text)' }}>No groups yet</p>
              <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                Create a group for trips, home expenses, or work lunches
              </p>
              <button
                onClick={() => navigate('/groups/new')}
                className="mx-auto mt-4 flex items-center gap-2 rounded-2xl bg-primary-600 px-4 py-2 text-sm font-bold text-white hover:bg-primary-700"
              >
                <PlusIcon className="h-4 w-4" /> Create first group
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
          {filtered.map(group => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      )}

      <FilterSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter groups"
        options={[
          { value: 'None', label: 'All groups' },
          { value: 'Outstanding', label: 'Outstanding' },
          { value: 'You owe', label: 'You owe' },
          { value: 'Owe you', label: 'Owe you' },
        ]}
        value={filter}
        onChange={(v: string) => { setFilter(v as BalanceFilter); }}
      />
    </div>
    </PageTransition>
  );
};
