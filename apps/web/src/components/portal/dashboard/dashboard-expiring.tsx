'use client';

import type { ExpiringMembershipResponse } from '@/services/dashboard-service';
import { EmptyBlock, FeedSkeleton, Tag, Panel } from './dashboard-ui';
import { MONO } from '@/lib/constants';

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
    <Panel title="Expiring Soon" subtitle="Within the next 7 days">
      <div className="-mx-[22px] -mt-[22px] -mb-[22px]">
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
          <div className="px-[22px] py-[22px]">
            <EmptyBlock
              title="Nothing expiring"
              body="This fills when memberships approach their end date."
            />
          </div>
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
  const urgent  = member.daysRemaining <= 2;
  const warning = member.daysRemaining <= 5;

  const chipColor = urgent
    ? 'var(--color-status-expired)'
    : warning
    ? 'var(--color-status-override)'
    : 'var(--color-plan-weekly)';

  const chipBorder = urgent
    ? 'var(--color-plate-rust-border)'
    : warning
    ? 'var(--color-plate-gold-border)'
    : 'var(--color-border)';

  return (
    <div
      onClick={onInspect}
      className="flex items-center justify-between gap-[14px] border-b border-[color:var(--color-border)] px-[22px] py-[14px] last:border-0 hover:bg-[color:var(--color-surface-2)] transition-colors"
      style={{ cursor: onInspect ? 'pointer' : 'default' }}
    >
      <div className="flex min-w-0 items-center gap-[14px]">
        <Tag name={member.memberName} size="sm" />
        <div className="min-w-0">
          <p className="text-[14px] font-semibold truncate" style={{ color: 'var(--color-text-strong)' }}>
            {member.memberName}
          </p>
          <p className="mt-[2px] text-[11px]" style={{ ...MONO, color: 'var(--color-text-subtle)' }}>
            {member.planName}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        {/* Days-remaining chit */}
        <span
          className="inline-flex items-center gap-[6px] border px-[8px] py-[4px] text-[10px] uppercase tracking-[0.08em]"
          style={{ ...MONO, color: chipColor, borderColor: chipBorder }}
        >
          <span className="h-[6px] w-[6px] shrink-0" style={{ background: chipColor }} />
          {member.daysRemaining}d left
        </span>
        <span className="text-[11px]" style={{ ...MONO, color: 'var(--color-text-subtle)' }}>
          {member.endDate}
        </span>
      </div>
    </div>
  );
}
