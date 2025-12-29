// OCR API
import { axiosClient } from './axiosClient';

export const ocrAPI = {
  scanReceipt: async (imageData: string) => {
    const response = await axiosClient.post('/ocr/scan', { image: imageData });
    return response.data;
  },

  uploadReceipt: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosClient.post('/ocr/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getOCRResult: async (taskId: string) => {
    const response = await axiosClient.get(`/ocr/result/${taskId}`);
    return response.data;
  },
};

