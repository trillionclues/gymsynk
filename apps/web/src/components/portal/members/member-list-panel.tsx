'use client';

import { LoaderCircle, RefreshCw, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import type { MemberListItem } from '@/services/member-service';
import { cn } from '@/lib/utils';
import { MemberAvatar, StatusPill } from '../dashboard/dashboard-ui';

type MemberListPanelProps = {
  members: MemberListItem[];
  loading: boolean;
  refreshing: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  onOpenMember: (memberId: string) => void;
  onPageChange: (page: number) => void;
  page: number;
  totalPages: number;
  onOpenRegister?: () => void;
};

export function MemberListPanel({
  members,
  loading,
  refreshing,
  search,
  onSearchChange,
  onRefresh,
  onOpenMember,
  onPageChange,
  page,
  totalPages,
  onOpenRegister,
}: MemberListPanelProps) {
  return (
    <section className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-[0_1px_4px_var(--color-shadow)] w-full">
      <div className="flex flex-col gap-3 border-b border-[color:var(--color-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[color:var(--color-text-strong)]">Member Directory</h3>
          <p className="mt-0.5 text-xs text-[color:var(--color-text-muted)]">
            Search by name, phone, email, or member number.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SearchField value={search} onChange={onSearchChange} />
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-3 py-2 text-xs font-medium text-[color:var(--color-text-strong)] transition hover:border-[color:var(--color-border-strong)]"
          >
            {refreshing ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Refresh
          </button>
          {onOpenRegister && (
            <button
              type="button"
              onClick={onOpenRegister}
              className="inline-flex items-center gap-1.5 rounded-xl bg-black px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              + Register Member
            </button>
          )}
        </div>
      </div>


      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-[color:var(--color-border)] bg-[color:var(--color-surface-2)]">
              <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[color:var(--color-text-subtle)]">Member</th>
              <th className="hidden px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[color:var(--color-text-subtle)] sm:table-cell">Contact</th>
              <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[color:var(--color-text-subtle)]">Status</th>
              <th className="hidden px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[color:var(--color-text-subtle)] md:table-cell">Plan</th>
              <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-[color:var(--color-text-subtle)]">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && !members.length ? (
              <SkeletonRows />
            ) : members.length ? (
              members.map((member) => (
                <tr
                  key={member.id}
                  onClick={() => onOpenMember(member.id)}
                  className="cursor-pointer border-b border-[color:var(--color-border)] last:border-0 transition hover:bg-[color:var(--color-surface-2)]"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <MemberAvatar name={`${member.firstName} ${member.lastName}`} size="sm" />
                      <div>
                        <p className="font-medium text-[color:var(--color-text-strong)]">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-xs text-[color:var(--color-text-muted)]">
                          {member.memberNumber ?? 'No number'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-5 py-3.5 sm:table-cell">
                    <p className="text-[color:var(--color-text-muted)]">{member.email ?? '—'}</p>
                    <p className="text-xs text-[color:var(--color-text-subtle)]">{member.phone ?? '—'}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusLabel active={member.isActive} />
                  </td>
                  <td className="hidden px-5 py-3.5 md:table-cell">
                    <p className="text-[color:var(--color-text-muted)]">
                      {member.activePlanName ?? 'No active plan'}
                    </p>
                    {member.activeMembershipEndsOn ? (
                      <p className="text-xs text-[color:var(--color-text-subtle)]">Until {member.activeMembershipEndsOn}</p>
                    ) : null}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="inline-flex items-center gap-1 rounded-lg border border-[color:var(--color-border)] px-3 py-1 text-xs font-medium text-[color:var(--color-text-strong)] transition hover:border-[color:var(--color-border-strong)]">
                      View →
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-sm text-[color:var(--color-text-muted)]">
                  No members matched the search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-[color:var(--color-border)] px-5 py-3">
        <p className="text-xs text-[color:var(--color-text-muted)]">
          Page {page + 1} of {Math.max(totalPages, 1)}
        </p>
        <div className="flex gap-1">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => onPageChange(page - 1)}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg border text-xs transition',
              page === 0
                ? 'cursor-not-allowed border-[color:var(--color-border)] text-[color:var(--color-text-subtle)]'
                : 'border-[color:var(--color-border)] text-[color:var(--color-text-strong)] hover:bg-[color:var(--color-surface-2)]',
            )}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={page + 1 >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg border text-xs transition',
              page + 1 >= totalPages
                ? 'cursor-not-allowed border-[color:var(--color-border)] text-[color:var(--color-text-subtle)]'
                : 'border-[color:var(--color-border)] text-[color:var(--color-text-strong)] hover:bg-[color:var(--color-surface-2)]',
            )}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}

function SearchField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex min-w-[220px] items-center gap-2 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-3 py-2">
      <Search className="h-3.5 w-3.5 text-[color:var(--color-text-subtle)]" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search members…"
        className="w-full bg-transparent text-sm text-[color:var(--color-text-strong)] outline-none placeholder:text-[color:var(--color-text-subtle)]"
      />
    </label>
  );
}

function StatusLabel({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
        active
          ? 'bg-[color:var(--color-status-valid-bg)] text-[color:var(--color-status-valid)]'
          : 'bg-[color:var(--color-status-expired-bg)] text-[color:var(--color-status-expired)]',
      )}
    >
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b border-[color:var(--color-border)]">
          <td className="px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="h-7 w-7 animate-pulse rounded-full bg-[color:var(--color-border)]" />
              <div className="space-y-1.5">
                <div className="h-3 w-28 animate-pulse rounded-full bg-[color:var(--color-border)]" />
                <div className="h-2 w-20 animate-pulse rounded-full bg-[color:var(--color-border)]" />
              </div>
            </div>
          </td>
          <td colSpan={4} />
        </tr>
      ))}
    </>
  );
}
