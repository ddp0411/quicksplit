import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../../config/api';

// Auth handlers are injected from App.tsx (AuthBridge) so this module stays free
// of React/store imports and circular-dependency risk.
let _getToken: () => string | null = () => null;
let _getRefreshToken: () => string | null = () => null;
let _setTokens: (token: string, refreshToken?: string) => void = () => {};
let _logout: () => void = () => {};

export function setAuthHandlers(
  getToken: () => string | null,
  getRefreshToken: () => string | null,
  setTokens: (token: string, refreshToken?: string) => void,
  logout: () => void
) {
  _getToken = getToken;
  _getRefreshToken = getRefreshToken;
  _setTokens = setTokens;
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

function isAuthPath(url?: string): boolean {
  return !!url && (
    url.includes('/auth/login') ||
    url.includes('/auth/register') ||
    url.includes('/auth/refresh') ||
    url.includes('/auth/logout')
  );
}

// Single-flight refresh: concurrent 401s all await the same refresh call.
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refresh = _getRefreshToken();
  if (!refresh) throw new Error('No refresh token');
  // Bare axios (not axiosClient) so this call doesn't re-enter the interceptor.
  const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refresh });
  const newAccess: string = res.data.access;
  const newRefresh: string | undefined = res.data.refresh; // present when rotation is on
  _setTokens(newAccess, newRefresh);
  return newAccess;
}

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = error.response?.status;

    // On a 401, try a one-time silent refresh and replay the request.
    if (status === 401 && original && !original._retry && !isAuthPath(original.url) && _getRefreshToken()) {
      original._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => { refreshPromise = null; });
        }
        const newAccess = await refreshPromise;
        if (original.headers) original.headers.Authorization = `Bearer ${newAccess}`;
        return axiosClient(original);
      } catch (refreshError) {
        _logout();
        return Promise.reject(refreshError);
      }
    }

    if (status === 401) {
      _logout();
    }
    return Promise.reject(error);
  }
);
