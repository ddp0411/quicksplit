import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { groupsAPI } from '@/services/api/groupsAPI';
import { expensesAPI, type ExpenseListItem, EXPENSE_CATEGORIES } from '@/services/api/expensesAPI';
import { useUserStore } from '@/state/userStore';
import { formatCurrency } from '@/utils/upi';
import { formatDate } from '@/utils/helpers';
import { SkeletonRow } from '@/components/ui/SkeletonCard';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChartBarIcon,
  PlusIcon,
  TrashIcon,
  UserGroupIcon,
  UserPlusIcon,
  XMarkIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

const CATEGORY_META_GROUP: Record<string, { emoji: string; gradient: string }> = {
  home:   { emoji: '🏠', gradient: 'from-sky-500 to-sky-700' },
  trip:   { emoji: '✈️', gradient: 'from-amber-500 to-amber-700' },
  couple: { emoji: '❤️', gradient: 'from-rose-500 to-rose-700' },
  work:   { emoji: '💼', gradient: 'from-slate-500 to-slate-700' },
  event:  { emoji: '📅', gradient: 'from-violet-500 to-violet-700' },
  other:  { emoji: '📁', gradient: 'from-primary-500 to-primary-700' },
};

function avatarInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

const catMeta = Object.fromEntries(EXPENSE_CATEGORIES.map(c => [c.value, c]));

export const GroupDetail: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const { user } = useUserStore();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [addMemberEmail, setAddMemberEmail] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);
  const [showMembers, setShowMembers] = useState(false);

  const { data: group, isLoading: groupLoading } = useQuery({
    queryKey: ['group', groupId],
    queryFn: () => groupsAPI.getGroup(groupId!),
    enabled: !!groupId,
  });

  const { data: expenses = [], isLoading: expensesLoading } = useQuery({
    queryKey: ['expenses', { group_id: groupId }],
    queryFn: () => expensesAPI.getExpenses({ group_id: groupId }),
    enabled: !!groupId,
  });

  const { data: balances } = useQuery({
    queryKey: ['group-balances', groupId],
    queryFn: () => groupsAPI.getBalances(groupId!),
    enabled: !!groupId,
  });

  const addMemberMutation = useMutation({
    mutationFn: (email: string) => groupsAPI.addMember(groupId!, email),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['group', groupId] });
      setAddMemberEmail('');
      setShowAddMember(false);
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => groupsAPI.removeMember(groupId!, userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['group', groupId] }),
  });

  const deleteGroupMutation = useMutation({
    mutationFn: () => groupsAPI.deleteGroup(groupId!),
    onSuccess: () => navigate('/groups'),
  });

  if (groupLoading) {
    return (
      <div className="mx-auto max-w-lg space-y-3 pt-4">
        {[1, 2, 3].map(i => <SkeletonRow key={i} />)}
      </div>
    );
  }

  if (!group) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <p className="font-bold" style={{ color: 'var(--text)' }}>Group not found</p>
        <Link to="/groups" className="mt-3 inline-block text-sm font-bold text-primary-600">← Back to groups</Link>
      </div>
    );
  }

  const isAdmin = group.created_by.id === user?.id;
  const groupMeta = CATEGORY_META_GROUP[group.category] ?? CATEGORY_META_GROUP.other;
  const myBalance = balances?.member_balances.find(b => b.user.id === user?.id)?.balance ?? 0;
  const totalExpenses = balances?.total_expenses ?? expenses.reduce((s, e) => s + e.amount, 0);

  // Analytics: top spender
  const spendByMember: Record<string, { name: string; amount: number }> = {};
  expenses.forEach(e => {
    if (!spendByMember[e.paid_by.id]) spendByMember[e.paid_by.id] = { name: e.paid_by.name, amount: 0 };
    spendByMember[e.paid_by.id].amount += e.amount;
  });
  const topSpender = Object.values(spendByMember).sort((a, b) => b.amount - a.amount)[0];

  // Analytics: top category
  const spendByCat: Record<string, number> = {};
  expenses.forEach(e => { spendByCat[e.category] = (spendByCat[e.category] ?? 0) + e.amount; });
  const topCatKey = Object.entries(spendByCat).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topCat = topCatKey ? catMeta[topCatKey] : null;

  return (
    <div className="mx-auto max-w-lg space-y-4 pb-24">
      {/* Hero */}
      <div className={`rounded-3xl bg-gradient-to-br ${groupMeta.gradient} p-5 text-white shadow-button`}>
        <button
          onClick={() => navigate('/groups')}
          className="mb-3 flex items-center gap-2 text-sm font-bold text-white/70 hover:text-white"
        >
          <ArrowLeftIcon className="h-4 w-4" /> Groups
        </button>

        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{groupMeta.emoji}</span>
              <span className="text-xs font-bold text-white/70 capitalize">{group.category}</span>
            </div>
            <h1 className="font-display text-2xl font-extrabold">{group.name}</h1>
            {group.description && (
              <p className="mt-1 text-sm text-white/70">{group.description}</p>
            )}
          </div>
          {isAdmin && (
            <button
              onClick={() => { if (window.confirm('Delete this group?')) deleteGroupMutation.mutate(); }}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 text-white hover:bg-white/25 transition"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Stats row */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-white/15 p-3">
            <p className="text-[10px] font-semibold text-white/70">Total spent</p>
            <p className="mt-0.5 text-base font-extrabold">{formatCurrency(totalExpenses)}</p>
          </div>
          <div className="rounded-2xl bg-white/15 p-3">
            <p className="text-[10px] font-semibold text-white/70">Your balance</p>
            <p className={`mt-0.5 text-base font-extrabold ${myBalance >= 0 ? 'text-emerald-200' : 'text-rose-200'}`}>
              {myBalance >= 0 ? '+' : ''}{formatCurrency(myBalance)}
            </p>
          </div>
          <div className="rounded-2xl bg-white/15 p-3">
            <p className="text-[10px] font-semibold text-white/70">Members</p>
            <p className="mt-0.5 text-base font-extrabold">{group.members.length}</p>
          </div>
        </div>
      </div>

      {/* Quick actions row */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Add expense', emoji: '➕', to: `/expenses/new?group=${groupId}` },
          { label: 'Scan receipt', emoji: '📷', to: `/scan` },
          { label: 'Settle up', emoji: '💸', to: `/settle-up?group=${groupId}` },
          { label: 'Insights', emoji: '📊', to: `/groups/${groupId}/insights` },
        ].map(action => (
          <button
            key={action.label}
            onClick={() => navigate(action.to)}
            className="flex flex-col items-center gap-1.5 rounded-2xl border py-3 text-center transition hover:border-primary-300 hover:bg-primary-50/50 dark:hover:bg-primary-900/10"
            style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
          >
            <span className="text-xl">{action.emoji}</span>
            <span className="text-[10px] font-semibold leading-tight" style={{ color: 'var(--text-muted)' }}>{action.label}</span>
          </button>
        ))}
      </div>

      {/* Analytics mini card */}
      {expenses.length > 0 && (topSpender || topCat) && (
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <ChartBarIcon className="h-4 w-4 text-primary-600" />
            <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>Group insights</p>
            <Link to={`/groups/${groupId}/insights`} className="ml-auto text-xs font-bold text-primary-600">
              See all →
            </Link>
          </div>
          <div className="flex gap-3">
            {topSpender && (
              <div className="flex-1 rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-3">
                <p className="text-[10px] font-semibold text-primary-600 mb-1">Top spender</p>
                <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>{topSpender.name}</p>
                <p className="text-xs text-positive font-semibold">{formatCurrency(topSpender.amount)}</p>
              </div>
            )}
            {topCat && (
              <div className="flex-1 rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-3">
                <p className="text-[10px] font-semibold text-primary-600 mb-1">Top category</p>
                <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>{topCat.emoji} {topCat.label}</p>
                <p className="text-xs text-positive font-semibold">{formatCurrency(spendByCat[topCatKey!])}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Suggested payments */}
      {balances && balances.simplified_debts.length > 0 && (
        <div className="card">
          <p className="font-bold text-sm mb-3" style={{ color: 'var(--text)' }}>
            💡 Suggested payments ({balances.simplified_debts.length})
          </p>
          <div className="space-y-2">
            {balances.simplified_debts.map((debt, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center justify-between gap-3 rounded-2xl border p-3"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-[10px] font-extrabold text-white"
                    style={{ background: debt.from_user.avatar_color }}>
                    {avatarInitials(debt.from_user.name)}
                  </div>
                  <ArrowRightIcon className="h-3 w-3 shrink-0" style={{ color: 'var(--text-muted)' }} />
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-[10px] font-extrabold text-white"
                    style={{ background: debt.to_user.avatar_color }}>
                    {avatarInitials(debt.to_user.name)}
                  </div>
                  <p className="truncate text-xs font-semibold" style={{ color: 'var(--text)' }}>
                    {debt.from_user.name} → {debt.to_user.name}
                  </p>
                </div>
                <p className="shrink-0 font-extrabold text-sm text-positive">{formatCurrency(debt.amount)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Expenses feed */}
      <div className="card">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>Expenses ({expenses.length})</p>
          <button
            onClick={() => navigate(`/expenses/new?group=${groupId}`)}
            className="flex items-center gap-1 rounded-xl bg-primary-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-primary-700"
          >
            <PlusIcon className="h-3 w-3" /> Add
          </button>
        </div>

        {expensesLoading ? (
          <div className="space-y-2">{[1, 2, 3].map(i => <SkeletonRow key={i} />)}</div>
        ) : expenses.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-2xl">🧾</p>
            <p className="mt-2 font-semibold text-sm" style={{ color: 'var(--text-muted)' }}>No expenses yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {expenses.map((exp: ExpenseListItem) => {
              const cat = catMeta[exp.category];
              const youPaid = exp.paid_by.id === user?.id;
              return (
                <Link
                  key={exp.id}
                  to={`/expenses/${exp.id}`}
                  className="flex items-center gap-3 rounded-2xl border p-3 transition hover:border-primary-300 hover:bg-primary-50/30 dark:hover:bg-primary-900/10"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-xl">
                    {cat?.emoji ?? '📦'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-sm" style={{ color: 'var(--text)' }}>{exp.description}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {youPaid ? 'You paid' : `${exp.paid_by.name} paid`} · {formatDate(exp.date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>{formatCurrency(exp.amount)}</p>
                    <p className={`text-xs font-bold ${youPaid ? 'text-positive' : 'text-negative'}`}>
                      {youPaid ? `lent ${formatCurrency(exp.amount - exp.your_share)}` : `owe ${formatCurrency(exp.your_share)}`}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Members collapsible */}
      <div className="card">
        <button
          onClick={() => setShowMembers(v => !v)}
          className="flex w-full items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <UserGroupIcon className="h-4 w-4 text-primary-600" />
            <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>Members ({group.members.length})</p>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={e => { e.stopPropagation(); setShowAddMember(v => !v); }}
                className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-700 hover:bg-primary-200"
              >
                <UserPlusIcon className="h-3.5 w-3.5" />
              </button>
            )}
            <ChevronDownIcon
              className={`h-4 w-4 transition-transform ${showMembers ? 'rotate-180' : ''}`}
              style={{ color: 'var(--text-muted)' }}
            />
          </div>
        </button>

        <AnimatePresence>
          {showMembers && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 space-y-2 border-t pt-3" style={{ borderColor: 'var(--border)' }}>
                {showAddMember && (
                  <div className="flex gap-2 mb-3">
                    <input
                      value={addMemberEmail}
                      onChange={e => setAddMemberEmail(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addMemberMutation.mutate(addMemberEmail)}
                      placeholder="email@example.com"
                      className="input-field flex-1"
                    />
                    <button
                      onClick={() => addMemberMutation.mutate(addMemberEmail)}
                      disabled={addMemberMutation.isPending}
                      className="rounded-2xl bg-primary-600 px-3 py-2 text-sm font-bold text-white hover:bg-primary-700 disabled:opacity-60"
                    >
                      Add
                    </button>
                    <button onClick={() => setShowAddMember(false)} className="flex h-10 w-10 items-center justify-center rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800">
                      <XMarkIcon className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                    </button>
                  </div>
                )}
                {group.members.map(member => {
                  const memberBalance = balances?.member_balances.find(b => b.user.id === member.user.id)?.balance ?? 0;
                  return (
                    <div key={member.id} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl text-xs font-extrabold text-white"
                          style={{ background: member.user.avatar_color }}
                        >
                          {avatarInitials(member.user.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold" style={{ color: 'var(--text)' }}>{member.user.name}</p>
                          {member.role === 'admin' && (
                            <p className="text-[10px] font-bold text-primary-600">Admin</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {Math.abs(memberBalance) < 0.01 ? (
                          <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Settled</span>
                        ) : memberBalance > 0 ? (
                          <span className="text-xs font-extrabold text-positive">+{formatCurrency(memberBalance)}</span>
                        ) : (
                          <span className="text-xs font-extrabold text-negative">{formatCurrency(memberBalance)}</span>
                        )}
                        {isAdmin && member.role !== 'admin' && (
                          <button
                            onClick={() => removeMemberMutation.mutate(member.user.id)}
                            className="text-slate-300 hover:text-negative transition"
                          >
                            <TrashIcon className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
