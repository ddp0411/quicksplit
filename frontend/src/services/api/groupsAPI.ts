import { axiosClient } from './axiosClient';
import type { UserMini } from './friendsAPI';

export interface GroupMember {
  id: number;
  user: UserMini;
  role: 'admin' | 'member';
  joined_at: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  category: 'home' | 'trip' | 'couple' | 'work' | 'other';
  created_by: UserMini;
  is_active: boolean;
  member_count: number;
  your_balance: number;
  created_at: string;
}

export interface GroupDetail extends Group {
  members: GroupMember[];
  updated_at: string;
}

export interface MemberBalance {
  user: UserMini;
  balance: number;
}

export interface SimplifiedDebt {
  from_user: UserMini;
  to_user: UserMini;
  amount: number;
}

export interface GroupBalances {
  member_balances: MemberBalance[];
  simplified_debts: SimplifiedDebt[];
  total_expenses: number;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  category: string;
  member_emails?: string[];
}

export const groupsAPI = {
  getGroups: async (): Promise<Group[]> => {
    const res = await axiosClient.get<Group[]>('/groups/');
    return res.data;
  },

  createGroup: async (data: CreateGroupRequest): Promise<GroupDetail> => {
    const res = await axiosClient.post<GroupDetail>('/groups/', data);
    return res.data;
  },

  getGroup: async (id: string): Promise<GroupDetail> => {
    const res = await axiosClient.get<GroupDetail>(`/groups/${id}/`);
    return res.data;
  },

  updateGroup: async (id: string, data: Partial<CreateGroupRequest>): Promise<GroupDetail> => {
    const res = await axiosClient.patch<GroupDetail>(`/groups/${id}/`, data);
    return res.data;
  },

  deleteGroup: async (id: string): Promise<void> => {
    await axiosClient.delete(`/groups/${id}/`);
  },

  addMember: async (groupId: string, email: string): Promise<void> => {
    await axiosClient.post(`/groups/${groupId}/members/`, { email });
  },

  removeMember: async (groupId: string, userId: string): Promise<void> => {
    await axiosClient.delete(`/groups/${groupId}/members/${userId}/`);
  },

  getBalances: async (groupId: string): Promise<GroupBalances> => {
    const res = await axiosClient.get<GroupBalances>(`/groups/${groupId}/balances/`);
    return res.data;
  },
};
