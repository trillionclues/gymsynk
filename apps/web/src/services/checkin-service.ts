import { api } from '@/lib/api';

export type CheckInResponse = {
  checkInId: string;
  memberId: string;
  memberName: string;
  memberNumber: string;
  planName: string;
  session: string;
  status: string;
};

export async function validateQrToken(token: string, locationId: string) {
  const { data } = await api.post<CheckInResponse>('/checkin/validate', { token, locationId });
  return data;
}

export async function manualCheckIn(memberId: string, locationId: string, overrideReason?: string) {
  const { data } = await api.post<CheckInResponse>(
    '/checkin/manual',
    { memberId, locationId, overrideReason },
    { headers: overrideReason ? { 'X-Override': 'true' } : undefined },
  );
  return data;
}
