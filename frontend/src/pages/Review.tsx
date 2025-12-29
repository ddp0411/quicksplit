// Review page
import { useOCRStore } from '../state/ocrStore';
import { Button } from '../components/ui/Button';

export const Review = () => {
  const { ocrResult } = useOCRStore();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Review Receipt</h1>
      {ocrResult ? (
        <div>
          <pre className="bg-gray-100 p-4 rounded-lg mb-4">
            {JSON.stringify(ocrResult, null, 2)}
          </pre>
          <Button>Confirm & Split</Button>
        </div>
      ) : (
        <p>No receipt data found. Please scan a receipt first.</p>
      )}
    </div>
  );
};

