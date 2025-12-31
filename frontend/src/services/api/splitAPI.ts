import { axiosClient } from './axiosClient';

export interface ParticipantRequest {
  name: string;
  upi_id?: string;
}

export interface SplitRequest {
  total_amount: number;
  participants: ParticipantRequest[];
  split_type: 'equal';
}

export interface SplitResponse {
  split_id: string;
  total_amount: number;
  participants: Array<{
    id: string;
    name: string;
    amount: number;
    upi_link: string;
    qr_code: string;
  }>;
  created_at: string;
}

export const splitAPI = {
  createSplit: async (data: SplitRequest): Promise<SplitResponse> => {
    const response = await axiosClient.post<SplitResponse>('/splits/create', data);
    return response.data;
  },

  getSplit: async (splitId: string): Promise<SplitResponse> => {
    const response = await axiosClient.get<SplitResponse>(`/splits/${splitId}`);
    return response.data;
  },

  getUserSplits: async () => {
    const response = await axiosClient.get('/splits/history');
    return response.data;
  },

  markAsPaid: async (splitId: string, participantId: string) => {
    const response = await axiosClient.post(`/splits/${splitId}/participants/${participantId}/paid`);
    return response.data;
  },
};
