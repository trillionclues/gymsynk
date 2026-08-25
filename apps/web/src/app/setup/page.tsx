'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { checkSetupStatus } from '@/services/setup-service';
import { SetupWizard } from '@/components/setup/setup-wizard';
import { MONO } from '@/lib/constants';
import { LoaderCircle } from 'lucide-react';

export default function SetupPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [setupNeeded, setSetupNeeded] = useState(false);

  useEffect(() => {
    async function verifyStatus() {
      try {
        const res = await checkSetupStatus();
        if (res.setupComplete) {
          router.replace('/login');
        } else {
          setSetupNeeded(true);
        }
      } catch (err) {
        // If API error or offline, allow setup form render
        setSetupNeeded(true);
      } finally {
        setChecking(false);
      }
    }
    void verifyStatus();
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[color:var(--color-bg)] p-6">
        <div className="flex items-center gap-3 text-sm text-[color:var(--color-text-subtle)]" style={MONO}>
          <LoaderCircle className="h-5 w-5 animate-spin text-[color:var(--color-text-strong)]" />
          <span>Checking setup status...</span>
        </div>
      </div>
    );
  }

  if (!setupNeeded) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[color:var(--color-bg)] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <h2 className="text-3xl font-black tracking-tight text-[color:var(--color-text-strong)]">
          GymSynk Setup
        </h2>
        <p className="mt-1 text-xs text-[color:var(--color-text-subtle)] uppercase tracking-wider" style={MONO}>
          First-Run Organization & Platform Configuration
        </p>
      </div>

      <SetupWizard />
    </main>
  );
}
