// QR Generator component
import { useState } from 'react';

interface QRGeneratorProps {
  amount: number;
  upiId: string;
}

export const QRGenerator = ({ amount, upiId }: QRGeneratorProps) => {
  const [qrCode, setQrCode] = useState<string>('');

  const generateQR = () => {
    // QR code generation logic
    const upiString = `upi://pay?pa=${upiId}&am=${amount}&cu=INR`;
    // Use a QR library to generate the code
    setQrCode(upiString);
  };

  return (
    <div className="flex flex-col items-center">
      {qrCode && <div className="w-64 h-64 bg-gray-200 rounded-lg mb-4" />}
      <button onClick={generateQR}>Generate QR Code</button>
    </div>
  );
};

