'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { ExpiringMembershipResponse } from '@/services/dashboard-service';
import { EmptyBlock, FeedSkeleton, MemberAvatar, Panel } from './dashboard-ui';
import { cn } from '@/lib/utils';

export function DashboardExpiring({
  members,
  loading,
  onInspectMember,
}: {
  members: ExpiringMembershipResponse[];
  loading: boolean;
  onInspectMember?: (memberId: string) => void;
}) {
  return (
    <Panel title="Expiring soon" subtitle="Within the next 7 days">
      <div className="space-y-2">
        {loading && !members.length ? (
          <FeedSkeleton compact />
        ) : members.length ? (
          members.map((member) => (
            <ExpiryRow
              key={member.membershipId}
              member={member}
              onInspect={onInspectMember ? () => onInspectMember(member.memberId) : undefined}
            />
          ))
        ) : (
          <EmptyBlock
            title="Nothing expiring soon"
            body="This area fills when memberships approach their end date."
          />
        )}
      </div>
    </Panel>
  );
}

function ExpiryRow({
  member,
  onInspect,
}: {
  member: ExpiringMembershipResponse;
  onInspect?: () => void;
}) {
  const urgent = member.daysRemaining <= 2;
  const warning = member.daysRemaining <= 5;

  return (
    <div
      onClick={onInspect}
      className={`flex items-center gap-3 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-4 py-3 transition hover:bg-[color:var(--color-surface-3)] ${
        onInspect ? 'cursor-pointer' : ''
      }`}
    >
      <MemberAvatar name={member.memberName} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[color:var(--color-text-strong)] truncate">{member.memberName}</p>
        <p className="mt-0.5 text-xs text-[color:var(--color-text-muted)]">{member.planName}</p>
      </div>
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <span
          className={cn(
            'rounded-full px-2.5 py-0.5 text-[10px] font-bold',
            urgent
              ? 'bg-[color:var(--color-status-expired-bg)] text-[color:var(--color-status-expired)]'
              : warning
              ? 'bg-[color:var(--color-status-override-bg)] text-[color:var(--color-status-override)]'
              : 'bg-[color:var(--color-plan-weekly-bg)] text-[color:var(--color-plan-weekly)]',
          )}
        >
          {member.daysRemaining}d left
        </span>
        {onInspect ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onInspect();
            }}
            className="flex items-center gap-0.5 text-[10px] font-semibold text-[color:var(--color-accent)] hover:underline"
          >
            Inspect <ArrowRight className="h-3 w-3" />
          </button>
        ) : (
          <Link
            href="/dashboard/members"
            className="flex items-center gap-0.5 text-[10px] text-[color:var(--color-accent)] hover:underline"
          >
            View <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
    </div>
  );
}
