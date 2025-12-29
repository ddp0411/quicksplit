// OCR hook
import { useMutation } from '@tanstack/react-query';
import { ocrAPI } from '../services/api/ocrAPI';
import { useOCRStore } from '../state/ocrStore';

export const useOCR = () => {
  const { setOCRResult } = useOCRStore();

  const scanMutation = useMutation({
    mutationFn: ocrAPI.scanReceipt,
    onSuccess: (data) => {
      setOCRResult(data);
    },
  });

  const uploadMutation = useMutation({
    mutationFn: ocrAPI.uploadReceipt,
    onSuccess: (data) => {
      setOCRResult(data);
    },
  });

  return {
    scanReceipt: scanMutation.mutate,
    uploadReceipt: uploadMutation.mutate,
    isLoading: scanMutation.isPending || uploadMutation.isPending,
  };
};

