import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { CheckCircleIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';

interface QRGeneratorProps {
  upiLink: string;
  qrCode?: string;
  amount: number;
  participantName: string;
  paymentStatus?: 'pending' | 'paid' | 'failed';
  onMarkPaid?: () => void;
  markingPaid?: boolean;
}

export const QRGenerator: React.FC<QRGeneratorProps> = ({
  upiLink,
  qrCode,
  amount,
  participantName,
  paymentStatus = 'pending',
  onMarkPaid,
  markingPaid = false,
}) => {
  const copyLink = async () => {
    await navigator.clipboard?.writeText(upiLink);
  };

  return (
    <Card className="text-center">
      <div className="mb-4 flex items-center justify-between gap-3 text-left">
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold text-slate-900">{participantName}</h3>
          <p className="text-2xl font-extrabold text-primary-700">₹{amount.toFixed(2)}</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold capitalize text-emerald-700">
          {paymentStatus}
        </span>
      </div>
      
      <div className="inline-block rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        {qrCode ? (
          <img src={qrCode} alt={`${participantName} UPI QR`} className="h-[200px] w-[200px]" />
        ) : (
          <QRCodeCanvas
            value={upiLink}
            size={200}
            level="H"
            includeMargin
          />
        )}
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-2">
        <a
          href={upiLink}
          className="inline-flex h-9 items-center justify-center rounded-lg bg-primary-600 px-3 text-sm font-semibold text-white shadow-button transition hover:bg-primary-700"
        >
          Open UPI
        </a>
        <Button type="button" variant="secondary" size="sm" onClick={copyLink}>
          <ClipboardDocumentIcon className="mr-1.5 h-4 w-4" />
          Copy
        </Button>
      </div>

      {onMarkPaid && paymentStatus !== 'paid' && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          loading={markingPaid}
          onClick={onMarkPaid}
          className="mt-2 w-full text-emerald-700 hover:bg-emerald-50"
        >
          <CheckCircleIcon className="mr-1.5 h-4 w-4" />
          Mark paid
        </Button>
      )}
    </Card>
  );
};
