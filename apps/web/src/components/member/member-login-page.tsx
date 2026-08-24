'use client';

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type FormEvent,
} from 'react';
import { useRouter } from 'next/navigation';
import { requestMemberOtp, verifyMemberOtp } from '@/services/auth-service';
import { decodeSessionUser } from '@/lib/jwt';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import { DISPLAY, MONO } from '@/lib/constants';
import { RequestStage } from './forms/steps/RequestStage';
import { VerifyStage } from './forms/steps/VerifyStage';

const COOLDOWN_DURATION = 60; // seconds
const COOLDOWN_KEY = 'gymsynk-otp-cooldown-end';

function saveCooldownEnd() {
  const end = Date.now() + COOLDOWN_DURATION * 1000;
  sessionStorage.setItem(COOLDOWN_KEY, String(end));
}

function readRemainingCooldown(): number {
  const stored = sessionStorage.getItem(COOLDOWN_KEY);
  if (!stored) return 0;
  const remaining = Math.ceil((Number(stored) - Date.now()) / 1000);
  return remaining > 0 ? remaining : 0;
}

function clearCooldown() {
  sessionStorage.removeItem(COOLDOWN_KEY);
}

function validateEmail(v: string): string | null {
  if (!v.trim()) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return 'Enter a valid email address';
  return null;
}


type Stage = 'request' | 'verify';

export function MemberLoginPage() {
  const router     = useRouter();
  const setSession = useAuthStore((s) => s.setSession);

  const [stage,   setStage]   = useState<Stage>('request');
  const [email,   setEmail]   = useState('');
  const [otp,     setOtp]     = useState('');
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [otpTouched, setOtpTouched] = useState(false);

  // Cooldown — read persisted value on mount so back-nav doesn't reset it
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const remaining = readRemainingCooldown();
    if (remaining > 0) {
      // There's an active cooldown from a previous send — restore it
      setStage('verify');
      setCooldown(remaining);
      startCooldownTick(remaining);
    }
    return () => { if (cooldownRef.current) clearInterval(cooldownRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCooldownTick = useCallback((initial: number) => {
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    setCooldown(initial);
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!);
          clearCooldown();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const emailError = touched ? validateEmail(email) : null;
  const otpError   = otpTouched && otp.length < 6 ? 'Enter all 6 digits' : null;

  const handleRequestOtp = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (validateEmail(email)) return;

    setLoading(true);
    setError(null);
    try {
      await requestMemberOtp(email.trim());
      saveCooldownEnd();
      startCooldownTick(COOLDOWN_DURATION);
      setStage('verify');
      setOtp('');
    } catch (err: unknown) {
      const status = (err as { response?: { status: number } })?.response?.status;
      setError(
        status === 404 ? 'No member account found for that email address.' :
        status === 429 ? 'Too many requests — please wait 10 minutes before trying again.' :
                         'Something went wrong. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setOtpTouched(true);
    if (otp.length < 6) return;

    setLoading(true);
    setError(null);
    try {
      const { accessToken } = await verifyMemberOtp(email.trim(), otp);
      clearCooldown();
      const sessionUser = decodeSessionUser(accessToken, email.trim());
      setSession(accessToken, sessionUser);
      router.push('/member');
    } catch (err: unknown) {
      const status = (err as { response?: { status: number } })?.response?.status;
      setError(
        status === 401
          ? 'Incorrect or expired code. Request a new one below.'
          : 'Verification failed. Please try again.',
      );
      setOtp('');
      setOtpTouched(false);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || loading) return;
    setOtp('');
    setOtpTouched(false);
    setError(null);
    setLoading(true);
    try {
      await requestMemberOtp(email.trim());
      saveCooldownEnd();
      startCooldownTick(COOLDOWN_DURATION);
    } catch {
      setError('Could not resend the code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    // Preserve the cooldown — don't clear it. The user can still resend on
    // the verify screen; going back just lets them fix a typo in the email.
    // The backend rate-limit is the real gate; the UI cooldown is informational.
    setStage('request');
    setOtp('');
    setOtpTouched(false);
    setError(null);
  };

  return (
    <div className="flex flex-1 flex-col">
      <header
        className="flex items-center justify-between border-b px-6 py-4"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center border"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-strong)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <rect x="2"  y="9" width="3" height="6" />
              <rect x="19" y="9" width="3" height="6" />
              <line x1="5" y1="12" x2="19" y2="12" />
              <rect x="7"  y="7" width="2" height="10" />
              <rect x="15" y="7" width="2" height="10" />
            </svg>
          </div>
          <span
            className="text-[15px] font-extrabold"
            style={{ ...DISPLAY, color: 'var(--color-text-strong)' }}
          >
            GymSynk
          </span>
        </div>
        <a
          href="/login"
          className="text-[11px] transition hover:opacity-80"
          style={{ ...MONO, color: 'var(--color-text-subtle)' }}
        >
          Staff login →
        </a>
      </header>

      <div className="flex flex-1 flex-col px-6 py-10">
        {stage === 'request' ? (
          <RequestStage
            email={email}
            setEmail={setEmail}
            touched={touched}
            setTouched={setTouched}
            emailError={emailError}
            loading={loading}
            error={error}
            onSubmit={handleRequestOtp}
          />
        ) : (
          <VerifyStage
            email={email}
            otp={otp}
            setOtp={setOtp}
            otpError={otpError}
            loading={loading}
            error={error}
            cooldown={cooldown}
            onSubmit={handleVerifyOtp}
            onBack={handleBack}
            onResend={handleResend}
          />
        )}
      </div>
    </div>
  );
}

