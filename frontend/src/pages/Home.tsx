import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useSplitStore } from '@/state/splitStore';
import { useUserStore } from '@/state/userStore';
import { balancesAPI } from '@/services/api/balancesAPI';
import { activityAPI } from '@/services/api/activityAPI';
import { friendsAPI } from '@/services/api/friendsAPI';
import { groupsAPI } from '@/services/api/groupsAPI';
import { EXPENSE_CATEGORIES } from '@/services/api/expensesAPI';
import { formatDate } from '@/utils/helpers';
import { formatCurrency } from '@/utils/upi';
import {
  ArrowRightIcon,
  BoltIcon,
  CameraIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  PlusIcon,
  QrCodeIcon,
  ScaleIcon,
  SparklesIcon,
  UserGroupIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

const categoryMap = Object.fromEntries(EXPENSE_CATEGORIES.map(c => [c.value, c]));
const sampleTotal = 546;

export const Home: React.FC = () => {
  const { isAuthenticated } = useUserStore();
  return isAuthenticated ? <DashboardHome /> : <GuestHome />;
};

const DashboardHome: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { setBillTotal, reset } = useSplitStore();

  const { data: overview } = useQuery({
    queryKey: ['balances'],
    queryFn: balancesAPI.getOverallBalance,
  });

  const { data: feed = [] } = useQuery({
    queryKey: ['activity'],
    queryFn: () => activityAPI.getFeed(6),
  });

  const { data: friends = [] } = useQuery({
    queryKey: ['friends'],
    queryFn: friendsAPI.getFriends,
  });

  const { data: groups = [] } = useQuery({
    queryKey: ['groups'],
    queryFn: groupsAPI.getGroups,
  });

  const net = overview?.net_balance ?? 0;
  const owed = overview?.total_owed_to_you ?? 0;
  const owing = overview?.total_you_owe ?? 0;

  const seedSampleSplit = () => {
    reset();
    setBillTotal(sampleTotal);
    navigate('/split');
  };

  return (
    <div className="space-y-5">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-lg bg-gradient-to-br from-primary-700 via-primary-600 to-sky-500 p-5 text-white shadow-button"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-white/75">Hey {user?.name ?? 'there'} 👋</p>
            <h1 className="mt-1 font-display text-3xl font-extrabold tracking-normal sm:text-4xl">
              {net >= 0 ? 'You\'re owed money!' : 'You have dues'}
            </h1>
          </div>
          <div className="rounded-lg bg-white/15 p-3">
            <ScaleIcon className="h-7 w-7" />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-white/14 p-3">
            <p className="text-xs font-medium text-white/70">Net balance</p>
            <p className={`mt-1 text-lg font-extrabold ${net >= 0 ? 'text-emerald-200' : 'text-rose-200'}`}>
              {net >= 0 ? '+' : ''}{formatCurrency(net)}
            </p>
          </div>
          <div className="rounded-lg bg-white/14 p-3">
            <p className="text-xs font-medium text-white/70">Owed to you</p>
            <p className="mt-1 text-lg font-extrabold text-emerald-200">{formatCurrency(owed)}</p>
          </div>
          <div className="rounded-lg bg-white/14 p-3">
            <p className="text-xs font-medium text-white/70">You owe</p>
            <p className="mt-1 text-lg font-extrabold text-rose-200">{formatCurrency(owing)}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/expenses/new">
            <Button variant="secondary">
              <PlusIcon className="mr-2 h-5 w-5" />
              Add expense
            </Button>
          </Link>
          <Link to="/balances">
            <Button variant="ghost" className="bg-white/10 text-white hover:bg-white/20">
              <ScaleIcon className="mr-2 h-5 w-5" />
              View balances
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Link to="/friends">
          <Card hover className="flex cursor-pointer items-center gap-3">
            <span className="rounded-lg bg-sky-50 p-2 text-sky-700">
              <UsersIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold text-slate-500">Friends</p>
              <p className="font-extrabold text-slate-900">{friends.length}</p>
            </div>
          </Card>
        </Link>
        <Link to="/groups">
          <Card hover className="flex cursor-pointer items-center gap-3">
            <span className="rounded-lg bg-primary-50 p-2 text-primary-700">
              <UserGroupIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold text-slate-500">Groups</p>
              <p className="font-extrabold text-slate-900">{groups.length}</p>
            </div>
          </Card>
        </Link>
        <Link to="/scan">
          <Card hover className="flex cursor-pointer items-center gap-3">
            <span className="rounded-lg bg-amber-50 p-2 text-amber-700">
              <CameraIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold text-slate-500">Scan bill</p>
              <p className="font-extrabold text-slate-900">OCR</p>
            </div>
          </Card>
        </Link>
        <Link to="/activity">
          <Card hover className="flex cursor-pointer items-center gap-3">
            <span className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
              <BoltIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold text-slate-500">Activity</p>
              <p className="font-extrabold text-slate-900">{feed.length}+</p>
            </div>
          </Card>
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        {/* Recent activity */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-ink">Recent activity</h2>
            <Link to="/activity" className="text-sm font-bold text-primary-700">
              See all
            </Link>
          </div>

          {feed.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center">
              <ClockIcon className="mx-auto h-8 w-8 text-slate-400" />
              <p className="mt-2 font-bold text-slate-900">No activity yet</p>
              <p className="mt-1 text-sm text-slate-500">Add an expense to get started.</p>
              <Link to="/expenses/new" className="mt-4 inline-flex">
                <Button size="sm">
                  <PlusIcon className="mr-1.5 h-4 w-4" />
                  Add expense
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {feed.map((item) => {
                const cat = item.type === 'expense' ? categoryMap[item.category] : null;
                return (
                  <Link
                    key={`${item.type}-${item.id}`}
                    to={item.type === 'expense' ? `/expenses/${item.id}` : '/activity'}
                    className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 transition hover:border-primary-200 hover:bg-primary-50/40"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-lg">
                      {item.type === 'expense' ? (cat?.emoji ?? '📦') : '✅'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-slate-900">{item.description}</p>
                      <p className="text-xs text-slate-500">{formatDate(item.date ?? item.created_at)}</p>
                    </div>
                    <p className="shrink-0 font-extrabold text-slate-900">{formatCurrency(item.amount)}</p>
                  </Link>
                );
              })}
            </div>
          )}
        </Card>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Who owes you */}
          {(overview?.balances ?? []).filter(b => b.balance > 0.01).length > 0 && (
            <Card>
              <div className="mb-3 flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
                <h2 className="font-bold text-ink">Owed to you</h2>
              </div>
              <div className="space-y-2">
                {(overview?.balances ?? [])
                  .filter(b => b.balance > 0.01)
                  .slice(0, 4)
                  .map(b => (
                    <div key={b.user.id} className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-700">{b.user.name}</p>
                      <span className="font-extrabold text-emerald-700 text-sm">{formatCurrency(b.balance)}</span>
                    </div>
                  ))}
              </div>
              <Link to="/balances" className="mt-3 block text-xs font-bold text-primary-600">
                View all balances →
              </Link>
            </Card>
          )}

          {/* Quick tools */}
          <Card>
            <h2 className="mb-3 font-bold text-ink">Quick tools</h2>
            <div className="space-y-2">
              <Link to="/scan">
                <div className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 hover:border-primary-200 hover:bg-primary-50/40 transition">
                  <span className="rounded-lg bg-sky-50 p-2 text-sky-700"><DocumentTextIcon className="h-4 w-4" /></span>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Scan receipt</p>
                    <p className="text-xs text-slate-500">OCR-powered</p>
                  </div>
                  <ArrowRightIcon className="ml-auto h-4 w-4 text-slate-400" />
                </div>
              </Link>
              <button onClick={seedSampleSplit} className="w-full flex items-center gap-3 rounded-lg border border-slate-100 p-3 hover:border-primary-200 hover:bg-primary-50/40 transition">
                <span className="rounded-lg bg-amber-50 p-2 text-amber-700"><SparklesIcon className="h-4 w-4" /></span>
                <div className="text-left">
                  <p className="font-bold text-slate-900 text-sm">Sample bill</p>
                  <p className="text-xs text-slate-500">Try a demo split</p>
                </div>
                <ArrowRightIcon className="ml-auto h-4 w-4 text-slate-400" />
              </button>
              <Link to="/history">
                <div className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 hover:border-primary-200 hover:bg-primary-50/40 transition">
                  <span className="rounded-lg bg-slate-100 p-2 text-slate-700"><ClockIcon className="h-4 w-4" /></span>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Split history</p>
                    <p className="text-xs text-slate-500">Past OCR splits</p>
                  </div>
                  <ArrowRightIcon className="ml-auto h-4 w-4 text-slate-400" />
                </div>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const GuestHome: React.FC = () => {
  const checkpoints = [
    { icon: CameraIcon, label: 'Scan any bill' },
    { icon: SparklesIcon, label: 'AI-assisted OCR' },
    { icon: UserGroupIcon, label: 'Instant split' },
    { icon: QrCodeIcon, label: 'UPI QR' },
  ];

  return (
    <div className="grid min-h-[calc(100vh-8rem)] items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <p className="mb-3 inline-flex rounded-full bg-primary-50 px-3 py-1 text-sm font-bold text-primary-700">
            Fast · Simple · Smart
          </p>
          <h1 className="font-display text-5xl font-extrabold tracking-normal text-ink sm:text-6xl">
            QuickSplit
          </h1>
          <p className="mt-4 max-w-xl text-lg font-medium leading-8 text-slate-600">
            Scan receipts, split with friends, track group expenses, and settle through UPI — all in one app.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link to="/register">
            <Button size="lg">
              Create account
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary" size="lg">Login</Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {checkpoints.map((item) => (
            <div key={item.label} className="rounded-lg border border-slate-200 bg-white p-3 shadow-soft">
              <item.icon className="mb-2 h-5 w-5 text-primary-600" />
              <p className="text-sm font-bold text-slate-800">{item.label}</p>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mx-auto w-full max-w-sm"
      >
        <div className="rounded-[2rem] border border-slate-200 bg-white p-3 shadow-soft">
          <div className="rounded-[1.5rem] bg-[#f6f7fb] p-4">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500">Today</p>
                <p className="font-display text-xl font-bold text-ink">Group expenses</p>
              </div>
              <span className="rounded-lg bg-primary-600 p-2 text-white">
                <ScaleIcon className="h-5 w-5" />
              </span>
            </div>

            <div className="rounded-lg bg-gradient-to-br from-primary-700 to-primary-500 p-4 text-white shadow-button">
              <p className="text-sm font-semibold text-white/70">Net balance</p>
              <p className="mt-1 text-3xl font-extrabold">+₹850.00</p>
              <div className="mt-4 h-2 rounded-full bg-white/20">
                <div className="h-2 w-3/5 rounded-full bg-emerald-300" />
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {[
                ['Dinner at Cafe', '₹450', 'You lent ₹300', 'bg-emerald-50 text-emerald-700'],
                ['Office Lunch', '₹350', 'Settled ✓', 'bg-slate-100 text-slate-600'],
                ['Weekend Trip', '₹1,250', 'You owe ₹400', 'bg-rose-50 text-rose-700'],
              ].map(([name, amount, status, tone]) => (
                <div key={name} className="flex items-center justify-between rounded-lg bg-white p-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{name}</p>
                    <p className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${tone}`}>
                      {status}
                    </p>
                  </div>
                  <p className="font-bold text-slate-900">{amount}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};
