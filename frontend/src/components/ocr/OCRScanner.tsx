import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import { createWorker } from 'tesseract.js';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useOCRStore } from '@/state/ocrStore';
import { ImageProcessor } from './ImageProcessor';
import { CameraIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export const OCRScanner: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const { setProcessing, setResult, setError } = useOCRStore();

  const captureAndProcess = async () => {
    if (!webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      setError('Failed to capture image');
      return;
    }

    setProcessing(true);
    setIsCameraActive(false);

    try {
      // Convert base64 to file for processing
      const blob = await fetch(imageSrc).then(r => r.blob());
      const file = new File([blob], 'receipt.jpg', { type: 'image/jpeg' });

      // Preprocess image
      const processedImage = await ImageProcessor.preprocessImage(file);

      // Initialize Tesseract worker
      const worker = await createWorker('eng');

      // Perform OCR
      const { data } = await worker.recognize(processedImage);
      
      // Detect total amount from text
      const detectedTotal = detectTotalAmount(data.text);

      setResult({
        text: data.text,
        confidence: data.confidence,
        detectedTotal,
        processedImage,
      });

      await worker.terminate();
    } catch (error) {
      console.error('OCR Error:', error);
      setError('Failed to process image. Please try again.');
    }
  };

  const detectTotalAmount = (text: string): number | null => {
    // Keywords that typically appear near total amounts
    const totalKeywords = ['total', 'grand total', 'amount due', 'net amount', 'bill amount'];
    
    const lines = text.toLowerCase().split('\n');
    let detectedAmount: number | null = null;
    let highestAmount = 0;

    for (const line of lines) {
      // Check if line contains total keyword
      const hasKeyword = totalKeywords.some(keyword => line.includes(keyword));
      
      // Extract numbers (supports formats like 123.45, 1,234.56, Rs 123, ₹123)
      const amounts = line.match(/(?:rs\.?|₹)?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi);
      
      if (amounts) {
        amounts.forEach(amountStr => {
          const cleaned = amountStr.replace(/[^\d.]/g, '');
          const amount = parseFloat(cleaned);
          
          if (hasKeyword && !isNaN(amount)) {
            detectedAmount = amount;
          }
          
          // Fallback: track highest amount
          if (amount > highestAmount) {
            highestAmount = amount;
          }
        });
      }
    }

    return detectedAmount || (highestAmount > 0 ? highestAmount : null);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Scan Receipt</h2>
      
      {isCameraActive ? (
        <div className="space-y-4">
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="w-full rounded-lg"
            videoConstraints={{
              facingMode: 'environment',
            }}
          />
          <div className="flex space-x-4">
            <Button onClick={captureAndProcess} className="flex-1">
              <CameraIcon className="h-5 w-5 mr-2 inline" />
              Capture & Process
            </Button>
            <Button variant="secondary" onClick={() => setIsCameraActive(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button onClick={() => setIsCameraActive(true)} className="w-full">
          <CameraIcon className="h-5 w-5 mr-2 inline" />
          Open Camera
        </Button>
      )}
    </Card>
  );
};
