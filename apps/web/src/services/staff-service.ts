import { api } from '@/lib/api';

export type StaffItem = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  role: 'ADMIN' | 'CASHIER' | 'FLOOR_STAFF';
  isActive: boolean;
  createdAt: string;
};

export type CreateStaffPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'ADMIN' | 'CASHIER' | 'FLOOR_STAFF';
  password: string;
};

export async function loadStaffList() {
  const res = await api.get<StaffItem[]>('/staff');
  return res.data;
}

export async function createStaffMember(payload: CreateStaffPayload) {
  const res = await api.post<StaffItem>('/staff', payload);
  return res.data;
}

export async function toggleStaffActive(id: string) {
  const res = await api.patch<StaffItem>(`/staff/${id}/toggle-active`);
  return res.data;
}
