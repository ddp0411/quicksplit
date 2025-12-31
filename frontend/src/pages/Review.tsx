import React from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { QRGenerator } from '@/components/payments/QRGenerator';
import { useSplit } from '@/hooks/useSplit';

export const Review: React.FC = () => {
  const { splitId } = useParams<{ splitId: string }>();
  const { useGetSplit } = useSplit();
  const { data: split, isLoading } = useGetSplit(splitId!);

  if (isLoading) {
    return <div className="text-center">Loading...</div>;
  }

  if (!split) {
    return <div className="text-center">Split not found</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-center">Payment Collection</h1>

      <Card>
        <div className="text-center mb-6">
          <div className="text-sm text-gray-600 mb-2">Total Amount</div>
          <div className="text-4xl font-bold text-primary-600">
            ₹{split.total_amount.toFixed(2)}
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {split.participants.map((participant) => (
          <QRGenerator
            key={participant.id}
            upiLink={participant.upi_link}
            amount={participant.amount}
            participantName={participant.name}
          />
        ))}
      </div>
    </div>
  );
};
