import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useSplit } from '@/hooks/useSplit';
import { useSplitStore } from '@/state/splitStore';
import { useUserStore } from '@/state/userStore';
import { formatDate } from '@/utils/helpers';
import { formatCurrency } from '@/utils/upi';
import {
  ArrowRightIcon,
  BoltIcon,
  CameraIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  QrCodeIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

const sampleTotal = 546;

export const Home: React.FC = () => {
  const { isAuthenticated } = useUserStore();

  return isAuthenticated ? <DashboardHome /> : <GuestHome />;
};

const DashboardHome: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { setBillTotal, reset } = useSplitStore();
  const { useHistory } = useSplit();
  const { data: splits = [], isLoading } = useHistory();
  const latestSplit = splits[0];

  const seedSampleSplit = () => {
    reset();
    setBillTotal(sampleTotal);
    navigate('/split');
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
      <section className="space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-lg bg-gradient-to-br from-primary-700 via-primary-600 to-sky-500 p-5 text-white shadow-button"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white/75">Hey {user?.name ?? 'there'}</p>
              <h1 className="mt-1 font-display text-3xl font-extrabold tracking-normal sm:text-4xl">
                Scan. Split. Pay. Done.
              </h1>
            </div>
            <div className="rounded-lg bg-white/15 p-3">
              <BoltIcon className="h-7 w-7" />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ['Total splits', splits.length || 0],
              ['Last bill', latestSplit ? formatCurrency(latestSplit.total_amount) : '₹0.00'],
              ['People', latestSplit?.participant_count ?? 0],
              ['Status', latestSplit ? 'Active' : 'Ready'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-white/14 p-3">
                <p className="text-xs font-medium text-white/70">{label}</p>
                <p className="mt-1 text-lg font-extrabold">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/scan">
              <Button variant="secondary">
                <CameraIcon className="mr-2 h-5 w-5" />
                Scan new bill
              </Button>
            </Link>
            <Button type="button" variant="ghost" onClick={seedSampleSplit} className="bg-white/10 text-white hover:bg-white/20">
              <SparklesIcon className="mr-2 h-5 w-5" />
              Sample bill
            </Button>
          </div>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: 'Fast OCR', icon: DocumentTextIcon, tone: 'bg-sky-50 text-sky-700' },
            { label: 'Paisa exact', icon: CheckCircleIcon, tone: 'bg-emerald-50 text-emerald-700' },
            { label: 'UPI ready', icon: QrCodeIcon, tone: 'bg-amber-50 text-amber-700' },
          ].map((item) => (
            <Card key={item.label} className="flex items-center gap-3">
              <span className={`rounded-lg p-2 ${item.tone}`}>
                <item.icon className="h-5 w-5" />
              </span>
              <span className="font-bold text-slate-900">{item.label}</span>
            </Card>
          ))}
        </div>
      </section>

      <aside className="space-y-5">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-ink">Recent splits</h2>
            <Link to="/history" className="text-sm font-bold text-primary-700">
              See all
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((item) => (
                <div key={item} className="h-16 animate-pulse rounded-lg bg-slate-100" />
              ))}
            </div>
          ) : splits.length > 0 ? (
            <div className="space-y-3">
              {splits.slice(0, 4).map((split) => (
                <Link
                  key={split.split_id}
                  to={`/review/${split.split_id}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 p-3 transition hover:border-primary-200 hover:bg-primary-50/50"
                >
                  <div className="min-w-0">
                    <p className="truncate font-bold text-slate-900">{formatCurrency(split.total_amount)}</p>
                    <p className="text-xs font-medium text-slate-500">
                      {split.participant_count} people · {formatDate(split.created_at)}
                    </p>
                  </div>
                  <ArrowRightIcon className="h-4 w-4 shrink-0 text-primary-600" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-primary-200 bg-primary-50/60 p-5 text-center">
              <ClockIcon className="mx-auto h-8 w-8 text-primary-600" />
              <p className="mt-2 font-bold text-slate-900">No splits yet</p>
              <p className="mt-1 text-sm text-slate-500">Your split history will appear here.</p>
            </div>
          )}
        </Card>

        <Card className="bg-ink text-white">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-white/10 p-3">
              <ShieldCheckIcon className="h-6 w-6 text-emerald-300" />
            </div>
            <div>
              <p className="font-bold">Private by default</p>
              <p className="text-sm text-white/65">JWT auth, hashed passwords, cached sessions.</p>
            </div>
          </div>
        </Card>
      </aside>
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
            Scan receipts, confirm the total, split with friends, and collect through UPI in one focused web app.
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
                <p className="font-display text-xl font-bold text-ink">Dinner split</p>
              </div>
              <span className="rounded-lg bg-primary-600 p-2 text-white">
                <QrCodeIcon className="h-5 w-5" />
              </span>
            </div>

            <div className="rounded-lg bg-gradient-to-br from-primary-700 to-primary-500 p-4 text-white shadow-button">
              <p className="text-sm font-semibold text-white/70">Total you owe</p>
              <p className="mt-1 text-3xl font-extrabold">₹1,250.00</p>
              <div className="mt-4 h-2 rounded-full bg-white/20">
                <div className="h-2 w-3/5 rounded-full bg-emerald-300" />
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {[
                ['Dinner at Cafe', '₹450.00', 'You owe ₹150', 'bg-rose-50 text-rose-700'],
                ['Office Lunch', '₹350.00', 'Settled', 'bg-emerald-50 text-emerald-700'],
                ['Weekend Trip', '₹1,250.00', 'You owe ₹400', 'bg-amber-50 text-amber-700'],
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
