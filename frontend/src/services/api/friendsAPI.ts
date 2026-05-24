import { axiosClient } from './axiosClient';

export interface UserMini {
  id: string;
  email: string;
  name: string;
  avatar_color: string;
  upi_id: string;
}

export interface Friend {
  friendship_id: number;
  user: UserMini;
  balance: number; // positive = they owe you, negative = you owe them
  status: string;
}

export interface FriendRequest {
  id: number;
  requester: UserMini;
  addressee: UserMini;
  status: string;
  created_at: string;
}

export const friendsAPI = {
  getFriends: async (): Promise<Friend[]> => {
    const res = await axiosClient.get<Friend[]>('/friends/');
    return res.data;
  },

  addFriend: async (email: string): Promise<FriendRequest> => {
    const res = await axiosClient.post<FriendRequest>('/friends/', { email });
    return res.data;
  },

  getRequests: async (): Promise<FriendRequest[]> => {
    const res = await axiosClient.get<FriendRequest[]>('/friends/requests/');
    return res.data;
  },

  acceptRequest: async (id: number): Promise<FriendRequest> => {
    const res = await axiosClient.post<FriendRequest>(`/friends/requests/${id}/accept/`);
    return res.data;
  },

  rejectRequest: async (id: number): Promise<void> => {
    await axiosClient.post(`/friends/requests/${id}/reject/`);
  },

  removeFriend: async (userId: string): Promise<void> => {
    await axiosClient.delete(`/friends/${userId}/`);
  },

  searchUsers: async (q: string): Promise<UserMini[]> => {
    const res = await axiosClient.get<UserMini[]>('/users/search/', { params: { q } });
    return res.data;
  },
};
