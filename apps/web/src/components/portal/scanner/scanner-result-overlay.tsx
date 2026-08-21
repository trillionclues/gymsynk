'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, XCircle, AlertTriangle, X, CopyX, ShieldCheck } from 'lucide-react';
import type { ScannerResult } from '@/hooks/use-scanner-station';
import { cn } from '@/lib/utils';

const STATUS_META: Record<
  string,
  { label: string; tone: 'valid' | 'expired' | 'override' | 'wrong'; Icon: typeof CheckCircle2 }
> = {
  VALID:              { label: 'Access granted',      tone: 'valid',    Icon: CheckCircle2 },
  OVERRIDE:           { label: 'Override approved',   tone: 'override', Icon: ShieldCheck },
  EXPIRED_PLAN:       { label: 'Plan expired',        tone: 'expired',  Icon: XCircle },
  WRONG_SESSION:      { label: 'Wrong session',       tone: 'wrong',    Icon: AlertTriangle },
  WRONG_DAY:          { label: 'Wrong day',           tone: 'wrong',    Icon: AlertTriangle },
  ALREADY_CHECKED_IN: { label: 'Already checked in', tone: 'wrong',    Icon: CopyX },
};

const TONES = {
  valid:    { card: 'bg-[color:var(--color-status-valid-bg)] border-[color:var(--color-status-valid)]', icon: 'bg-[color:var(--color-status-valid)] text-white', text: 'text-[color:var(--color-status-valid)]' },
  expired:  { card: 'bg-[color:var(--color-status-expired-bg)] border-[color:var(--color-status-expired)]', icon: 'bg-[color:var(--color-status-expired)] text-white', text: 'text-[color:var(--color-status-expired)]' },
  override: { card: 'bg-[color:var(--color-status-override-bg)] border-[color:var(--color-status-override)]', icon: 'bg-[color:var(--color-status-override)] text-white', text: 'text-[color:var(--color-status-override)]' },
  wrong:    { card: 'bg-[color:var(--color-status-wrong-bg)] border-[color:var(--color-status-wrong)]', icon: 'bg-[color:var(--color-surface-3)] text-[color:var(--color-status-wrong)]', text: 'text-[color:var(--color-status-wrong)]' },
};

function playAudioFeedback(status: string) {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (status === 'VALID' || status === 'OVERRIDE') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(196, ctx.currentTime);
      osc.frequency.setValueAtTime(146.83, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    }
  } catch {
    /* ignore audio policy blocks */
  }
}

export function ScannerResultOverlay({
  result,
  onDismiss,
}: {
  result: ScannerResult | null;
  onDismiss: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (result) {
      playAudioFeedback(result.status);
    }
  }, [result]);

  if (!result || !mounted) return null;

  const meta = STATUS_META[result.status] ?? { label: result.status, tone: 'wrong' as const, Icon: XCircle };
  const tone = TONES[meta.tone];

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-scale-in"
      onClick={onDismiss}
    >
      <div
        className={cn(
          'relative w-full max-w-md rounded-3xl border p-6 shadow-2xl z-10',
          tone.card,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dismiss button */}
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss result"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-black transition hover:bg-white cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-xs', tone.icon)}>
            <meta.Icon className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className={cn('text-[10px] font-bold uppercase tracking-widest opacity-80', tone.text)}>
              {result.mode === 'QR' ? 'QR Scan' : 'Manual Entry'}
            </p>
            <h3 className={cn('mt-0.5 text-xl font-bold tracking-tight', tone.text)}>
              {meta.label}
            </h3>
            <div className="mt-3 space-y-1">
              <p className="text-sm font-bold text-[color:var(--color-text-strong)]">
                {result.memberName}
              </p>
              <p className="text-xs text-[color:var(--color-text-muted)]">
                {result.memberNumber} · {result.planName}
              </p>
              {result.session ? (
                <p className="text-xs text-[color:var(--color-text-muted)]">Session: {result.session}</p>
              ) : null}
              {result.overrideReason ? (
                <p className="mt-2 text-xs text-[color:var(--color-status-override)] font-semibold">
                  Override reason: {result.overrideReason}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {/* Hint for persistent results */}
        {result.status !== 'VALID' && result.status !== 'OVERRIDE' && (
          <p className="mt-4 text-center text-xs text-[color:var(--color-text-muted)] font-medium">
            Tap anywhere or press × to dismiss
          </p>
        )}
      </div>
    </div>,
    document.body,
  );
}
