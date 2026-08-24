'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LoaderCircle, LogOut, History, AlertTriangle } from 'lucide-react';
import { logoutStaff } from '@/services/auth-service';
import { getMyProfile, getMyQrToken, type MemberProfile } from '@/services/member-pwa-service';
import { useAuthStore } from '@/stores/authStore';
import { MONO } from '@/lib/constants';

const QR_TTL = 120; // seconds — must match backend app.qr.token-ttl-seconds

export function MemberHomePage() {
  const router       = useRouter();
  const clearSession = useAuthStore((s) => s.clearSession);

  const [profile,  setProfile]  = useState<MemberProfile | null>(null);
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const [ttl,      setTtl]      = useState(QR_TTL);
  const [loading,  setLoading]  = useState(true);
  const [qrLoading, setQrLoading] = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const ttlRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const refreshRef  = useRef<ReturnType<typeof setTimeout> | null>(null);


  useEffect(() => {
    let active = true;
    getMyProfile()
      .then((p) => { if (active) setProfile(p); })
      .catch(() => { if (active) setError('Could not load your profile.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const generateQr = useCallback(async () => {
    setQrLoading(true);
    setError(null);
    try {
      const res = await getMyQrToken();
      setQrBase64(res.qrBase64);
      const ttlSecs = res.ttlSeconds ?? QR_TTL;
      setTtl(ttlSecs);

      // Countdown
      if (ttlRef.current) clearInterval(ttlRef.current);
      ttlRef.current = setInterval(() => {
        setTtl((prev) => {
          if (prev <= 1) {
            clearInterval(ttlRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Auto-refresh slightly before expiry
      if (refreshRef.current) clearTimeout(refreshRef.current);
      refreshRef.current = setTimeout(() => void generateQr(), (ttlSecs - 5) * 1000);
    } catch {
      setError('Could not generate your QR code. Tap to retry.');
    } finally {
      setQrLoading(false);
    }
  }, []);

  // Generate on mount (after profile loads)
  useEffect(() => {
    if (!loading) void generateQr();
    return () => {
      if (ttlRef.current)    clearInterval(ttlRef.current);
      if (refreshRef.current) clearTimeout(refreshRef.current);
    };
  }, [loading, generateQr]);

  const handleLogout = async () => {
    try { await logoutStaff(); } catch { /* ignore */ }
    clearSession();
    router.push('/member/login');
  };

  const membership        = profile?.activeMembership;
  const isExpired         = membership ? membership.daysRemaining <= 0 : false;
  const isExpiringSoon    = membership ? membership.daysRemaining <= 5 && !isExpired : false;
  const ttlPct            = (ttl / QR_TTL) * 100;
  const ttlCritical       = ttl <= 20;
  const initials = profile
    ? `${profile.firstName?.trim()[0] ?? ''}${profile.lastName?.trim()[0] ?? ''}`.toUpperCase() || '?'
    : '—';

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <LoaderCircle className="h-6 w-6 animate-spin" style={{ color: 'var(--color-text-subtle)' }} />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col px-4 py-6">

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center border text-[12px]"
            style={{ ...MONO, borderColor: 'var(--color-border)', background: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}
          >
            {initials}
          </div>
          <div>
            <p className="text-[14px] font-semibold leading-none" style={{ color: 'var(--color-text-strong)' }}>
              {profile ? `${profile.firstName} ${profile.lastName}` : '—'}
            </p>
            <p className="mt-0.5 text-[11px]" style={{ ...MONO, color: 'var(--color-text-subtle)' }}>
              {profile?.memberNumber ?? '—'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/member/history"
            className="flex h-9 w-9 items-center justify-center border transition hover:border-[color:var(--color-border-strong)]"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
            title="Check-in history"
          >
            <History className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex h-9 w-9 items-center justify-center border transition hover:border-[color:var(--color-border-strong)]"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {(isExpiringSoon || isExpired) && (
        <div
          className="mb-4 flex items-start gap-3 border px-4 py-3"
          style={{
            borderColor: isExpired ? 'var(--color-plate-rust-border)' : 'var(--color-plate-gold-border)',
            background:  isExpired ? 'var(--color-status-expired-bg)' : 'var(--color-status-override-bg)',
          }}
        >
          <AlertTriangle
            className="mt-0.5 h-4 w-4 shrink-0"
            style={{ color: isExpired ? 'var(--color-status-expired)' : 'var(--color-status-override)' }}
          />
          <div>
            <p
              className="text-[13px] font-semibold"
              style={{ color: isExpired ? 'var(--color-status-expired)' : 'var(--color-status-override)' }}
            >
              {isExpired ? 'Membership expired' : `Expires in ${membership!.daysRemaining} day${membership!.daysRemaining === 1 ? '' : 's'}`}
            </p>
            <p className="mt-0.5 text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
              {isExpired
                ? 'Your membership has lapsed. See a cashier to renew.'
                : 'Visit the front desk or speak to a cashier to renew before it lapses.'}
            </p>
          </div>
        </div>
      )}

      <div className="flex-1">
        <div
          className="border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="eyebrow">Check-in QR</p>
              <p className="mt-1 text-[11px]" style={{ ...MONO, color: 'var(--color-text-subtle)' }}>
                Show this to the scanner at the entrance.
              </p>
            </div>
            {membership && (
              <span
                className="inline-flex items-center gap-[6px] border px-[8px] py-[4px] text-[10px] uppercase tracking-[0.08em]"
                style={{
                  ...MONO,
                  color:       isExpired ? 'var(--color-status-expired)' : 'var(--color-status-valid)',
                  borderColor: isExpired ? 'var(--color-plate-rust-border)' : 'var(--color-plate-moss-border)',
                }}
              >
                <span
                  className="h-[6px] w-[6px] shrink-0"
                  style={{ background: isExpired ? 'var(--color-status-expired)' : 'var(--color-status-valid)' }}
                />
                {membership.planName}
              </span>
            )}
          </div>

          <div
            className="relative flex items-center justify-center bg-white"
            style={{ aspectRatio: '1 / 1', maxWidth: 280, margin: '0 auto' }}
            onClick={() => { if (!qrLoading && ttl === 0) void generateQr(); }}
          >
            {qrLoading ? (
              <LoaderCircle className="h-8 w-8 animate-spin" style={{ color: 'var(--color-text-subtle)' }} />
            ) : qrBase64 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrBase64} alt="QR code" className="h-full w-full object-contain" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-center">
                <p className="text-[12px]" style={{ ...MONO, color: 'var(--color-text-subtle)' }}>
                  {error ?? 'Tap to generate QR'}
                </p>
              </div>
            )}
          </div>

          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.10em]" style={{ ...MONO, color: 'var(--color-text-subtle)' }}>
                Valid for
              </span>
              <span
                className="text-[12px]"
                style={{
                  ...MONO,
                  color: ttlCritical ? 'var(--color-status-expired)' : 'var(--color-status-valid)',
                }}
              >
                {ttl}s
              </span>
            </div>
            <div
              className="relative flex h-[8px] border"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div
                className="pointer-events-none absolute inset-0"
                style={{ backgroundImage: 'repeating-linear-gradient(90deg, var(--color-border) 0 1px, transparent 1px 8px)' }}
              />
              <div
                className="relative z-10 h-full transition-all duration-1000"
                style={{
                  width:      `${ttlPct}%`,
                  background: ttlCritical ? 'var(--color-status-expired)' : 'var(--color-plate-moss-border)',
                }}
              />
            </div>
            {ttl === 0 && (
              <button
                type="button"
                onClick={() => void generateQr()}
                className="mt-2 w-full border py-[9px] text-[11px] uppercase tracking-[0.09em] transition hover:border-[color:var(--color-border-strong)]"
                style={{ ...MONO, borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
              >
                Generate new QR
              </button>
            )}
          </div>
        </div>

        {membership && !isExpired && (
          <div className="mt-3 border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.10em]" style={{ ...MONO, color: 'var(--color-text-subtle)' }}>
                {membership.planName} membership
              </span>
              <span className="text-[12px]" style={{ ...MONO, color: 'var(--color-status-valid)' }}>
                {membership.daysRemaining}d remaining
              </span>
            </div>
            <div
              className="relative flex h-[8px] border"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div
                className="pointer-events-none absolute inset-0"
                style={{ backgroundImage: 'repeating-linear-gradient(90deg, var(--color-border) 0 1px, transparent 1px 8px)' }}
              />
              <div
                className="relative z-10 h-full"
                style={{
                  width:      `${Math.min(100, ((30 - membership.daysRemaining) / 30) * 100)}%`,
                  background: 'var(--color-plate-moss-border)',
                }}
              />
            </div>
            <div className="mt-1.5 flex justify-between">
              <span className="text-[10px]" style={{ ...MONO, color: 'var(--color-text-subtle)' }}>
                {membership.startDate}
              </span>
              <span className="text-[10px]" style={{ ...MONO, color: 'var(--color-text-subtle)' }}>
                {membership.endDate}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
