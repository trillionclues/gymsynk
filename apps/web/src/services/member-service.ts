import { api } from '@/lib/api';

export type MemberListItem = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  memberNumber: string | null;
  isActive: boolean;
  activePlanName: string | null;
  activeMembershipEndsOn: string | null;
};

export type PageResponse<T> = {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

export type CreateMemberRequest = {
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  planId: string;
  locationId: string;
  startDate?: string | null;
  paymentAmount?: number | string | null;
};

export type MemberProfileResponse = {
  member: MemberListItem;
  activeMembership: {
    membershipId: string;
    planName: string;
    locationId: string;
    startDate: string;
    endDate: string;
    status: string;
    price: number | string;
    currency: string;
  } | null;
};

export type PlanResponse = {
  id: string;
  name: string;
  durationType: string;
  durationValue: number;
  price: number | string;
  currency: string;
  allowedSessions: string[];
  allowedDays: number[];
  maxCheckInsPerDay: number;
};

export async function searchMembers(search: string, page: number, size: number) {
  const { data } = await api.get<PageResponse<MemberListItem>>('/members', { params: { search, page, size } });
  return data;
}

export async function lookupMemberByNumber(memberNumber: string) {
  const { data } = await api.get<PageResponse<MemberListItem>>('/members', {
    params: { search: memberNumber, page: 0, size: 5 },
  });

  const match = data.content.find((member) => member.memberNumber === memberNumber);
  return match ?? null;
}

export async function getMember(memberId: string) {
  const { data } = await api.get<MemberProfileResponse>(`/members/${memberId}`);
  return data;
}

export async function listPlans() {
  const { data } = await api.get<PlanResponse[]>('/plans');
  return data;
}

export async function registerMember(request: CreateMemberRequest) {
  const { data } = await api.post('/members', request);
  return data;
}
