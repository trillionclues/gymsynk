'use client';

import { MONO } from '@/lib/constants';

export function StepLocation({
  locationName,
  setLocationName,
  address,
  setAddress,
  phone,
  setPhone,
}: {
  locationName: string;
  setLocationName: (val: string) => void;
  address: string;
  setAddress: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
}) {
  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[color:var(--color-text-subtle)] mb-2" style={MONO}>
          Branch / Location Name *
        </label>
        <input
          type="text"
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
          placeholder="e.g. Main Branch / Lekki Phase 1"
          className="w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-4 py-3 text-sm text-[color:var(--color-text-strong)] placeholder-[color:var(--color-text-muted)] outline-none focus:border-[color:var(--color-border-strong)] transition"
          autoFocus
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[color:var(--color-text-subtle)] mb-2" style={MONO}>
          Street Address (Optional)
        </label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="e.g. 15 Admiralty Way, Lekki Phase 1, Lagos"
          className="w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-4 py-3 text-sm text-[color:var(--color-text-strong)] placeholder-[color:var(--color-text-muted)] outline-none focus:border-[color:var(--color-border-strong)] transition"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[color:var(--color-text-subtle)] mb-2" style={MONO}>
          Phone Number (Optional)
        </label>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="e.g. +234 801 234 5678"
          className="w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-4 py-3 text-sm text-[color:var(--color-text-strong)] placeholder-[color:var(--color-text-muted)] outline-none focus:border-[color:var(--color-border-strong)] transition"
        />
      </div>
    </div>
  );
}
