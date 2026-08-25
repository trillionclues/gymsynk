import { api } from '@/lib/api';

export interface PaymentItem {
  id: string;
  memberName: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  externalRef: string | null;
  createdAt: string;
}

export interface PaymentPage {
  content: PaymentItem[];
  totalPages: number;
  totalElements: number;
  page: number;
  size: number;
}

export async function loadPayments(
  page = 0,
  size = 20,
  status?: string,
): Promise<PaymentPage> {
  const params: Record<string, string | number> = { page, size };
  if (status && status !== 'ALL') params.status = status;
  const res = await api.get<PaymentPage>('/payments', { params });
  return res.data;
}
