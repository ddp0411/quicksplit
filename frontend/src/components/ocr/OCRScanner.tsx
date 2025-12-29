// OCR Scanner component
import { useState, useRef } from 'react';
import { useOCR } from '../../hooks/useOCR';

export const OCRScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { scanReceipt } = useOCR();

  const startScanning = async () => {
    setIsScanning(true);
    // Implementation for camera access and scanning
  };

  return (
    <div className="w-full">
      <video ref={videoRef} className="w-full rounded-lg" />
      <button onClick={startScanning} disabled={isScanning}>
        {isScanning ? 'Scanning...' : 'Start Scan'}
      </button>
    </div>
  );
};

