'use client';

import { LoaderCircle, RefreshCw } from 'lucide-react';
import type { TodayCheckInResponse } from '@/services/dashboard-service';
import { Chit, EmptyBlock, FeedSkeleton, Tag, Panel } from './dashboard-ui';
import { MONO } from '@/lib/constants';

export function DashboardFeed({
  checkIns,
  loading,
  refreshing,
  onRefresh,
  onInspectMember,
  live = false,
}: {
  checkIns: TodayCheckInResponse[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onInspectMember?: (memberNumber: string) => void;
  live?: boolean;
}) {
  return (
    <Panel
      title="Live Check-in Feed"
      subtitle={live ? 'Websocket connected' : 'Polling — websocket connecting'}
      action={
        <div className="flex items-center gap-2">
          {live && (
            <span
              className="inline-flex items-center gap-1.5 border px-[8px] py-[4px] text-[10px] uppercase tracking-[0.08em]"
              style={{ ...MONO, color: 'var(--color-status-valid)', borderColor: 'var(--color-plate-moss-border)' }}
            >
              <span
                className="h-[6px] w-[6px] animate-pulse"
                style={{ background: 'var(--color-status-valid)' }}
              />
              Live
            </span>
          )}
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-[6px] border border-[color:var(--color-border)] px-[14px] py-[8px] text-[11px] uppercase tracking-[0.08em] transition hover:border-[color:var(--color-border-strong)]"
            style={{ ...MONO, color: 'var(--color-text)' }}
          >
            {refreshing
              ? <LoaderCircle className="h-3 w-3 animate-spin" />
              : <RefreshCw className="h-3 w-3" />}
            Refresh
          </button>
        </div>
      }
    >
      <div className="-mx-[22px] -mt-[22px] -mb-[22px]">
        {loading && !checkIns.length ? (
          <FeedSkeleton />
        ) : checkIns.length ? (
          checkIns.map((entry) => (
            <FeedRow
              key={entry.checkInId}
              entry={entry}
              onInspect={onInspectMember ? () => onInspectMember(entry.memberNumber) : undefined}
            />
          ))
        ) : (
          <div className="px-[22px] py-[22px]">
            <EmptyBlock
              title="No check-ins yet"
              body="The first scan of the day will appear here."
            />
          </div>
        )}
      </div>
    </Panel>
  );
}

function FeedRow({
  entry,
  onInspect,
}: {
  entry: TodayCheckInResponse;
  onInspect?: () => void;
}) {
  const time = new Date(entry.checkInTime).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div
      onClick={onInspect}
      className="flex items-center justify-between gap-[14px] border-b border-[color:var(--color-border)] px-[22px] py-[14px] last:border-0 hover:bg-[color:var(--color-surface-2)] transition-colors"
      style={{ cursor: onInspect ? 'pointer' : 'default' }}
    >
      <div className="flex min-w-0 items-center gap-[14px]">
        <Tag name={entry.memberName} />
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-[14px] font-semibold truncate" style={{ color: 'var(--color-text-strong)' }}>
              {entry.memberName}
            </span>
            <span className="text-[11px] shrink-0" style={{ ...MONO, color: 'var(--color-text-subtle)' }}>
              {entry.memberNumber}
            </span>
          </div>
          <p className="mt-[2px] text-[11px]" style={{ ...MONO, color: 'var(--color-text-subtle)' }}>
            {entry.planName} · {entry.session} · {entry.method}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        <Chit value={entry.status} />
        <span className="text-[11px]" style={{ ...MONO, color: 'var(--color-text-subtle)' }}>
          {time}
        </span>
      </div>
    </div>
  );
}
