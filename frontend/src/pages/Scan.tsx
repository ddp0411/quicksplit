import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Tab } from '@headlessui/react';
import clsx from 'clsx';
import { OCRScanner } from '@/components/ocr/OCRScanner';
import { OCRUpload } from '@/components/ocr/OCRUpload';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useOCRStore } from '@/state/ocrStore';
import { useSplitStore } from '@/state/splitStore';
import { formatCurrency } from '@/utils/upi';
import {
  ArrowRightIcon,
  BoltIcon,
  CheckCircleIcon,
  DocumentMagnifyingGlassIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

const sampleReceiptText = `THE FOOD CAFE
22, Park Street, Kolkata

Pasta Alfredo        1    240.00
Garlic Bread         1    120.00
Mocktail             2    160.00
Tax (5%)                   26.00

Grand Total              ₹546.00`;

const scanTraits = [
  { label: 'Fast', icon: BoltIcon },
  { label: 'Smart', icon: SparklesIcon },
  { label: 'Trusted', icon: CheckCircleIcon },
];

export const Scan: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get('group');
  const { result, error, setResult } = useOCRStore();
  const { setBillTotal } = useSplitStore();
  const [reviewTotal, setReviewTotal] = useState('');

  useEffect(() => {
    if (result?.detectedTotal) {
      setReviewTotal(result.detectedTotal.toFixed(2));
    }
  }, [result?.detectedTotal]);

  const useSampleReceipt = () => {
    setResult({
      text: sampleReceiptText,
      confidence: 96,
      detectedTotal: 546,
      processedImage: null,
      imageHash: 'sample-food-cafe-546',
      validationMessage: 'Sample receipt loaded',
      detectionStrategy: 'keyword',
    });
  };

  const handleProceed = () => {
    const total = Number.parseFloat(reviewTotal);
    if (Number.isFinite(total) && total > 0) {
      const rounded = Math.round(total * 100) / 100;
      if (groupId) {
        // Came from a group — go straight to AddExpense with amount + group pre-filled
        navigate(`/expenses/new?group=${groupId}&amount=${rounded}`);
      } else {
        setBillTotal(rounded);
        navigate('/split');
      }
    }
  };

  const confidence = result?.confidence ?? 0;
  const parsedReviewTotal = Number.parseFloat(reviewTotal);
  const canProceed = Number.isFinite(parsedReviewTotal) && parsedReviewTotal > 0;

  return (
    <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="space-y-5">
        <div className="rounded-lg bg-gradient-to-br from-ink to-primary-800 p-5 text-white shadow-soft">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-white/65">Scan bill</p>
              <h1 className="mt-1 font-display text-3xl font-extrabold tracking-normal">
                Capture the receipt total.
              </h1>
            </div>
            <span className="rounded-lg bg-white/10 p-3">
              <DocumentMagnifyingGlassIcon className="h-7 w-7" />
            </span>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2 text-center">
            {scanTraits.map((item) => (
              <div key={item.label} className="rounded-lg bg-white/10 p-3">
                <item.icon className="mx-auto h-5 w-5" />
                <p className="mt-1 text-xs font-bold">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <Card>
          <Tab.Group>
            <Tab.List className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
              {['Upload', 'Camera'].map((tab) => (
                <Tab
                  key={tab}
                  className={({ selected }) =>
                    clsx(
                      'rounded-lg px-3 py-2.5 text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                      selected
                        ? 'bg-white text-primary-700 shadow-sm'
                        : 'text-slate-500 hover:text-slate-900'
                    )
                  }
                >
                  {tab}
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels className="mt-4">
              <Tab.Panel>
                <OCRUpload />
              </Tab.Panel>
              <Tab.Panel>
                <OCRScanner />
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>

          <Button type="button" variant="secondary" onClick={useSampleReceipt} className="mt-4 w-full">
            <SparklesIcon className="mr-2 h-5 w-5" />
            Use sample receipt
          </Button>
        </Card>
      </section>

      <aside className="space-y-5">
        {error && (
          <Card className="border-rose-200 bg-rose-50 text-rose-700">
            <p className="font-semibold">{error}</p>
          </Card>
        )}

        <Card>
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-slate-500">Review bill</p>
              <h2 className="font-display text-2xl font-extrabold tracking-normal text-ink">
                OCR result
              </h2>
            </div>
            <span className="rounded-full bg-primary-50 px-3 py-1 text-sm font-bold text-primary-700">
              {confidence.toFixed(0)}%
            </span>
          </div>

          {result ? (
            <div className="space-y-5">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-500">Detected total</p>
                <p className="mt-1 text-4xl font-extrabold text-emerald-600">
                  {result.detectedTotal ? formatCurrency(result.detectedTotal) : 'Not found'}
                </p>
                {result.validationMessage && (
                  <p className="mt-2 text-sm font-medium text-slate-500">
                    {result.validationMessage}
                    {result.detectionStrategy ? ` · ${result.detectionStrategy}` : ''}
                  </p>
                )}
              </div>

              <Input
                label="Confirm amount"
                inputMode="decimal"
                value={reviewTotal}
                onChange={(event) => setReviewTotal(event.target.value)}
                placeholder="546.00"
              />

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-700">Extracted text</p>
                  <span className="text-xs font-bold text-slate-400">{result.text.length} chars</span>
                </div>
                <pre className="max-h-56 overflow-y-auto rounded-lg border border-slate-200 bg-white p-3 text-xs leading-5 text-slate-700">
                  {result.text}
                </pre>
              </div>

              <Button onClick={handleProceed} disabled={!canProceed} className="w-full">
                Looks good
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Button>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <DocumentMagnifyingGlassIcon className="mx-auto h-10 w-10 text-slate-400" />
              <p className="mt-3 font-bold text-slate-900">No receipt scanned</p>
              <p className="mt-1 text-sm text-slate-500">Upload, capture, or load a sample to continue.</p>
            </div>
          )}
        </Card>
      </aside>
    </div>
  );
};
