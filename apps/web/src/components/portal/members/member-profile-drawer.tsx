'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, Phone, Mail, Hash, ShieldCheck, ShieldX } from 'lucide-react';
import type { MemberProfileResponse } from '@/services/member-service';
import { cn } from '@/lib/utils';
import { MemberAvatar } from '../dashboard/dashboard-ui';

export function MemberProfileDrawer({
  profile,
  loading,
  onClose,
}: {
  profile: MemberProfileResponse | null;
  loading: boolean;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!profile && !loading) return null;
  if (!mounted) return null;

  const member = profile?.member;
  const membership = profile?.activeMembership;
  const fullName = member ? `${member.firstName} ${member.lastName}` : 'Loading…';

  return createPortal(
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Full screen backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-up"
        onClick={onClose}
        aria-label="Close profile drawer"
      />
      {/* Right Drawer */}
      <aside className="relative z-10 flex h-full w-full max-w-[460px] flex-col border-l border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-text)] shadow-2xl animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[color:var(--color-border)] px-6 py-4">
          <div className="flex items-center gap-3">
            {!loading && member && <MemberAvatar name={fullName} size="md" />}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-text-muted)]">
                Member Profile
              </p>
              <h2 className="text-base font-bold tracking-tight text-[color:var(--color-text-strong)]">
                {loading ? 'Loading…' : fullName}
              </h2>
              {member && (
                <div className="mt-1 flex items-center gap-1.5">
                  {member.isActive ? (
                    <span className="flex items-center gap-1 rounded-full bg-[color:var(--color-status-valid-bg)] px-2 py-0.5 text-[10px] font-semibold text-[color:var(--color-status-valid)]">
                      <ShieldCheck className="h-3 w-3" /> Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full bg-[color:var(--color-status-expired-bg)] px-2 py-0.5 text-[10px] font-semibold text-[color:var(--color-status-expired)]">
                      <ShieldX className="h-3 w-3" /> Inactive
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] text-[color:var(--color-text-muted)] transition hover:text-[color:var(--color-text-strong)] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl bg-[color:var(--color-surface-2)] px-4 py-4">
                  <div className="h-2.5 w-20 rounded-full bg-[color:var(--color-border)]" />
                  <div className="mt-2 h-3.5 w-36 rounded-full bg-[color:var(--color-border)]" />
                </div>
              ))}
            </div>
          ) : profile ? (
            <>
              {/* Contact details */}
              <div>
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-text-subtle)]">Contact Details</p>
                <div className="space-y-2">
                  <InfoRow icon={Hash} label="Member #" value={member?.memberNumber ?? 'None'} />
                  <InfoRow icon={Mail} label="Email" value={member?.email ?? 'None'} />
                  <InfoRow icon={Phone} label="Phone" value={member?.phone ?? 'None'} />
                </div>
              </div>

              {/* Membership Details */}
              <div>
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-text-subtle)]">Active Membership</p>
                {membership ? (
                  <div className="space-y-2">
                    <InfoRow icon={ShieldCheck} label="Plan" value={membership.planName} />
                    <InfoRow icon={Calendar} label="Expires On" value={membership.endDate} />
                    <MembershipProgress endDate={membership.endDate} />
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-[color:var(--color-border)] px-4 py-6 text-center">
                    <p className="text-xs text-[color:var(--color-text-muted)]">No active membership plan</p>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </aside>
    </div>,
    document.body,
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof X;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-4 py-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[color:var(--color-surface-3)] text-[color:var(--color-text-muted)]">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-wider text-[color:var(--color-text-subtle)]">{label}</p>
        <p className="mt-0.5 text-xs font-semibold text-[color:var(--color-text-strong)] truncate">{value}</p>
      </div>
    </div>
  );
}

function MembershipProgress({ endDate }: { endDate: string }) {
  const end = new Date(endDate).getTime();
  const now = Date.now();
  const start = end - 30 * 24 * 60 * 60 * 1000;
  const pct = Math.max(0, Math.min(100, ((now - start) / (end - start)) * 100));
  const remaining = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
  const urgent = remaining <= 3;

  return (
    <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-4 py-3">
      <div className="flex items-center justify-between text-xs mb-2">
        <span className="text-[color:var(--color-text-muted)] text-[10px] font-semibold uppercase tracking-wider">Membership progress</span>
        <span className={cn('font-semibold text-xs', urgent ? 'text-[color:var(--color-status-expired)]' : 'text-[color:var(--color-text-strong)]')}>
          {remaining}d remaining
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-[color:var(--color-surface-3)]">
        <div
          className={cn('h-1.5 rounded-full transition-all', urgent ? 'bg-[color:var(--color-status-expired)]' : 'bg-[color:var(--color-status-valid)]')}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
