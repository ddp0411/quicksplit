import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { activityAPI, type ActivityItem } from '@/services/api/activityAPI';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { PageTransition } from '@/components/layout/PageTransition';
import { EXPENSE_CATEGORIES } from '@/services/api/expensesAPI';
import { useUserStore } from '@/state/userStore';
import { formatCurrency } from '@/utils/upi';
import { formatDate } from '@/utils/helpers';
import {
  BoltIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const categoryMap = Object.fromEntries(EXPENSE_CATEGORIES.map(c => [c.value, c]));

function ActivityRow({ item, userId }: { item: ActivityItem; userId?: string }) {
  if (item.type === 'expense') {
    const cat = categoryMap[item.category];
    const youPaid = item.paid_by?.id === userId;
    return (
      <Link
        to={`/expenses/${item.id}`}
        className="flex items-center gap-3 rounded-2xl border p-3 transition hover:border-primary-300"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/20 text-xl">
          {cat?.emoji ?? '📦'}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-sm" style={{ color: 'var(--text)' }}>{item.description}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {youPaid ? 'You paid' : `${item.paid_by?.name ?? 'Someone'} paid`}
            {item.group_name && ` · ${item.group_name}`}
            {' · '}{formatDate(item.date)}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-extrabold text-sm" style={{ color: 'var(--text)' }}>{formatCurrency(item.amount)}</p>
          {item.your_share > 0 && (
            <p className={`text-xs font-bold ${youPaid ? 'text-emerald-600' : 'text-rose-500'}`}>
              {youPaid
                ? `you lent ${formatCurrency(item.amount - item.your_share)}`
                : `you owe ${formatCurrency(item.your_share)}`}
            </p>
          )}
        </div>
      </Link>
    );
  }

  // settlement
  const isOutgoing = item.is_outgoing;
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/50 dark:bg-emerald-900/10 dark:border-emerald-800 p-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700">
        <CheckCircleIcon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold text-sm" style={{ color: 'var(--text)' }}>
          {isOutgoing
            ? `You paid ${item.to_user?.name ?? 'someone'}`
            : `${item.from_user?.name ?? 'Someone'} paid you`}
        </p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Settlement{item.group_name && ` · ${item.group_name}`}
          {' · '}{formatDate(item.created_at)}
        </p>
      </div>
      <p className="shrink-0 font-extrabold text-emerald-700">{formatCurrency(item.amount)}</p>
    </div>
  );
}

function groupByDate(items: ActivityItem[]) {
  const groups = new Map<string, ActivityItem[]>();
  for (const item of items) {
    const dateStr = (item.type === 'expense' ? item.date : item.created_at).split('T')[0];
    const key = formatDate(dateStr);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }
  return Array.from(groups.entries());
}

export const Activity: React.FC = () => {
  const { user } = useUserStore();

  const { data: feed = [], isLoading, refetch } = useQuery({
    queryKey: ['activity'],
    queryFn: () => activityAPI.getFeed(50),
  });

  const { indicatorRef } = usePullToRefresh(refetch);

  if (isLoading) {
    return (
      <div className="space-y-4 mx-auto max-w-2xl">
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-white shadow-soft" />
        ))}
      </div>
    );
  }

  const groups = groupByDate(feed);

  return (
    <PageTransition>
    <div className="mx-auto max-w-2xl space-y-5">
      {/* Pull-to-refresh indicator */}
      <div
        ref={indicatorRef}
        className="flex justify-center opacity-0 -mt-6 mb-0 transition-all"
        style={{ transform: 'translateY(0px)' }}
      >
        <div className="h-6 w-6 rounded-full border-2 border-primary-600 border-t-transparent animate-spin" />
      </div>
      {/* Header */}
      <div className="rounded-lg bg-gradient-to-br from-ink to-primary-800 p-5 text-white shadow-button">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15">
            <BoltIcon className="h-6 w-6" />
          </span>
          <div>
            <p className="text-sm font-bold text-white/70">Timeline</p>
            <h1 className="font-display text-3xl font-extrabold tracking-normal">Activity</h1>
          </div>
        </div>
        <p className="mt-3 text-sm font-semibold text-white/70">{feed.length} recent events</p>
      </div>

      {feed.length === 0 ? (
        <div
          className="rounded-2xl px-6 py-14 text-center"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-primary-50 dark:bg-primary-900/20 text-3xl">
            ⚡
          </div>
          <p className="mt-4 font-bold text-base" style={{ color: 'var(--text)' }}>No activity yet</p>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            Add an expense or settle up to see your timeline here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map(([dateLabel, items]) => (
            <div key={dateLabel}>
              <p className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{dateLabel}</p>
              <div className="space-y-2">
                {items.map((item, i) => (
                  <motion.div
                    key={`${item.type}-${item.id}-${i}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <ActivityRow item={item} userId={user?.id} />
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </PageTransition>
  );
};
