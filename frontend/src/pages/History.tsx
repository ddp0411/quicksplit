import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { useSplit } from '@/hooks/useSplit';
import { formatDate } from '@/utils/helpers';
import type { SplitHistoryItem } from '@/services/api/splitAPI';

export const History: React.FC = () => {
  const { useHistory } = useSplit();
  const { data: splits, isLoading } = useHistory();

  if (isLoading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-center">Split History</h1>

      {splits && splits.length > 0 ? (
        <div className="space-y-4">
          {splits.map((split: SplitHistoryItem) => (
            <Link key={split.split_id} to={`/review/${split.split_id}`}>
              <Card hover>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-2xl font-bold text-primary-600">
                      ₹{split.total_amount.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {split.participant_count} participants
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {formatDate(split.created_at)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">View Details →</div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center text-gray-600">
            No splits yet. Start by scanning a bill!
          </div>
        </Card>
      )}
    </div>
  );
};
