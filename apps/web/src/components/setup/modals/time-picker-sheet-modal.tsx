'use client';

import { useState } from 'react';
import { MONO } from '@/lib/constants';
import { Clock, X } from 'lucide-react';

export function TimePickerSheetModal({
  target,
  onSelectTime,
  onClose,
}: {
  target: { day: number; session: 'MORNING' | 'EVENING'; field: 'openTime' | 'closeTime'; currentTime: string };
  onSelectTime: (timeStr: string) => void;
  onClose: () => void;
}) {
  const PRESETS = [
    '05:00', '05:30', '06:00', '06:30', '07:00', '07:30', '08:00', '09:00',
    '12:00', '13:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00',
  ];

  const [customTime, setCustomTime] = useState(target.currentTime);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-emerald-500" />
            <h3 className="text-sm font-extrabold text-[color:var(--color-text-strong)]" style={MONO}>
              Pick {target.session} {target.field === 'openTime' ? 'Opening' : 'Closing'} Time
            </h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-[color:var(--color-text-subtle)] hover:bg-[color:var(--color-surface-2)] rounded-lg">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[color:var(--color-text-subtle)] mb-2" style={MONO}>
            Quick Presets
          </label>
          <div className="grid grid-cols-4 gap-2">
            {PRESETS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onSelectTime(t)}
                className={`py-2 rounded-xl border text-xs font-bold transition ${
                  t === target.currentTime
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                    : 'border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] hover:border-[color:var(--color-border-strong)]'
                }`}
                style={MONO}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-[color:var(--color-border)]">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[color:var(--color-text-subtle)] mb-2" style={MONO}>
            Custom Time
          </label>
          <div className="flex items-center gap-3">
            <input
              type="time"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
              className="flex-1 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-4 py-2.5 text-sm font-bold text-[color:var(--color-text-strong)] outline-none"
              style={MONO}
            />
            <button
              type="button"
              onClick={() => onSelectTime(customTime)}
              className="rounded-xl bg-[color:var(--color-text-strong)] text-[color:var(--color-surface)] px-5 py-2.5 text-xs font-bold uppercase tracking-wider"
              style={MONO}
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
