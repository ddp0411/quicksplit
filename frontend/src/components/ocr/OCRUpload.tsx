import React, { useState } from 'react';
import { createWorker } from 'tesseract.js';
import { Button } from '../ui/Button';
import { useOCRStore } from '@/state/ocrStore';
import { ImageProcessor } from './ImageProcessor';
import { ocrAPI } from '@/services/api/ocrAPI';
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

      const imageHash = await ImageProcessor.calculateHash(selectedFile);

      // Initialize Tesseract worker with progress tracking
      const worker = await createWorker('eng', undefined, {
        logger: (m: unknown) => console.log(m),
      });

      // Perform OCR
      const { data } = await worker.recognize(processedImage);
      await worker.terminate();

      const detection = ImageProcessor.detectBillTotal(data.text);
      let detectedTotal = detection.amount;
      let confidence = Math.max(data.confidence, detection.confidence);
      let validationMessage = 'Validated locally';
      let detectionStrategy: string = detection.strategy;

      try {
        const validation = await ocrAPI.validateOCR({
          text: data.text,
          detected_total: detection.amount,
          image_hash: imageHash,
        });
        detectedTotal = validation.suggested_total ?? detection.amount;
        confidence = Math.round(((data.confidence * 0.55) + (validation.confidence * 0.45)) * 10) / 10;
        validationMessage = validation.message;
        detectionStrategy = validation.strategy;
      } catch {
        validationMessage = 'Backend validation unavailable; using local OCR result';
      }

      setResult({
        text: data.text,
        confidence,
        detectedTotal,
        processedImage,
        imageHash,
        validationMessage,
        detectionStrategy,
      });
    } catch (error) {
      console.error('OCR Error:', error);
      setError('Failed to process image. Please try again.');
    }
  };

  return (
    <div>
      <h2 className="mb-4 text-lg font-bold text-slate-900">Upload receipt</h2>
      
      <div className="space-y-4">
        <div className="rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center transition-colors hover:border-primary-400 hover:bg-primary-50/40">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <ArrowUpTrayIcon className="mx-auto mb-2 h-10 w-10 text-primary-500" />
            <p className="font-bold text-slate-700">Click to upload receipt</p>
            <p className="mt-1 text-sm font-medium text-slate-400">PNG or JPG up to 10MB</p>
          </label>
        </div>

        {preview && (
          <div>
            <img src={preview} alt="Receipt preview" className="max-h-72 w-full rounded-lg object-contain" />
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
    </div>
  );
};
