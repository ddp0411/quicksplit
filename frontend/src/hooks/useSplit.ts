import { useMutation, useQuery } from '@tanstack/react-query';
import { splitAPI, SplitRequest } from '@/services/api/splitAPI';
import { queryClient } from '@/app/queryClient';

export const useSplit = () => {
  const createMutation = useMutation({
    mutationFn: (data: SplitRequest) => splitAPI.createSplit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['splits'] });
    },
  });

  const useGetSplit = (splitId: string) => {
    return useQuery({
      queryKey: ['split', splitId],
      queryFn: () => splitAPI.getSplit(splitId),
      enabled: !!splitId,
    });
  };

  const useHistory = () => {
    return useQuery({
      queryKey: ['splits'],
      queryFn: () => splitAPI.getUserSplits(),
    });
  };

  return {
    createSplit: createMutation.mutate,
    isCreating: createMutation.isPending,
    createError: createMutation.error,
    useGetSplit,
    useHistory,
  };
};
