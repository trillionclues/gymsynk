import { api } from '@/lib/api';

export type PlanItem = {
  id: string;
  name: string;
  durationType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
  durationValue: number;
  price: number;
  currency: string;
  allowedSessions: string[];
  allowedDays: number[];
  maxCheckInsPerDay: number;
  isActive: boolean;
};

export type CreatePlanPayload = {
  name: string;
  durationType: string;
  durationValue: number;
  price: number;
  currency: string;
  allowedSessions: string;
  allowedDays: string;
  maxCheckinsPerDay: number;
};

export async function loadAllPlans() {
  const res = await api.get<PlanItem[]>('/plans/all');
  return res.data;
}

export async function createPlan(payload: CreatePlanPayload) {
  const res = await api.post<PlanItem>('/plans', payload);
  return res.data;
}

export async function updatePlan(id: string, payload: Partial<CreatePlanPayload>) {
  const res = await api.patch<PlanItem>(`/plans/${id}`, payload);
  return res.data;
}

export async function togglePlanActive(id: string) {
  const res = await api.patch<PlanItem>(`/plans/${id}/toggle-active`);
  return res.data;
}
