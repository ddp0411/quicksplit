import { create } from 'zustand';

interface OCRResult {
  text: string;
  confidence: number;
  detectedTotal: number | null;
  processedImage: string | null;
  imageHash?: string;
  validationMessage?: string;
  detectionStrategy?: string;
}

interface OCRState {
  isProcessing: boolean;
  result: OCRResult | null;
  error: string | null;
  setProcessing: (isProcessing: boolean) => void;
  setResult: (result: OCRResult) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useOCRStore = create<OCRState>((set) => ({
  isProcessing: false,
  result: null,
  error: null,
  setProcessing: (isProcessing) => set({ isProcessing }),
  setResult: (result) => set({ result, error: null, isProcessing: false }),
  setError: (error) => set({ error, isProcessing: false }),
  reset: () => set({ isProcessing: false, result: null, error: null }),
}));
