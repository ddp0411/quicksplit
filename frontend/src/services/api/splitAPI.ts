// Split API
import { axiosClient } from './axiosClient';

export const splitAPI = {
  createSplit: async (data: any) => {
    const response = await axiosClient.post('/split/create', data);
    return response.data;
  },

  getSplit: async (splitId: string) => {
    const response = await axiosClient.get(`/split/${splitId}`);
    return response.data;
  },

  getAllSplits: async () => {
    const response = await axiosClient.get('/split/all');
    return response.data;
  },

  updateSplit: async (splitId: string, data: any) => {
    const response = await axiosClient.put(`/split/${splitId}`, data);
    return response.data;
  },

  deleteSplit: async (splitId: string) => {
    const response = await axiosClient.delete(`/split/${splitId}`);
    return response.data;
  },
};

