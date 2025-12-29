// Scan page
import { OCRScanner } from '../components/ocr/OCRScanner';
import { OCRUpload } from '../components/ocr/OCRUpload';

export const Scan = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Scan Receipt</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <OCRScanner />
        <OCRUpload />
      </div>
    </div>
  );
};

