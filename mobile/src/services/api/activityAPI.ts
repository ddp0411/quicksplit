import { axiosClient } from './axiosClient';
import type { UserMini } from './friendsAPI';

export interface ActivityItem {
  type: 'expense' | 'settlement';
  id: string;
  description: string;
  amount: number;
  your_share: number;
  category: string;
  group_name: string | null;
  paid_by?: UserMini;
  from_user?: UserMini;
  to_user?: UserMini;
  is_outgoing?: boolean;
  date: string;
  created_at: string;
}

export const activityAPI = {
  getFeed: async (limit = 30): Promise<ActivityItem[]> => {
    const res = await axiosClient.get<ActivityItem[]>('/activity/', { params: { limit } });
    return res.data;
  },
};
