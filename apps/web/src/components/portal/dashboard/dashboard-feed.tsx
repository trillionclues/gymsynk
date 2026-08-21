'use client';

import { LoaderCircle, RefreshCw, UserCheck } from 'lucide-react';
import type { TodayCheckInResponse } from '@/services/dashboard-service';
import { EmptyBlock, FeedSkeleton, MemberAvatar, Panel, StatusPill } from './dashboard-ui';

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
      title="Live check-in feed"
      subtitle={live ? 'Real-time via WebSocket' : 'Polling — WebSocket stream connected'}
      action={
        <div className="flex items-center gap-2">
          {live && (
            <span className="flex items-center gap-1.5 rounded-full bg-[color:var(--color-status-valid-bg)] px-2.5 py-1 text-[10px] font-semibold text-[color:var(--color-status-valid)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-status-valid)] animate-pulse" />
              Live
            </span>
          )}
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-3 py-1.5 text-xs font-medium text-[color:var(--color-text-strong)] transition hover:border-[color:var(--color-border-strong)] cursor-pointer"
          >
            {refreshing ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Refresh
          </button>
        </div>
      }
    >
      <div className="space-y-2">
        {loading && !checkIns.length ? (
          <FeedSkeleton />
        ) : checkIns.length ? (
          checkIns.map((entry) => (
            <CheckInRow
              key={entry.checkInId}
              entry={entry}
              onInspect={onInspectMember ? () => onInspectMember(entry.memberNumber) : undefined}
            />
          ))
        ) : (
          <EmptyBlock
            title="No check-ins yet"
            body="As soon as today's first scan lands, it will appear here."
          />
        )}
      </div>
    </Panel>
  );
}


function CheckInRow({
  entry,
  onInspect,
}: {
  entry: TodayCheckInResponse;
  onInspect?: () => void;
}) {
  return (
    <div
      onClick={onInspect}
      className={`flex items-center gap-3 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-4 py-3 transition hover:bg-[color:var(--color-surface-3)] ${
        onInspect ? 'cursor-pointer' : ''
      }`}
    >
      <MemberAvatar name={entry.memberName} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2">
          <p className="text-sm font-medium text-[color:var(--color-text-strong)] truncate">{entry.memberName}</p>
          <span className="text-xs text-[color:var(--color-text-muted)]">{entry.memberNumber}</span>
        </div>
        <p className="mt-0.5 text-xs text-[color:var(--color-text-muted)]">
          {entry.planName} · {entry.session} · {entry.method}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <StatusPill value={entry.status} />
        <div className="flex items-center gap-2">
          <p className="text-[10px] text-[color:var(--color-text-muted)]">
            {new Date(entry.checkInTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
          </p>
          {onInspect && (
            <span className="text-[10px] font-semibold text-[color:var(--color-accent)] hover:underline">
              Inspect →
            </span>
          )}
        </div>
        {entry.overrideReason ? (
          <p className="text-[10px] text-[color:var(--color-status-override)]">Override</p>
        ) : null}
      </div>
    </div>
  );
}
