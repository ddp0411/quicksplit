import { axiosClient } from './axiosClient';

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface RegisterRequest {
  phone_number: string;
  name: string;
  password: string;
  email?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export const authAPI = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await axiosClient.get('/auth/me');
    return response.data;
  },
};
