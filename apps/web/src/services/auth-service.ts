import { api } from '@/lib/api';

export async function loginStaff(email: string, password: string) {
  const { data } = await api.post('/auth/login', { email, password });
  return data as { accessToken: string };
}

export async function logoutStaff() {
  await api.post('/auth/logout');
}
