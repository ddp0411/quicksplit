import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import { createWorker } from 'tesseract.js';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useOCRStore } from '@/state/ocrStore';
import { ImageProcessor } from './ImageProcessor';
import { ocrAPI } from '@/services/api/ocrAPI';
import { CameraIcon } from '@heroicons/react/24/outline';

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
      const imageHash = await ImageProcessor.calculateHash(file);

      // Initialize Tesseract worker
      const worker = await createWorker('eng');

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
