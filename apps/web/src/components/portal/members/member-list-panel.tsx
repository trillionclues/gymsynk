'use client';

import { LoaderCircle, RefreshCw, Search } from 'lucide-react';
import type { MemberListItem } from '@/services/member-service';
import { cn } from '@/lib/utils';
import { Tag, Btn } from '../dashboard/dashboard-ui';

const MONO: React.CSSProperties = { fontFamily: 'var(--font-mono)' };
const DISPLAY: React.CSSProperties = { fontFamily: 'var(--font-display)', textTransform: 'uppercase' };

type Props = {
  members: MemberListItem[];
  loading: boolean;
  refreshing: boolean;
  search: string;
  onSearchChange: (v: string) => void;
  onRefresh: () => void;
  onOpenMember: (id: string) => void;
  onPageChange: (p: number) => void;
  page: number;
  totalPages: number;
  onOpenRegister?: () => void;
};

export function MemberListPanel({
  members, loading, refreshing, search, onSearchChange,
  onRefresh, onOpenMember, onPageChange, page, totalPages, onOpenRegister,
}: Props) {
  return (
    <section className="border border-[color:var(--color-border)] bg-[color:var(--color-surface)] w-full">

      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-[color:var(--color-border)] px-[22px] py-[18px] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-[17px] font-bold" style={DISPLAY}>
            Member Directory
          </h3>
          <p className="mt-[2px] text-[11px]" style={{ ...MONO, color: 'var(--color-text-subtle)' }}>
            Search by name, phone, email, or member number
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Search field */}
          <label
            className="flex items-center gap-2 border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-3 py-[9px]"
            style={{ minWidth: 280 }}
          >
            <Search className="h-[14px] w-[14px] shrink-0" style={{ color: 'var(--color-text-subtle)' }} />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search members…"
              className="w-full bg-transparent text-[13px] outline-none placeholder:text-[color:var(--color-text-subtle)]"
              style={{ color: 'var(--color-text)' }}
            />
          </label>

          <Btn onClick={onRefresh} className="gap-1.5">
            {refreshing
              ? <LoaderCircle className="h-3 w-3 animate-spin" />
              : <RefreshCw className="h-3 w-3" />}
            Refresh
          </Btn>

          {onOpenRegister && (
            <Btn primary onClick={onOpenRegister}>
              + Register Member
            </Btn>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[color:var(--color-border)]">
              {['Member', 'Contact', 'Status', 'Plan', ''].map((h) => (
                <th
                  key={h}
                  className={cn(
                    'px-[22px] py-[14px] text-left text-[10px] uppercase tracking-[0.10em] font-normal',
                    h === 'Contact' && 'hidden sm:table-cell',
                    h === 'Plan'    && 'hidden md:table-cell',
                    h === ''        && 'text-right',
                  )}
                  style={{ ...MONO, color: 'var(--color-text-subtle)', borderColor: 'var(--color-border)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading && !members.length ? (
              <SkeletonRows />
            ) : members.length ? (
              members.map((m) => (
                <tr
                  key={m.id}
                  onClick={() => onOpenMember(m.id)}
                  className="cursor-pointer border-b border-[color:var(--color-border)] last:border-0 transition hover:bg-[color:var(--color-surface-2)]"
                  style={{ borderColor: 'var(--color-hairline-soft, var(--color-border))' }}
                >
                  {/* Member */}
                  <td className="px-[22px] py-[16px] align-middle">
                    <div className="flex items-center gap-[14px]">
                      <Tag name={`${m.firstName} ${m.lastName}`} size="sm" />
                      <div>
                        <p className="text-[14px] font-semibold" style={{ color: 'var(--color-text-strong)' }}>
                          {m.firstName} {m.lastName}
                        </p>
                        <p className="mt-[2px] text-[11px]" style={{ ...MONO, color: 'var(--color-text-subtle)' }}>
                          {m.memberNumber ?? '—'}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="hidden px-[22px] py-[16px] align-middle sm:table-cell">
                    <p className="text-[13px]" style={{ color: 'var(--color-text)' }}>{m.email ?? '—'}</p>
                    <p className="mt-[3px] text-[11px]" style={{ ...MONO, color: 'var(--color-text-subtle)' }}>{m.phone ?? '—'}</p>
                  </td>

                  {/* Status chit */}
                  <td className="px-[22px] py-[16px] align-middle">
                    <StatusChit active={m.isActive} />
                  </td>

                  {/* Plan */}
                  <td className="hidden px-[22px] py-[16px] align-middle md:table-cell">
                    <p className="text-[13px]" style={{ color: 'var(--color-text)' }}>
                      {m.activePlanName ?? 'No plan'}
                    </p>
                    {m.activeMembershipEndsOn ? (
                      <p className="mt-[3px] text-[11px]" style={{ ...MONO, color: 'var(--color-text-subtle)' }}>
                        Until {m.activeMembershipEndsOn}
                      </p>
                    ) : null}
                  </td>

                  {/* Action */}
                  <td className="px-[22px] py-[16px] align-middle text-right">
                    <span
                      className="inline-flex cursor-pointer items-center gap-[6px] border border-[color:var(--color-border)] px-[12px] py-[8px] text-[11px] uppercase tracking-[0.08em] transition hover:border-[color:var(--color-border-strong)]"
                      style={MONO}
                    >
                      View →
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-[22px] py-[30px] text-center text-[13px]"
                  style={{ color: 'var(--color-text-subtle)' }}
                >
                  No members matched the search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pager */}
      <div
        className="flex items-center justify-between border-t border-[color:var(--color-border)] px-[22px] py-[14px]"
      >
        <span className="text-[11px]" style={{ ...MONO, color: 'var(--color-text-subtle)' }}>
          Page {page + 1} of {Math.max(totalPages, 1)}
        </span>
        <div className="flex gap-px">
          <PagerBtn disabled={page === 0}          onClick={() => onPageChange(page - 1)}>‹</PagerBtn>
          <PagerBtn disabled={page + 1 >= totalPages} onClick={() => onPageChange(page + 1)}>›</PagerBtn>
        </div>
      </div>
    </section>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function StatusChit({ active }: { active: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-[6px] border px-[8px] py-[4px] text-[10px] uppercase tracking-[0.08em]"
      style={{
        fontFamily:  'var(--font-mono)',
        color:       active ? 'var(--color-status-valid)'   : 'var(--color-status-expired)',
        borderColor: active ? 'var(--color-plate-moss-border)' : 'var(--color-plate-rust-border)',
      }}
    >
      <span
        className="h-[6px] w-[6px] shrink-0"
        style={{ background: active ? 'var(--color-status-valid)' : 'var(--color-status-expired)' }}
      />
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

function PagerBtn({ disabled, onClick, children }: {
  disabled: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex h-[30px] w-[30px] items-center justify-center border border-[color:var(--color-border)] bg-transparent text-xs transition hover:border-[color:var(--color-border-strong)] disabled:cursor-not-allowed disabled:opacity-30"
      style={{ color: 'var(--color-text-muted)' }}
    >
      {children}
    </button>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b border-[color:var(--color-border)]">
          <td className="px-[22px] py-[16px]">
            <div className="flex items-center gap-[14px]">
              <div
                className="h-[34px] w-[34px] animate-pulse border border-[color:var(--color-border)]"
                style={{ background: 'var(--color-surface-2)' }}
              />
              <div className="space-y-2">
                <div className="h-3 w-28 animate-pulse" style={{ background: 'var(--color-border)' }} />
                <div className="h-2.5 w-20 animate-pulse" style={{ background: 'var(--color-border)' }} />
              </div>
            </div>
          </td>
          <td colSpan={4} />
        </tr>
      ))}
    </>
  );
}
