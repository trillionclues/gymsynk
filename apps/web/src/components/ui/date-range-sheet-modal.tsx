'use client';

import { useState } from 'react';
import { MONO } from '@/lib/constants';
import { Calendar, AlertCircle } from 'lucide-react';
import { BottomSheet } from './bottom-sheet';

export function DateRangeSheetModal({
  open,
  onClose,
  fromDate,
  toDate,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  fromDate: string;
  toDate: string;
  onApply: (from: string, to: string) => void;
}) {
  const [start, setStart] = useState(fromDate);
  const [end, setEnd] = useState(toDate);
  const [error, setError] = useState<string | null>(null);

  const handlePreset = (days: number) => {
    const today = new Date().toISOString().split('T')[0];
    const past = new Date(Date.now() - (days - 1) * 86400000).toISOString().split('T')[0];
    setStart(past);
    setEnd(today);
    setError(null);
  };

  const handleSave = () => {
    const fTime = new Date(start).getTime();
    const tTime = new Date(end).getTime();
    if (isNaN(fTime) || isNaN(tTime)) {
      setError('Please select valid start and end dates.');
      return;
    }
    if (tTime < fTime) {
      setError('End date must be on or after start date.');
      return;
    }
    const diffDays = Math.round((tTime - fTime) / 86400000) + 1;
    if (diffDays > 30) {
      setError('Date range cannot exceed 30 days.');
      return;
    }
    onApply(start, end);
    onClose();
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Select Date Range"
      titleIcon={<Calendar className="h-5 w-5 text-emerald-500" />}
      maxWidth="md"
    >
      <div className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-500 font-bold" style={MONO}>
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[color:var(--color-text-subtle)] mb-2" style={MONO}>
            Quick Presets
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handlePreset(7)}
              className="py-2.5 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] text-xs font-bold hover:border-emerald-500 hover:text-emerald-500 transition"
              style={MONO}
            >
              Last 7 Days
            </button>
            <button
              type="button"
              onClick={() => handlePreset(14)}
              className="py-2.5 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] text-xs font-bold hover:border-emerald-500 hover:text-emerald-500 transition"
              style={MONO}
            >
              Last 14 Days
            </button>
            <button
              type="button"
              onClick={() => handlePreset(30)}
              className="py-2.5 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] text-xs font-bold hover:border-emerald-500 hover:text-emerald-500 transition"
              style={MONO}
            >
              Last 30 Days
            </button>
          </div>
        </div>

        <div className="pt-2 border-t border-[color:var(--color-border)]">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[color:var(--color-text-subtle)] mb-2" style={MONO}>
            Custom Start & End Dates (Max 30 Days)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[color:var(--color-text-subtle)] mb-1" style={MONO}>From</label>
              <input
                type="date"
                value={start}
                onChange={(e) => { setStart(e.target.value); setError(null); }}
                className="w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-3 py-2.5 text-xs font-bold text-[color:var(--color-text-strong)] outline-none"
                style={MONO}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[color:var(--color-text-subtle)] mb-1" style={MONO}>To</label>
              <input
                type="date"
                value={end}
                onChange={(e) => { setEnd(e.target.value); setError(null); }}
                className="w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-3 py-2.5 text-xs font-bold text-[color:var(--color-text-strong)] outline-none"
                style={MONO}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[color:var(--color-border)]">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[color:var(--color-border)] px-4 py-2 text-xs font-semibold"
            style={MONO}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-xl bg-[color:var(--color-text-strong)] text-[color:var(--color-surface)] px-5 py-2 text-xs font-extrabold uppercase tracking-wider hover:opacity-90 transition"
            style={MONO}
          >
            Apply Range
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
