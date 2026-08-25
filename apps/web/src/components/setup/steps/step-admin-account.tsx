'use client';

import { MONO } from '@/lib/constants';

export function StepAdminAccount({
  adminFirstName,
  setAdminFirstName,
  adminLastName,
  setAdminLastName,
  adminEmail,
  setAdminEmail,
  adminPassword,
  setAdminPassword,
  adminPasswordConfirm,
  setAdminPasswordConfirm,
}: {
  adminFirstName: string;
  setAdminFirstName: (val: string) => void;
  adminLastName: string;
  setAdminLastName: (val: string) => void;
  adminEmail: string;
  setAdminEmail: (val: string) => void;
  adminPassword: string;
  setAdminPassword: (val: string) => void;
  adminPasswordConfirm: string;
  setAdminPasswordConfirm: (val: string) => void;
}) {
  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <p className="text-xs text-[color:var(--color-text-subtle)] mb-4" style={MONO}>
        Create your primary administrator account for managing GymSynk:
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[color:var(--color-text-subtle)] mb-2" style={MONO}>
            First Name *
          </label>
          <input
            type="text"
            value={adminFirstName}
            onChange={(e) => setAdminFirstName(e.target.value)}
            placeholder="e.g. Alex"
            className="w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-4 py-3 text-sm text-[color:var(--color-text-strong)] placeholder-[color:var(--color-text-muted)] outline-none focus:border-[color:var(--color-border-strong)] transition"
            autoFocus
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[color:var(--color-text-subtle)] mb-2" style={MONO}>
            Last Name *
          </label>
          <input
            type="text"
            value={adminLastName}
            onChange={(e) => setAdminLastName(e.target.value)}
            placeholder="e.g. Morgan"
            className="w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-4 py-3 text-sm text-[color:var(--color-text-strong)] placeholder-[color:var(--color-text-muted)] outline-none focus:border-[color:var(--color-border-strong)] transition"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[color:var(--color-text-subtle)] mb-2" style={MONO}>
          Admin Email *
        </label>
        <input
          type="email"
          value={adminEmail}
          onChange={(e) => setAdminEmail(e.target.value)}
          placeholder="admin@yourgym.com"
          className="w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-4 py-3 text-sm text-[color:var(--color-text-strong)] placeholder-[color:var(--color-text-muted)] outline-none focus:border-[color:var(--color-border-strong)] transition"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[color:var(--color-text-subtle)] mb-2" style={MONO}>
            Password *
          </label>
          <input
            type="password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-4 py-3 text-sm text-[color:var(--color-text-strong)] placeholder-[color:var(--color-text-muted)] outline-none focus:border-[color:var(--color-border-strong)] transition"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[color:var(--color-text-subtle)] mb-2" style={MONO}>
            Confirm Password *
          </label>
          <input
            type="password"
            value={adminPasswordConfirm}
            onChange={(e) => setAdminPasswordConfirm(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-4 py-3 text-sm text-[color:var(--color-text-strong)] placeholder-[color:var(--color-text-muted)] outline-none focus:border-[color:var(--color-border-strong)] transition"
          />
        </div>
      </div>
    </div>
  );
}
