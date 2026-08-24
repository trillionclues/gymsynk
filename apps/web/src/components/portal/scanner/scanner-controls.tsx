import type { ReactNode } from 'react';
import { LoaderCircle, ScanLine, Users } from 'lucide-react';
import type { LocationResponse } from '@/services/location-service';

export function ScannerControls({
  locations,
  loadingLocations,
  locationId,
  onLocationChange,
  manualMemberNumber,
  onManualMemberNumberChange,
  overrideReason,
  onOverrideReasonChange,
  onManualCheckIn,
  onOverrideCheckIn,
  busy,
  canOverride,
}: {
  locations: LocationResponse[];
  loadingLocations: boolean;
  locationId: string;
  onLocationChange: (value: string) => void;
  manualMemberNumber: string;
  onManualMemberNumberChange: (value: string) => void;
  overrideReason: string;
  onOverrideReasonChange: (value: string) => void;
  onManualCheckIn: () => void;
  onOverrideCheckIn: () => void;
  busy: boolean;
  canOverride: boolean;
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5 shadow-[0_1px_4px_var(--color-shadow)]">
      <div className="border-b border-[color:var(--color-border)] pb-4">
        <h3 className="text-sm font-semibold text-[color:var(--color-text-strong)]">Controls</h3>
        <p className="mt-0.5 text-xs text-[color:var(--color-text-muted)]">
          Pick a location, then scan or use manual entry.
        </p>
      </div>

      <Field label="Location">
        <select
          value={locationId}
          onChange={(e) => onLocationChange(e.target.value)}
          disabled={loadingLocations}
          className={inputClass}
        >
          <option value="">Select location</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
      </Field>

      <Field label="Manual member number">
        <input
          value={manualMemberNumber}
          onChange={(e) => onManualMemberNumberChange(e.target.value)}
          placeholder="GS-00001"
          className={inputClass}
        />
      </Field>

      <button
        type="button"
        onClick={onManualCheckIn}
        disabled={busy || !manualMemberNumber.trim() || !locationId}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[color:var(--color-primary)] px-4 py-3 text-sm font-medium text-[color:var(--color-text-on-primary)] transition hover:bg-[color:var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
        Manual check-in
      </button>

      {/* visible when last result was EXPIRED_PLAN */}
      {canOverride ? (
        <div className="space-y-3 rounded-xl border border-[color:var(--color-status-override-bg)] bg-[color:var(--color-status-override-bg)] p-4">
          <div>
            <p className="text-sm font-semibold text-[color:var(--color-status-override)]">Override expired plan</p>
            <p className="mt-0.5 text-xs text-[color:var(--color-text-muted)]">
              Cashier can approve entry despite an expired membership.
            </p>
          </div>
          <Field label="Override reason">
            <input
              value={overrideReason}
              onChange={(e) => onOverrideReasonChange(e.target.value)}
              placeholder="Manager approved"
              className={inputClass}
            />
          </Field>
          <button
            type="button"
            onClick={onOverrideCheckIn}
            disabled={busy || !overrideReason.trim()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[color:var(--color-status-override)] px-4 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ScanLine className="h-4 w-4" />
            Approve override
          </button>
        </div>
      ) : null}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-[color:var(--color-text-muted)] uppercase tracking-wide">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  'w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-4 py-2.5 text-sm text-[color:var(--color-text-strong)] outline-none transition placeholder:text-[color:var(--color-text-subtle)] focus:border-[color:var(--color-border-strong)] focus:ring-2 focus:ring-[color:var(--color-accent-muted)]';
