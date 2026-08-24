'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LoaderCircle, ArrowLeft } from 'lucide-react';
import { getMyCheckInHistory, type CheckInHistoryItem } from '@/services/member-pwa-service';
import { cn } from '@/lib/utils';
import { DISPLAY, MONO } from '@/lib/constants';


function groupByDate(items: CheckInHistoryItem[]) {
  const groups = new Map<string, CheckInHistoryItem[]>();
  for (const item of items) {
    const date = item.checkInTime.slice(0, 10);
    if (!groups.has(date)) groups.set(date, []);
    groups.get(date)!.push(item);
  }
  return groups;
}

function formatDate(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  const today     = new Date(); today.setHours(0,0,0,0);
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  if (d.getTime() === today.getTime())     return 'Today';
  if (d.getTime() === yesterday.getTime()) return 'Yesterday';
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

const STATUS_TONE: Record<string, { color: string; border: string; dot: string }> = {
  VALID: {
    color:  'var(--color-status-valid)',
    border: 'var(--color-plate-moss-border)',
    dot:    'var(--color-status-valid)',
  },
  OVERRIDE: {
    color:  'var(--color-status-override)',
    border: 'var(--color-plate-gold-border)',
    dot:    'var(--color-status-override)',
  },
  EXPIRED_PLAN: {
    color:  'var(--color-status-expired)',
    border: 'var(--color-plate-rust-border)',
    dot:    'var(--color-status-expired)',
  },
};

function StatusChit({ status }: { status: string }) {
  const tone = STATUS_TONE[status] ?? STATUS_TONE.EXPIRED_PLAN;
  const label = status === 'VALID' ? 'Valid'
    : status === 'OVERRIDE'        ? 'Override'
    : status === 'EXPIRED_PLAN'    ? 'Expired'
    : status;
  return (
    <span
      className="inline-flex items-center gap-[6px] border px-[8px] py-[4px] text-[10px] uppercase tracking-[0.08em]"
      style={{ ...MONO, color: tone.color, borderColor: tone.border }}
    >
      <span className="h-[6px] w-[6px] shrink-0" style={{ background: tone.dot }} />
      {label}
    </span>
  );
}

export function MemberHistoryPage() {
  const [items,      setItems]      = useState<CheckInHistoryItem[]>([]);
  const [page,       setPage]       = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getMyCheckInHistory(page)
      .then((res) => {
        if (!active) return;
        setItems(res.items);
        setTotalPages(res.totalPages);
      })
      .catch(() => { if (active) setError('Could not load history.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page]);

  const grouped = groupByDate(items);

  return (
    <div className="flex flex-1 flex-col px-4 py-6">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/member"
          className="flex h-9 w-9 items-center justify-center border transition hover:border-[color:var(--color-border-strong)]"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-[24px] font-extrabold leading-none" style={DISPLAY}>
            History
          </h1>
          <p className="mt-0.5 text-[11px]" style={{ ...MONO, color: 'var(--color-text-subtle)' }}>
            Your recent check-ins
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <LoaderCircle className="h-5 w-5 animate-spin" style={{ color: 'var(--color-text-subtle)' }} />
        </div>
      ) : error ? (
        <div
          className="border px-4 py-3 text-[12px]"
          style={{ ...MONO, color: 'var(--color-status-expired)', borderColor: 'var(--color-plate-rust-border)' }}
        >
          {error}
        </div>
      ) : items.length === 0 ? (
        <div
          className="border border-dashed border-[color:var(--color-border)] px-5 py-10 text-center"
        >
          <p className="text-[16px] font-bold" style={DISPLAY}>No check-ins yet</p>
          <p className="mt-2 text-[12px]" style={{ color: 'var(--color-text-subtle)' }}>
            Your first check-in will appear here.
          </p>
        </div>
      ) : (
        <div className="flex-1 space-y-5">
          {Array.from(grouped.entries()).map(([date, entries]) => (
            <div key={date}>
              <p
                className="mb-2 text-[10px] uppercase tracking-[0.12em]"
                style={{ ...MONO, color: 'var(--color-text-subtle)' }}
              >
                {formatDate(date)}
              </p>

              <div className="border border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
                {entries.map((entry, i) => (
                  <div
                    key={entry.checkInId}
                    className={cn(
                      'flex items-center justify-between gap-3 px-4 py-3',
                      i < entries.length - 1 && 'border-b border-[color:var(--color-border)]',
                    )}
                  >
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold truncate" style={{ color: 'var(--color-text-strong)' }}>
                        {entry.locationName}
                      </p>
                      <p className="mt-0.5 text-[11px]" style={{ ...MONO, color: 'var(--color-text-subtle)' }}>
                        {entry.planName} · {entry.session} · {entry.method}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <StatusChit status={entry.status} />
                      <span className="text-[11px]" style={{ ...MONO, color: 'var(--color-text-subtle)' }}>
                        {formatTime(entry.checkInTime)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <span className="text-[11px]" style={{ ...MONO, color: 'var(--color-text-subtle)' }}>
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex gap-px">
            {[
              { label: '‹', disabled: page === 0,             action: () => setPage(page - 1) },
              { label: '›', disabled: page + 1 >= totalPages, action: () => setPage(page + 1) },
            ].map(({ label, disabled, action }) => (
              <button
                key={label}
                type="button"
                disabled={disabled}
                onClick={action}
                className="flex h-[30px] w-[30px] items-center justify-center border text-xs transition hover:border-[color:var(--color-border-strong)] disabled:cursor-not-allowed disabled:opacity-30"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
