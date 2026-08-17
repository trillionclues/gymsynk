import axios from 'axios'
import { useAuthStore } from '@/stores/authStore';

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080',
    withCredentials: true,  // sends httpOnly refresh token cookie
});

api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if(token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'}/api/v1/auth/refresh`,
          {},
          { withCredentials: true },
        );
        useAuthStore.getState().setAccessToken(data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        useAuthStore.getState().clearSession();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);