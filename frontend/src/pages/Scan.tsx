import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tab } from '@headlessui/react';
import clsx from 'clsx';
import { OCRScanner } from '@/components/ocr/OCRScanner';
import { OCRUpload } from '@/components/ocr/OCRUpload';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useOCRStore } from '@/state/ocrStore';
import { useSplitStore } from '@/state/splitStore';

export const Scan: React.FC = () => {
  const navigate = useNavigate();
  const { result, error } = useOCRStore();
  const { setBillTotal } = useSplitStore();

  const handleProceed = () => {
    if (result?.detectedTotal) {
      setBillTotal(result.detectedTotal);
      navigate('/split');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-center">Scan Your Receipt</h1>

      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-primary-100 p-1 max-w-md mx-auto">
          <Tab
            className={({ selected }) =>
              clsx(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                'ring-white ring-opacity-60 ring-offset-2 ring-offset-primary-400 focus:outline-none focus:ring-2',
                selected
                  ? 'bg-white shadow text-primary-700'
                  : 'text-primary-600 hover:bg-white/[0.12] hover:text-primary-700'
              )
            }
          >
            Upload Image
          </Tab>
          <Tab
            className={({ selected }) =>
              clsx(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                'ring-white ring-opacity-60 ring-offset-2 ring-offset-primary-400 focus:outline-none focus:ring-2',
                selected
                  ? 'bg-white shadow text-primary-700'
                  : 'text-primary-600 hover:bg-white/[0.12] hover:text-primary-700'
              )
            }
          >
            Use Camera
          </Tab>
        </Tab.List>
        <Tab.Panels className="mt-6">
          <Tab.Panel>
            <OCRUpload />
          </Tab.Panel>
          <Tab.Panel>
            <OCRScanner />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      {error && (
        <Card className="max-w-2xl mx-auto">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {error}
          </div>
        </Card>
      )}

      {result && (
        <Card className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">OCR Results</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detected Total
              </label>
              <div className="text-3xl font-bold text-primary-600">
                ₹{result.detectedTotal?.toFixed(2) || 'Not detected'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confidence
              </label>
              <div className="text-lg">
                {result.confidence.toFixed(1)}%
              </div>
              {result.validationMessage && (
                <div className="text-sm text-gray-500 mt-1">
                  {result.validationMessage}
                  {result.detectionStrategy ? ` (${result.detectionStrategy})` : ''}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Extracted Text
              </label>
              <div className="bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto">
                <pre className="text-sm whitespace-pre-wrap">{result.text}</pre>
              </div>
            </div>

            <Button
              onClick={handleProceed}
              disabled={!result.detectedTotal}
              className="w-full"
            >
              Proceed to Split
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
