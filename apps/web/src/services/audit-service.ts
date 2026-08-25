import { api } from '@/lib/api';


export interface AuditLogItem {
  id: string;
  actorId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
}

export interface AuditPage {
  content: AuditLogItem[];
  totalPages: number;
  totalElements: number;
  page: number;
  size: number;
}

export async function loadAuditLog(
  page = 0,
  size = 30,
  action?: string,
  from?: string,
  to?: string,
): Promise<AuditPage> {
  const params: Record<string, string | number> = { page, size };
  if (action && action !== 'ALL') params.action = action;
  if (from) params.from = from;
  if (to) params.to = to;
  const res = await api.get<AuditPage>('/audit', { params });
  return res.data;
}
