import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const getApiBaseUrl = () => {
  // Using relative '/api/v1' so requests are same-origin and pass through Next.js rewrites to store cookies.
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL?.startsWith('/')
      ? process.env.NEXT_PUBLIC_API_URL
      : '/api/v1';
  }
  return (
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:8080/api/v1'
  );
};

const apiBaseUrl = getApiBaseUrl();

export const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true, // sends httpOnly refresh token cookie
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Mutex / Queue state for handling concurrent token refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const isAuthUrl =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/refresh') ||
      originalRequest?.url?.includes('/auth/otp');

    if ((status === 401 || status === 403) && originalRequest && !originalRequest._retry && !isAuthUrl) {
      if (isRefreshing) {
        // Refresh is already in progress — queue this request to await the new token
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (!originalRequest.headers) {
              originalRequest.headers = {};
            }
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${apiBaseUrl}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        const newAccessToken = data.accessToken;
        useAuthStore.getState().setAccessToken(newAccessToken);

        if (!originalRequest.headers) {
          originalRequest.headers = {};
        }
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().clearSession();
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  },
);
