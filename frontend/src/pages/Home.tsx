// Home page
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const Home = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8">Welcome to QuickSplit</h1>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        Split bills easily with OCR technology. Scan receipts and split costs with friends.
      </p>
      <div className="flex gap-4">
        <Link to="/scan">
          <Button>Start Scanning</Button>
        </Link>
        <Link to="/history">
          <Button variant="secondary">View History</Button>
        </Link>
      </div>
    </div>
  );
};

