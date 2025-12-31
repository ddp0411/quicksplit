import React from 'react';
import QRCode from 'qrcode.react';
import { Card } from '../ui/Card';

interface QRGeneratorProps {
  upiLink: string;
  amount: number;
  participantName: string;
}

export const QRGenerator: React.FC<QRGeneratorProps> = ({
  upiLink,
  amount,
  participantName,
}) => {
  return (
    <Card className="text-center">
      <h3 className="text-lg font-semibold mb-2">{participantName}</h3>
      <p className="text-2xl font-bold text-primary-600 mb-4">₹{amount.toFixed(2)}</p>
      
      <div className="bg-white p-4 inline-block rounded-lg">
        <QRCode
          value={upiLink}
          size={200}
          level="H"
          includeMargin
        />
      </div>
      
      <p className="text-sm text-gray-600 mt-4">
        Scan with any UPI app to pay
      </p>
      
      <a
        href={upiLink}
        className="mt-4 inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
      >
        Pay Now
      </a>
    </Card>
  );
};
