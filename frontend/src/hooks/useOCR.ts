import { useMutation } from '@tanstack/react-query';
import { ocrAPI, OCRUploadRequest } from '@/services/api/ocrAPI';

export const useOCR = () => {
  const uploadMutation = useMutation({
    mutationFn: (data: OCRUploadRequest) => ocrAPI.uploadAndProcess(data),
  });

  const validateMutation = useMutation({
    mutationFn: ocrAPI.validateOCR,
  });

  return {
    uploadAndProcess: uploadMutation.mutate,
    validate: validateMutation.mutate,
    isUploading: uploadMutation.isPending,
    uploadError: uploadMutation.error,
  };
};
