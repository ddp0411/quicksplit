// Dataset API
import { axiosClient } from './axiosClient';

export const datasetAPI = {
  uploadDataset: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosClient.post('/dataset/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getDatasetStatus: async (datasetId: string) => {
    const response = await axiosClient.get(`/dataset/status/${datasetId}`);
    return response.data;
  },
};

