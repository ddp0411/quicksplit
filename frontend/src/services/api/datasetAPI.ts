import { axiosClient } from './axiosClient';

export interface DatasetSubmission {
  image: File;
  ocr_text: string;
  actual_total: number;
  metadata?: Record<string, unknown>;
}

export const datasetAPI = {
  submitReceipt: async (data: DatasetSubmission) => {
    const formData = new FormData();
    formData.append('file', data.image);
    formData.append('ocr_text', data.ocr_text);
    formData.append('actual_total', data.actual_total.toString());
    if (data.metadata) {
      formData.append('metadata', JSON.stringify(data.metadata));
    }

    const response = await axiosClient.post('/dataset/submit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getStats: async () => {
    const response = await axiosClient.get('/dataset/stats');
    return response.data;
  },
};
