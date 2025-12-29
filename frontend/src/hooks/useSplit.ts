// Split bill hook
import { useMutation, useQuery } from '@tanstack/react-query';
import { splitAPI } from '../services/api/splitAPI';
import { useSplitStore } from '../state/splitStore';

export const useSplit = () => {
  const { setSplitData } = useSplitStore();

  const createSplitMutation = useMutation({
    mutationFn: splitAPI.createSplit,
    onSuccess: (data) => {
      setSplitData(data);
    },
  });

  const getSplitQuery = (splitId: string) => {
    return useQuery({
      queryKey: ['split', splitId],
      queryFn: () => splitAPI.getSplit(splitId),
      enabled: !!splitId,
    });
  };

  return {
    createSplit: createSplitMutation.mutate,
    getSplit: getSplitQuery,
    isLoading: createSplitMutation.isPending,
  };
};

