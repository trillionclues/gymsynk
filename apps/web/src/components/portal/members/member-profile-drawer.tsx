'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, Phone, Mail, Hash, ShieldCheck } from 'lucide-react';
import type { MemberProfileResponse } from '@/services/member-service';
import { cn } from '@/lib/utils';

const MONO: React.CSSProperties    = { fontFamily: 'var(--font-mono)' };
const DISPLAY: React.CSSProperties = { fontFamily: 'var(--font-display)', textTransform: 'uppercase' };

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
  useEffect(() => { setMounted(true); }, []);

  if ((!profile && !loading) || !mounted) return null;

  const member     = profile?.member;
  const membership = profile?.activeMembership;
  const fullName   = member ? `${member.firstName} ${member.lastName}` : 'Loading…';

  const initials = fullName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  return createPortal(
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 transition-opacity"
        style={{ background: 'var(--color-overlay)' }}
        onClick={onClose}
        aria-label="Close profile drawer"
      />

      <aside
        className="animate-slide-in-right relative z-10 flex h-full w-full max-w-[340px] flex-col border-l"
        style={{
          borderColor: 'var(--color-border)',
          background:  'var(--color-surface)',
          color:       'var(--color-text)',
        }}
      >
         <div
          className="flex items-start justify-between border-b px-[26px] py-[22px]"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div>
            <div
              className="mb-3 flex h-[52px] w-[52px] items-center justify-center border text-[16px]"
              style={{
                ...MONO,
                borderColor: 'var(--color-border)',
                background:  'var(--color-surface-2)',
                color:       'var(--color-text-muted)',
              }}
            >
              {loading ? '…' : initials}
            </div>

            <h2 className="text-[24px] font-extrabold leading-none" style={DISPLAY}>
              {loading ? '—' : fullName}
            </h2>

            {member && (
              <span
                className="mt-2 inline-flex items-center gap-[6px] border px-[8px] py-[4px] text-[10px] uppercase tracking-[0.08em]"
                style={{
                  ...MONO,
                  color:       member.isActive ? 'var(--color-status-valid)'       : 'var(--color-status-expired)',
                  borderColor: member.isActive ? 'var(--color-plate-moss-border)'  : 'var(--color-plate-rust-border)',
                }}
              >
                <span
                  className="h-[6px] w-[6px] shrink-0"
                  style={{ background: member.isActive ? 'var(--color-status-valid)' : 'var(--color-status-expired)' }}
                />
                {member.isActive ? 'Active' : 'Inactive'}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-[26px] w-[26px] items-center justify-center border transition hover:opacity-80"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-[11px] w-[11px]">
              <line x1="4" y1="4" x2="20" y2="20" />
              <line x1="20" y1="4" x2="4" y2="20" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-[26px] py-[22px]">
          {loading ? (
            <DrawerSkeleton />
          ) : profile ? (
            <>
              <SectionLabel>Contact details</SectionLabel>
              <FieldRow icon={Hash}          label="Member #" value={member?.memberNumber ?? '—'} mono />
              <FieldRow icon={Mail}          label="Email"    value={member?.email        ?? '—'} />
              <FieldRow icon={Phone}         label="Phone"    value={member?.phone        ?? '—'} mono />

              <SectionLabel>Active membership</SectionLabel>
              {membership ? (
                <>
                  <FieldRow icon={ShieldCheck} label="Plan"       value={membership.planName} />
                  <FieldRow icon={Calendar}    label="Expires on" value={membership.endDate}  mono />
                  <TapeProgress endDate={membership.endDate} />
                </>
              ) : (
                <div
                  className="border border-dashed border-[color:var(--color-border)] px-4 py-6 text-center text-[13px]"
                  style={{ color: 'var(--color-text-subtle)' }}
                >
                  No active membership
                </div>
              )}
            </>
          ) : null}
        </div>
      </aside>
    </div>,
    document.body,
  );
}


function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="mb-[10px] mt-[22px] border-t pt-[16px] text-[10px] uppercase tracking-[0.12em] first:mt-0 first:border-0 first:pt-0"
      style={{ ...{ fontFamily: 'var(--font-mono)' }, color: 'var(--color-text-subtle)', borderColor: 'var(--color-border)' }}
    >
      {children}
    </p>
  );
}

function FieldRow({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: typeof Hash;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div
      className="mb-[10px] flex items-center gap-3 border px-[14px] py-[12px]"
      style={{ borderColor: 'var(--color-border)', background: 'transparent' }}
    >
      <Icon
        className="h-[15px] w-[15px] shrink-0"
        style={{ color: 'var(--color-text-subtle)', strokeWidth: 1.6 }}
      />
      <div>
        <p
          className="text-[9px] uppercase tracking-[0.10em]"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-subtle)' }}
        >
          {label}
        </p>
        <p
          className="mt-[3px] text-[14px]"
          style={mono ? { fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--color-text-strong)' } : { color: 'var(--color-text-strong)' }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function TapeProgress({ endDate }: { endDate: string }) {
  const end      = new Date(endDate).getTime();
  const now      = Date.now();
  const start    = end - 30 * 24 * 60 * 60 * 1000;
  const pct      = Math.max(0, Math.min(100, ((now - start) / (end - start)) * 100));
  const remaining = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
  const urgent   = remaining <= 3;

  return (
    <div className="mt-4">
      {/* Tape header */}
      <div className="mb-2 flex items-center justify-between">
        <span
          className="text-[10px] uppercase tracking-[0.10em]"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-subtle)' }}
        >
          Membership progress
        </span>
        <span
          className="text-[12px]"
          style={{
            fontFamily: 'var(--font-mono)',
            color: urgent ? 'var(--color-status-expired)' : 'var(--color-status-valid)',
          }}
        >
          {remaining}d remaining
        </span>
      </div>

      <div
        className="relative flex h-[14px] border"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: 'repeating-linear-gradient(90deg, var(--color-border) 0 1px, transparent 1px 8px)',
          }}
        />
        <div
          className="relative z-10 h-full transition-all"
          style={{
            width:      `${pct}%`,
            background: urgent ? 'var(--color-status-expired)' : 'var(--color-plate-moss-border)',
          }}
        />
      </div>
    </div>
  );
}

function DrawerSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse border border-[color:var(--color-border)] px-[14px] py-[12px]"
        >
          <div className="h-2 w-16" style={{ background: 'var(--color-border)' }} />
          <div className="mt-2 h-3 w-36" style={{ background: 'var(--color-border)' }} />
        </div>
      ))}
    </div>
  );
}
