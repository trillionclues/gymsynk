'use client';

import type { OperatingHourPayload } from '@/services/setup-service';
import { MONO } from '@/lib/constants';

const DAYS_OF_WEEK = [
  { day: 1, name: 'Monday' },
  { day: 2, name: 'Tuesday' },
  { day: 3, name: 'Wednesday' },
  { day: 4, name: 'Thursday' },
  { day: 5, name: 'Friday' },
  { day: 6, name: 'Saturday' },
  { day: 0, name: 'Sunday' },
];

export function StepOperatingHours({
  operatingHours,
  onOpenTimePicker,
}: {
  operatingHours: OperatingHourPayload[];
  onOpenTimePicker: (target: { day: number; session: 'MORNING' | 'EVENING'; field: 'openTime' | 'closeTime'; currentTime: string }) => void;
}) {
  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <p className="text-xs text-[color:var(--color-text-subtle)] mb-4" style={MONO}>
        Configure your gym's morning and evening session check-in windows (tap time chips to adjust):
      </p>
      <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
        {DAYS_OF_WEEK.map(({ day, name }) => {
          const mHour = operatingHours.find((h) => h.dayOfWeek === day && h.sessionType === 'MORNING');
          const eHour = operatingHours.find((h) => h.dayOfWeek === day && h.sessionType === 'EVENING');

          return (
            <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] p-3">
              <span className="text-xs font-bold text-[color:var(--color-text-strong)] w-24" style={MONO}>
                {name}
              </span>
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold text-[color:var(--color-text-subtle)]" style={MONO}>AM</span>
                  <button
                    type="button"
                    onClick={() => onOpenTimePicker({ day, session: 'MORNING', field: 'openTime', currentTime: mHour?.openTime || '06:00' })}
                    className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-2.5 py-1 text-xs font-semibold hover:border-[color:var(--color-border-strong)] transition"
                    style={MONO}
                  >
                    {mHour?.openTime || '06:00'}
                  </button>
                  <span>-</span>
                  <button
                    type="button"
                    onClick={() => onOpenTimePicker({ day, session: 'MORNING', field: 'closeTime', currentTime: mHour?.closeTime || '12:00' })}
                    className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-2.5 py-1 text-xs font-semibold hover:border-[color:var(--color-border-strong)] transition"
                    style={MONO}
                  >
                    {mHour?.closeTime || '12:00'}
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold text-[color:var(--color-text-subtle)]" style={MONO}>PM</span>
                  <button
                    type="button"
                    onClick={() => onOpenTimePicker({ day, session: 'EVENING', field: 'openTime', currentTime: eHour?.openTime || '16:00' })}
                    className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-2.5 py-1 text-xs font-semibold hover:border-[color:var(--color-border-strong)] transition"
                    style={MONO}
                  >
                    {eHour?.openTime || '16:00'}
                  </button>
                  <span>-</span>
                  <button
                    type="button"
                    onClick={() => onOpenTimePicker({ day, session: 'EVENING', field: 'closeTime', currentTime: eHour?.closeTime || '21:00' })}
                    className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-2.5 py-1 text-xs font-semibold hover:border-[color:var(--color-border-strong)] transition"
                    style={MONO}
                  >
                    {eHour?.closeTime || '21:00'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
