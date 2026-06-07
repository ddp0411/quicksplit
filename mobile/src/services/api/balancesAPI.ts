import { axiosClient } from './axiosClient';
import type { UserMini } from './friendsAPI';

export interface BalanceWithUser {
  user: UserMini;
  balance: number; // positive = they owe you, negative = you owe them
}

export interface OverallBalance {
  total_owed_to_you: number;
  total_you_owe: number;
  net_balance: number;
  balances: BalanceWithUser[];
}

export interface Settlement {
  id: string;
  group: string | null;
  from_user: UserMini;
  to_user: UserMini;
  amount: number;
  currency: string;
  notes: string;
  upi_transaction_id: string;
  upi_link?: string;
  qr_code?: string;
  created_at: string;
}

export interface CreateSettlementRequest {
  to_user_id: string;
  amount: number;
  group_id?: string | null;
  notes?: string;
  upi_transaction_id?: string;
}

export const balancesAPI = {
  getOverallBalance: async (): Promise<OverallBalance> => {
    const res = await axiosClient.get<OverallBalance>('/balances/');
    return res.data;
  },

  getSettlements: async (): Promise<Settlement[]> => {
    const res = await axiosClient.get<Settlement[]>('/settlements/');
    return res.data;
  },

  createSettlement: async (data: CreateSettlementRequest): Promise<Settlement> => {
    const res = await axiosClient.post<Settlement>('/settlements/', data);
    return res.data;
  },
};
