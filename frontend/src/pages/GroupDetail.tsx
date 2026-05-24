import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { groupsAPI } from '@/services/api/groupsAPI';
import { expensesAPI, type ExpenseListItem, EXPENSE_CATEGORIES } from '@/services/api/expensesAPI';
import { useUserStore } from '@/state/userStore';
import { formatCurrency } from '@/utils/upi';
import { formatDate } from '@/utils/helpers';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusIcon,
  TrashIcon,
  UserGroupIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';

function avatarInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

const categoryMeta = Object.fromEntries(
  EXPENSE_CATEGORIES.map(c => [c.value, c])
);

export const GroupDetail: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const { user } = useUserStore();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [addMemberEmail, setAddMemberEmail] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);

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
      <div className="space-y-4">
        {[0, 1, 2].map(i => <div key={i} className="h-28 animate-pulse rounded-lg bg-white shadow-soft" />)}
      </div>
    );
  }

  if (!group) {
    return (
      <Card className="mx-auto max-w-md text-center">
        <p className="font-bold text-slate-900">Group not found</p>
        <Link to="/groups"><Button className="mt-4" variant="secondary">Back to groups</Button></Link>
      </Card>
    );
  }

  const isAdmin = group.created_by.id === user?.id;
  const myBalance = balances?.member_balances.find(b => b.user.id === user?.id)?.balance ?? 0;
  const totalExpenses = balances?.total_expenses ?? expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="rounded-lg bg-gradient-to-br from-ink to-primary-800 p-5 text-white shadow-button">
        <Link to="/groups" className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-white/75 hover:text-white">
          <ArrowLeftIcon className="h-4 w-4" />
          Groups
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-white/70 capitalize">{group.category}</p>
            <h1 className="mt-1 font-display text-4xl font-extrabold tracking-normal">{group.name}</h1>
            {group.description && (
              <p className="mt-2 text-sm font-medium text-white/65">{group.description}</p>
            )}
          </div>
          {isAdmin && (
            <Button
              size="sm"
              variant="ghost"
              className="shrink-0 bg-white/10 text-white hover:bg-white/20"
              onClick={() => {
                if (window.confirm('Delete this group?')) deleteGroupMutation.mutate();
              }}
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-white/12 p-3">
            <p className="text-xs font-semibold text-white/70">Total spent</p>
            <p className="mt-1 text-xl font-extrabold">{formatCurrency(totalExpenses)}</p>
          </div>
          <div className="rounded-lg bg-white/12 p-3">
            <p className="text-xs font-semibold text-white/70">Your balance</p>
            <p className={`mt-1 text-xl font-extrabold ${myBalance >= 0 ? 'text-emerald-200' : 'text-rose-200'}`}>
              {myBalance >= 0 ? '+' : ''}{formatCurrency(myBalance)}
            </p>
          </div>
          <div className="rounded-lg bg-white/12 p-3">
            <p className="text-xs font-semibold text-white/70">Members</p>
            <p className="mt-1 text-xl font-extrabold">{group.members.length}</p>
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <Link to={`/expenses/new?group=${groupId}`}>
            <Button size="sm" variant="secondary">
              <PlusIcon className="mr-1.5 h-4 w-4" />
              Add expense
            </Button>
          </Link>
          <Link to={`/settle-up?group=${groupId}`}>
            <Button size="sm" className="bg-white/15 text-white hover:bg-white/25">
              Settle up
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          {/* Expenses */}
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-ink">Expenses</h2>
              <span className="rounded-full bg-primary-50 px-3 py-0.5 text-sm font-bold text-primary-700">
                {expenses.length}
              </span>
            </div>

            {expensesLoading ? (
              <div className="space-y-3">
                {[0, 1, 2].map(i => <div key={i} className="h-16 animate-pulse rounded-lg bg-slate-100" />)}
              </div>
            ) : expenses.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center">
                <ClockIcon className="mx-auto h-8 w-8 text-slate-400" />
                <p className="mt-2 font-bold text-slate-900">No expenses yet</p>
                <Link to={`/expenses/new?group=${groupId}`} className="mt-4 inline-flex">
                  <Button size="sm">Add first expense</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {expenses.map((exp: ExpenseListItem) => {
                  const cat = categoryMeta[exp.category];
                  const youPaid = exp.paid_by.id === user?.id;
                  return (
                    <Link
                      key={exp.id}
                      to={`/expenses/${exp.id}`}
                      className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg border border-slate-100 p-3 transition hover:border-primary-200 hover:bg-primary-50/40"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-xl">
                        {cat?.emoji ?? '📦'}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-bold text-slate-900">{exp.description}</p>
                        <p className="text-sm text-slate-500">
                          {youPaid ? 'You paid' : `${exp.paid_by.name} paid`} · {formatDate(exp.date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold text-slate-900">{formatCurrency(exp.amount)}</p>
                        <p className={`text-xs font-bold ${youPaid ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {youPaid ? `you lent ${formatCurrency(exp.amount - exp.your_share)}` : `you owe ${formatCurrency(exp.your_share)}`}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Simplified debts */}
          {balances && balances.simplified_debts.length > 0 && (
            <Card>
              <div className="mb-4 flex items-center gap-3">
                <span className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
                  <CheckCircleIcon className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-display text-lg font-bold text-ink">Suggested payments</h2>
                  <p className="text-sm text-slate-500">Simplified to {balances.simplified_debts.length} transaction{balances.simplified_debts.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="space-y-3">
                {balances.simplified_debts.map((debt, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center justify-between gap-3 rounded-lg border border-emerald-100 bg-emerald-50/60 p-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-white"
                        style={{ background: debt.from_user.avatar_color }}
                      >
                        {avatarInitials(debt.from_user.name)}
                      </div>
                      <ArrowRightIcon className="h-4 w-4 shrink-0 text-slate-400" />
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-white"
                        style={{ background: debt.to_user.avatar_color }}
                      >
                        {avatarInitials(debt.to_user.name)}
                      </div>
                      <p className="truncate text-sm font-semibold text-slate-700">
                        {debt.from_user.name} → {debt.to_user.name}
                      </p>
                    </div>
                    <p className="shrink-0 font-extrabold text-emerald-700">{formatCurrency(debt.amount)}</p>
                  </motion.div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Members sidebar */}
        <div className="space-y-5">
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-primary-50 p-1.5 text-primary-700">
                  <UserGroupIcon className="h-5 w-5" />
                </span>
                <h2 className="font-display text-lg font-bold text-ink">Members</h2>
              </div>
              {isAdmin && (
                <Button size="sm" variant="secondary" onClick={() => setShowAddMember(v => !v)}>
                  <UserPlusIcon className="h-4 w-4" />
                </Button>
              )}
            </div>

            {showAddMember && (
              <div className="mb-4 flex gap-2">
                <Input
                  placeholder="email@example.com"
                  value={addMemberEmail}
                  onChange={e => setAddMemberEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addMemberMutation.mutate(addMemberEmail)}
                />
                <Button size="sm" onClick={() => addMemberMutation.mutate(addMemberEmail)} loading={addMemberMutation.isPending}>
                  Add
                </Button>
              </div>
            )}

            <div className="space-y-2">
              {group.members.map(member => {
                const memberBalance = balances?.member_balances.find(b => b.user.id === member.user.id)?.balance ?? 0;
                return (
                  <div key={member.id} className="flex items-center justify-between gap-3 rounded-lg p-2 hover:bg-slate-50">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-white"
                        style={{ background: member.user.avatar_color }}
                      >
                        {avatarInitials(member.user.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900">{member.user.name}</p>
                        {member.role === 'admin' && (
                          <p className="text-[10px] font-bold text-primary-600">Admin</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        {Math.abs(memberBalance) < 0.01 ? (
                          <p className="text-xs font-semibold text-slate-400">Settled</p>
                        ) : memberBalance > 0 ? (
                          <p className="text-xs font-extrabold text-emerald-600">+{formatCurrency(memberBalance)}</p>
                        ) : (
                          <p className="text-xs font-extrabold text-rose-600">{formatCurrency(memberBalance)}</p>
                        )}
                      </div>
                      {isAdmin && member.role !== 'admin' && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-slate-300 hover:text-rose-500"
                          onClick={() => removeMemberMutation.mutate(member.user.id)}
                          aria-label="Remove member"
                        >
                          <TrashIcon className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
