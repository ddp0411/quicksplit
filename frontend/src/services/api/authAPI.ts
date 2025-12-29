// Auth API
import { axiosClient } from './axiosClient';

export const authAPI = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await axiosClient.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    return response.data;
  },

  register: async (data: { email: string; password: string; name: string }) => {
    const response = await axiosClient.post('/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    return response.data;
  },

  logout: async () => {
    localStorage.removeItem('auth_token');
  },

  getCurrentUser: async () => {
    const response = await axiosClient.get('/auth/me');
    return response.data;
  },
};

