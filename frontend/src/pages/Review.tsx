import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { QRGenerator } from '@/components/payments/QRGenerator';
import { useSplit } from '@/hooks/useSplit';
import { formatDate } from '@/utils/helpers';
import { formatCurrency } from '@/utils/upi';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  QrCodeIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

export const Review: React.FC = () => {
  const { splitId } = useParams<{ splitId: string }>();
  const { useGetSplit, markAsPaid, isMarkingPaid } = useSplit();
  const { data: split, isLoading } = useGetSplit(splitId ?? '');

  if (isLoading) {
    return (
      <div className="grid gap-5 md:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-80 animate-pulse rounded-lg bg-white shadow-soft" />
        ))}
      </div>
    );
  }

  if (!split) {
    return (
      <Card className="mx-auto max-w-md text-center">
        <QrCodeIcon className="mx-auto h-10 w-10 text-slate-400" />
        <h1 className="mt-3 font-display text-2xl font-extrabold text-ink">Split not found</h1>
        <Link to="/history" className="mt-4 inline-flex">
          <Button variant="secondary">Back to history</Button>
        </Link>
      </Card>
    );
  }

  const paidCount = split.participants.filter((participant) => participant.payment_status === 'paid').length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 rounded-lg bg-gradient-to-br from-primary-700 to-sky-500 p-5 text-white shadow-button md:flex-row md:items-end">
        <div>
          <Link to="/history" className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-white/75 hover:text-white">
            <ArrowLeftIcon className="h-4 w-4" />
            History
          </Link>
          <p className="text-sm font-bold text-white/70">Payment collection</p>
          <h1 className="mt-1 font-display text-4xl font-extrabold tracking-normal">
            {formatCurrency(split.total_amount)}
          </h1>
          <p className="mt-2 text-sm font-semibold text-white/70">
            {split.participants.length} people · {formatDate(split.created_at)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:min-w-72">
          <div className="rounded-lg bg-white/14 p-3">
            <CheckCircleIcon className="h-5 w-5 text-emerald-200" />
            <p className="mt-2 text-2xl font-extrabold">{paidCount}</p>
            <p className="text-xs font-semibold text-white/70">Paid</p>
          </div>
          <div className="rounded-lg bg-white/14 p-3">
            <ClockIcon className="h-5 w-5 text-amber-200" />
            <p className="mt-2 text-2xl font-extrabold">{split.participants.length - paidCount}</p>
            <p className="text-xs font-semibold text-white/70">Pending</p>
          </div>
        </div>
      </div>

      <Card>
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-primary-50 p-2 text-primary-700">
            <UserGroupIcon className="h-6 w-6" />
          </span>
          <div>
            <h2 className="font-display text-2xl font-extrabold tracking-normal text-ink">Collect payments</h2>
            <p className="text-sm font-medium text-slate-500">UPI links are ready for this split.</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {split.participants.map((participant) => (
          <QRGenerator
            key={participant.id}
            upiLink={participant.upi_link}
            qrCode={participant.qr_code}
            amount={participant.amount}
            participantName={participant.name}
            paymentStatus={participant.payment_status}
            markingPaid={isMarkingPaid}
            onMarkPaid={() => markAsPaid({ splitId: split.split_id, participantId: participant.id })}
          />
        ))}
      </div>
    </div>
  );
};
