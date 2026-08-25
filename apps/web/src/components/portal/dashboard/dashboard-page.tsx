'use client';

import { cn } from '@/lib/utils';
import { MONO } from '@/lib/constants';
import { DashboardHero } from './dashboard-hero';
import { DashboardFeed } from './dashboard-feed';
import { DashboardExpiring } from './dashboard-expiring';
import { CheckInChart } from './check-in-chart';
import { StatCard, formatCurrency } from './dashboard-ui';
import { MemberProfileDrawer } from '../members/member-profile-drawer';
import { MemberRegistrationWizard } from '../members/member-registration-wizard';
import { useDashboardSnapshot } from '@/hooks/use-dashboard-snapshot';
import { useCheckInFeed } from '@/hooks/use-checkin-feed';
import { useAuthStore } from '@/stores/authStore';
import { getMember, lookupMemberByNumber, type MemberProfileResponse } from '@/services/member-service';
import { CircleDollarSign, UserRoundCheck, Users } from 'lucide-react';
import { useMemo, useState } from 'react';

export function DashboardPage() {
  const [timeRange, setTimeRange] = useState<'today' | '7d' | '30d'>('today');
  const { snapshot, loading, refreshing, error, refresh } = useDashboardSnapshot(timeRange);
  const orgId = useAuthStore((s) => s.user?.orgId);
  const { events: liveEvents, status: feedStatus } = useCheckInFeed(orgId);

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<MemberProfileResponse | null>(null);
  const [selectedLoading, setSelectedLoading] = useState(false);

  const openMemberById = async (memberId: string) => {
    setSelectedLoading(true);
    try {
      const data = await getMember(memberId);
      setSelectedProfile(data);
    } catch {
      /* ignore */
    } finally {
      setSelectedLoading(false);
    }
  };

  const openMemberByNumber = async (memberNumber: string) => {
    setSelectedLoading(true);
    try {
      const match = await lookupMemberByNumber(memberNumber);
      if (match) {
        const data = await getMember(match.id);
        setSelectedProfile(data);
      }
    } catch {
      /* ignore */
    } finally {
      setSelectedLoading(false);
    }
  };

  const closeMember = () => {
    setSelectedProfile(null);
  };

  // Merge snapshot check-ins with live WebSocket events (deduplicated by checkInId)
  const mergedCheckIns = useMemo(() => {
    const all = [...liveEvents, ...(snapshot?.todayCheckIns ?? [])];
    const seen = new Set<string>();
    return all.filter((ci) => {
      if (seen.has(ci.checkInId)) return false;
      seen.add(ci.checkInId);
      return true;
    });
  }, [liveEvents, snapshot?.todayCheckIns]);

  // Bump the snapshot stat counter as live events arrive
  const todayCount =
    (snapshot?.stats.todayCheckIns ?? 0) +
    liveEvents.filter(
      (e) => !(snapshot?.todayCheckIns ?? []).some((ci) => ci.checkInId === e.checkInId),
    ).length;

  const rangeLabels = {
    today: { checkIns: "Today's check-ins", revenue: 'Revenue today' },
    '7d': { checkIns: '7-Day check-ins', revenue: '7-Day revenue' },
    '30d': { checkIns: '30-Day check-ins', revenue: '30-Day revenue' },
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <DashboardHero onOpenRegister={() => setIsRegisterOpen(true)} />

      {error ? (
        <div className="rounded-xl border border-[color:var(--color-status-expired-bg)] bg-[color:var(--color-status-expired-bg)] px-4 py-3 text-sm text-[color:var(--color-status-expired)]">
          {error}
        </div>
      ) : null}

      {/* Date period selector bar */}
      <div className="flex items-center justify-between gap-4 border-b border-[color:var(--color-border)] pb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-text-subtle)]" style={MONO}>
          Overview Range
        </span>
        <div className="flex items-center gap-1 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] p-1">
          {(['today', '7d', '30d'] as const).map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setTimeRange(range)}
              className={cn(
                'rounded-lg px-3 py-1 text-xs font-medium transition-all cursor-pointer',
                timeRange === range
                  ? 'bg-[color:var(--color-surface)] text-[color:var(--color-text-strong)] shadow-xs font-semibold'
                  : 'text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-strong)]',
              )}
              style={MONO}
            >
              {range === 'today' ? 'Today' : range === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={UserRoundCheck}
          label={rangeLabels[timeRange].checkIns}
          value={loading && !snapshot ? '—' : String(todayCount)}
          accent="valid"
          trend={liveEvents.length > 0 ? `+${liveEvents.length} live` : undefined}
        />
        <StatCard
          icon={Users}
          label="Active members"
          value={loading && !snapshot ? '—' : String(snapshot?.stats.activeMembers ?? 0)}
          accent="monthly"
        />
        <StatCard
          icon={CircleDollarSign}
          label={rangeLabels[timeRange].revenue}
          value={loading && !snapshot ? '—' : formatCurrency(snapshot?.stats.revenueToday ?? 0)}
          accent="weekly"
        />
      </section>

      {/* Chart row */}
      <CheckInChart checkIns={mergedCheckIns} loading={loading} />

      {/* Feed + expiring */}
      <section className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
        <DashboardFeed
          checkIns={mergedCheckIns}
          loading={loading}
          refreshing={refreshing}
          onRefresh={() => void refresh(true)}
          onInspectMember={(num) => void openMemberByNumber(num)}
          live={feedStatus === 'connected'}
        />
        <DashboardExpiring
          members={snapshot?.expiringMemberships ?? []}
          loading={loading}
          onInspectMember={(id) => void openMemberById(id)}
        />
      </section>

      {/* Progressive Registration Modal */}
      <MemberRegistrationWizard
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSuccess={() => void refresh(true)}
      />

      {/* Member Profile Drawer (opens directly from dashboard check-ins or expiring lists) */}
      <MemberProfileDrawer
        profile={selectedProfile}
        loading={selectedLoading}
        onClose={closeMember}
      />
    </div>
  );
}
