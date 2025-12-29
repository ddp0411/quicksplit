// OCR store
import { create } from 'zustand';

interface OCRResult {
  text: string;
  items: Array<{ name: string; price: number }>;
  total: number;
  date?: string;
}

interface OCRStore {
  ocrResult: OCRResult | null;
  setOCRResult: (result: OCRResult) => void;
  clearOCRResult: () => void;
}

export const useOCRStore = create<OCRStore>((set) => ({
  ocrResult: null,
  setOCRResult: (result) => set({ ocrResult: result }),
  clearOCRResult: () => set({ ocrResult: null }),
}));

