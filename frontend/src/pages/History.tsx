// History page
import { useQuery } from '@tanstack/react-query';
import { splitAPI } from '../services/api/splitAPI';
import { Card } from '../components/ui/Card';

export const History = () => {
  const { data: splits, isLoading } = useQuery({
    queryKey: ['splits'],
    queryFn: splitAPI.getAllSplits,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Split History</h1>
      <div className="space-y-4">
        {splits?.map((split) => (
          <Card key={split.id}>
            <h3 className="font-semibold">{split.title}</h3>
            <p className="text-gray-600">Amount: ₹{split.totalAmount}</p>
            <p className="text-sm text-gray-500">
              Created: {new Date(split.createdAt).toLocaleDateString()}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
};

