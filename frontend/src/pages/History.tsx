import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useSplit } from '@/hooks/useSplit';
import { formatDate } from '@/utils/helpers';
import { formatCurrency } from '@/utils/upi';
import type { SplitHistoryItem } from '@/services/api/splitAPI';
import {
  ArrowRightIcon,
  ClockIcon,
  DocumentTextIcon,
  PlusIcon,
  ReceiptPercentIcon,
} from '@heroicons/react/24/outline';

export const History: React.FC = () => {
  const { useHistory } = useSplit();
  const { data: splits = [], isLoading } = useHistory();
  const totalTracked = splits.reduce((sum, split) => sum + split.total_amount, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 rounded-lg bg-white p-5 shadow-soft md:flex-row md:items-center">
        <div>
          <p className="text-sm font-bold text-slate-500">History</p>
          <h1 className="font-display text-3xl font-extrabold tracking-normal text-ink">
            Split timeline
          </h1>
        </div>
        <Link to="/scan">
          <Button>
            <PlusIcon className="mr-2 h-5 w-5" />
            New bill
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Splits" value={splits.length.toString()} icon={DocumentTextIcon} />
        <MetricCard label="Tracked" value={formatCurrency(totalTracked)} icon={ReceiptPercentIcon} />
        <MetricCard
          label="People"
          value={splits.reduce((sum, split) => sum + split.participant_count, 0).toString()}
          icon={ClockIcon}
        />
      </div>

      <Card>
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-20 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : splits.length > 0 ? (
          <div className="space-y-3">
            {splits.map((split: SplitHistoryItem) => (
              <Link
                key={split.split_id}
                to={`/review/${split.split_id}`}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg border border-slate-200 p-3 transition hover:border-primary-200 hover:bg-primary-50/50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                  <ReceiptPercentIcon className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-lg font-extrabold text-slate-900">
                    {formatCurrency(split.total_amount)}
                  </p>
                  <p className="text-sm font-medium text-slate-500">
                    {split.participant_count} people · {formatDate(split.created_at)}
                  </p>
                </div>
                <ArrowRightIcon className="h-5 w-5 text-primary-600" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <ClockIcon className="mx-auto h-10 w-10 text-slate-400" />
            <h2 className="mt-3 font-display text-2xl font-extrabold text-ink">No history yet</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm font-medium text-slate-500">
              Finished splits will appear here with totals, people, and payment QR links.
            </p>
            <Link to="/scan" className="mt-5 inline-flex">
              <Button>Scan bill</Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
};

interface MetricCardProps {
  label: string;
  value: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, icon: Icon }) => (
  <Card className="flex items-center gap-3">
    <span className="rounded-lg bg-primary-50 p-2 text-primary-700">
      <Icon className="h-6 w-6" />
    </span>
    <div className="min-w-0">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="truncate text-xl font-extrabold text-slate-900">{value}</p>
    </div>
  </Card>
);
