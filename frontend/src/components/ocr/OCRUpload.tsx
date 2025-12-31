import React, { useState } from 'react';
import { createWorker } from 'tesseract.js';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useOCRStore } from '@/state/ocrStore';
import { ImageProcessor } from './ImageProcessor';
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';

export const OCRUpload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { isProcessing, setProcessing, setResult, setError } = useOCRStore();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const processImage = async () => {
    if (!selectedFile) return;

    setProcessing(true);

    try {
      // Resize if needed
      const resized = await ImageProcessor.resizeImage(selectedFile);
      
      // Preprocess image
      const processedImage = await ImageProcessor.preprocessImage(resized);

      // Initialize Tesseract worker with progress tracking
      const worker = await createWorker('eng', undefined, {
        logger: (m) => console.log(m),
      });

      // Perform OCR
      const { data } = await worker.recognize(processedImage);
      
      // Detect total amount
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
    const totalKeywords = ['total', 'grand total', 'amount due', 'net amount', 'bill amount'];
    const lines = text.toLowerCase().split('\n');
    let detectedAmount: number | null = null;
    let highestAmount = 0;

    for (const line of lines) {
      const hasKeyword = totalKeywords.some(keyword => line.includes(keyword));
      const amounts = line.match(/(?:rs\.?|₹)?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi);
      
      if (amounts) {
        amounts.forEach(amountStr => {
          const cleaned = amountStr.replace(/[^\d.]/g, '');
          const amount = parseFloat(cleaned);
          
          if (hasKeyword && !isNaN(amount)) {
            detectedAmount = amount;
          }
          
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
      <h2 className="text-2xl font-bold mb-4">Upload Receipt</h2>
      
      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <ArrowUpTrayIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600">Click to upload or drag and drop</p>
            <p className="text-sm text-gray-400 mt-1">PNG, JPG up to 10MB</p>
          </label>
        </div>

        {preview && (
          <div>
            <img src={preview} alt="Preview" className="w-full rounded-lg" />
            <Button
              onClick={processImage}
              loading={isProcessing}
              className="w-full mt-4"
            >
              Process Receipt
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
