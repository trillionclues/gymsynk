import { api } from '@/lib/api';

export type MemberProfile = {
  id: string;
  firstName: string;
  lastName: string;
  memberNumber: string;
  email: string | null;
  phone: string | null;
  isActive: boolean;
  activeMembership: ActiveMembership | null;
};

export type ActiveMembership = {
  id: string;
  planName: string;
  startDate: string;
  endDate: string;
  status: string;
  daysRemaining: number;
};

export type QrTokenResponse = {
  token: string;
  qrBase64: string;   // data:image/png;base64,...
  ttlSeconds: number;
};

export type CheckInHistoryItem = {
  checkInId: string;
  checkInTime: string;
  locationName: string;
  planName: string;
  session: string;
  status: string;
  method: string;
};


// Raw shape returned by the backend MemberProfileResponse
type BackendMemberProfileResponse = {
  member: {
    id: string;
    firstName: string;
    lastName: string;
    memberNumber: string | null;
    email: string | null;
    phone: string | null;
    isActive: boolean;
  };
  activeMembership: {
    membershipId: string;
    planName: string;
    startDate: string;
    endDate: string;
    status: string;
    daysRemaining: number;
  } | null;
};

/** Fetch member's own profile + active membership. */
export async function getMyProfile(): Promise<MemberProfile> {
  const { data } = await api.get<BackendMemberProfileResponse>('/members/me');
  // Flatten the nested backend shape into the frontend MemberProfile type
  return {
    id:           data.member.id,
    firstName:    data.member.firstName,
    lastName:     data.member.lastName,
    memberNumber: data.member.memberNumber ?? '',
    email:        data.member.email,
    phone:        data.member.phone,
    isActive:     data.member.isActive,
    activeMembership: data.activeMembership
      ? {
          id:           data.activeMembership.membershipId,
          planName:     data.activeMembership.planName,
          startDate:    data.activeMembership.startDate,
          endDate:      data.activeMembership.endDate,
          status:       data.activeMembership.status,
          daysRemaining: data.activeMembership.daysRemaining,
        }
      : null,
  };
}

/**
 * Generate QR token for the authenticated member.
 * Returns a base64 PNG and the raw token string, valid for ttlSeconds.
 */
export async function getMyQrToken(): Promise<QrTokenResponse> {
  const { data } = await api.post<QrTokenResponse>('/checkin/qr-token');
  return data;
}

/**
 * Fetch member's check-in history, paginated.
 * Default page size 20, zero-indexed.
 */
export async function getMyCheckInHistory(
  page = 0,
  size = 20,
): Promise<{ items: CheckInHistoryItem[]; totalPages: number }> {
  const { data } = await api.get('/checkins/history', { params: { page, size } });
  return data as { items: CheckInHistoryItem[]; totalPages: number };
}
