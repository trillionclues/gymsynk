import { api } from '@/lib/api';

export type DashboardStatsResponse = {
  todayCheckIns: number;
  activeMembers: number;
  revenueToday: number | string;
};

export type TodayCheckInResponse = {
  checkInId: string;
  checkInTime: string;
  memberName: string;
  memberNumber: string;
  planName: string;
  session: string;
  status: string;
  method: string;
  locationId: string;
  overrideReason: string | null;
};

export type ExpiringMembershipResponse = {
  membershipId: string;
  memberId: string;
  memberName: string;
  memberNumber: string;
  planName: string;
  endDate: string;
  daysRemaining: number;
  locationId: string;
};

export type DashboardSnapshot = {
  stats: DashboardStatsResponse;
  todayCheckIns: TodayCheckInResponse[];
  expiringMemberships: ExpiringMembershipResponse[];
};

export async function loadDashboardSnapshot(range: 'today' | '7d' | '30d' = 'today') {
  const [stats, todayCheckIns, expiringMemberships] = await Promise.all([
    api.get<DashboardStatsResponse>('/dashboard/stats', { params: { range } }),
    api.get<TodayCheckInResponse[]>('/checkins/today'),
    api.get<ExpiringMembershipResponse[]>('/memberships/expiring', { params: { days: 7 } }),
  ]);

  return {
    stats: stats.data,
    todayCheckIns: todayCheckIns.data,
    expiringMemberships: expiringMemberships.data,
  } satisfies DashboardSnapshot;
}
