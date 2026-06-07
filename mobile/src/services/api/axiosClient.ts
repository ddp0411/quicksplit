import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../../config/api';

// Import from shared state — works in RN (pure Zustand, no browser deps)
// We import the store directly; no circular dep risk in RN
let _getToken: () => string | null = () => null;
let _logout: () => void = () => {};

export function setAuthHandlers(
  getToken: () => string | null,
  logout: () => void
) {
  _getToken = getToken;
  _logout = logout;
}

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = _getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      _logout();
    }
    return Promise.reject(error);
  }
);
