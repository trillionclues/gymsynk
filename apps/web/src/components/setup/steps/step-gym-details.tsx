'use client';

import type { CurrencyItem } from '@/services/setup-service';
import { MONO } from '@/lib/constants';
import { ChevronRight } from 'lucide-react';

const TIMEZONES = [
  { value: 'Africa/Lagos', label: 'Africa/Lagos (WAT, UTC+1)' },
  { value: 'Africa/Accra', label: 'Africa/Accra (GMT, UTC+0)' },
  { value: 'Africa/Nairobi', label: 'Africa/Nairobi (EAT, UTC+3)' },
  { value: 'Africa/Johannesburg', label: 'Africa/Johannesburg (SAST, UTC+2)' },
  { value: 'Europe/London', label: 'Europe/London (GMT/BST)' },
  { value: 'America/New_York', label: 'America/New_York (EST)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST, UTC+4)' },
];

export function StepGymDetails({
  orgName,
  setOrgName,
  timezone,
  setTimezone,
  selectedCurrencyObj,
  onOpenCurrencySheet,
}: {
  orgName: string;
  setOrgName: (val: string) => void;
  timezone: string;
  setTimezone: (val: string) => void;
  selectedCurrencyObj: CurrencyItem;
  onOpenCurrencySheet: () => void;
}) {
  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[color:var(--color-text-subtle)] mb-2" style={MONO}>
          Gym / Organization Name *
        </label>
        <input
          type="text"
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          placeholder="e.g. GymSynk Fitness Club"
          className="w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-4 py-3 text-sm text-[color:var(--color-text-strong)] placeholder-[color:var(--color-text-muted)] outline-none focus:border-[color:var(--color-border-strong)] transition"
          autoFocus
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[color:var(--color-text-subtle)] mb-2" style={MONO}>
            Currency *
          </label>
          <div
            onClick={onOpenCurrencySheet}
            className="flex items-center justify-between rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-4 py-3 cursor-pointer hover:border-[color:var(--color-border-strong)] transition"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base shrink-0">{selectedCurrencyObj.flag || '🌐'}</span>
              <span className="text-sm font-bold text-[color:var(--color-text-strong)] shrink-0" style={MONO}>
                {selectedCurrencyObj.code} ({selectedCurrencyObj.symbol})
              </span>
              <span className="text-xs text-[color:var(--color-text-subtle)] truncate">
                — {selectedCurrencyObj.name}
              </span>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-[color:var(--color-text-subtle)]" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[color:var(--color-text-subtle)] mb-2" style={MONO}>
            Operating Timezone *
          </label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-4 py-3 text-sm text-[color:var(--color-text-strong)] outline-none focus:border-[color:var(--color-border-strong)] transition"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
