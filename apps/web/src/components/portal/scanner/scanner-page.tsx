'use client';

import { useCallback } from 'react';
import { CameraOff, MapPin, ScanLine } from 'lucide-react';
import { QrScannerCamera } from './qr-scanner-camera';
import { ScannerControls } from './scanner-controls';
import { ScannerResultOverlay } from './scanner-result-overlay';
import { useScannerStation } from '@/hooks/use-scanner-station';
import { cn } from '@/lib/utils';

export function ScannerPage() {
  const station = useScannerStation();
  const { submitQr } = station;

  const activeLocation = station.locations.find((l) => l.id === station.locationId);

  const handleDetected = useCallback(
    (token: string) => {
      void submitQr(token);
    },
    [submitQr],
  );

  const statusText = station.busy
    ? 'Processing scan…'
    : station.locationId
    ? 'Ready — waiting for QR scan'
    : 'Choose a location first';

  const statusColor = station.busy
    ? 'text-[color:var(--color-status-override)]'
    : station.locationId
    ? 'text-[color:var(--color-status-valid)]'
    : 'text-[color:var(--color-text-muted)]';

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-[color:var(--color-border)]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[color:var(--color-text-strong)] sm:text-2xl">
            Scanner Station
          </h1>
          <p className="text-xs text-[color:var(--color-text-muted)] mt-0.5">
            Continuous camera QR decoding & manual member number check-in
          </p>
        </div>

        {activeLocation && (
          <div className="flex items-center gap-2 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-3 py-1.5 text-xs font-semibold text-[color:var(--color-text-strong)] shrink-0">
            <MapPin className="h-3.5 w-3.5 text-[color:var(--color-accent)]" />
            <span>{activeLocation.name}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-status-valid)] animate-pulse ml-1" />
          </div>
        )}
      </div>

      {station.error ? (
        <div className="flex items-center justify-between rounded-xl border border-[color:var(--color-status-expired-bg)] bg-[color:var(--color-status-expired-bg)] px-4 py-3 text-sm text-[color:var(--color-status-expired)]">
          <span>{station.error}</span>
          <button
            type="button"
            onClick={station.clearError}
            className="ml-4 text-xs underline opacity-70 hover:opacity-100 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-3">
          <QrScannerCamera
            enabled={Boolean(station.locationId) && !station.busy}
            onDetected={handleDetected}
          />

          <div className="flex items-center justify-between rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-3.5 shadow-xs">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'h-2.5 w-2.5 rounded-full',
                  station.busy
                    ? 'bg-[color:var(--color-status-override)] animate-pulse'
                    : station.locationId
                    ? 'bg-[color:var(--color-status-valid)]'
                    : 'bg-[color:var(--color-status-wrong)]',
                )}
              />
              <div>
                <p className="text-sm font-semibold text-[color:var(--color-text-strong)]">
                  Scanner Station Status
                </p>
                <p className={cn('text-xs font-medium', statusColor)}>{statusText}</p>
              </div>
            </div>
            <div className="hidden items-center gap-1.5 text-xs text-[color:var(--color-text-muted)] sm:flex">
              <CameraOff className="h-3.5 w-3.5" />
              Manual fallback active
            </div>
          </div>
        </div>

        <ScannerControls
          locations={station.locations}
          loadingLocations={station.loadingLocations}
          locationId={station.locationId}
          onLocationChange={station.setLocationId}
          manualMemberNumber={station.manualMemberNumber}
          onManualMemberNumberChange={station.setManualMemberNumber}
          overrideReason={station.overrideReason}
          onOverrideReasonChange={station.setOverrideReason}
          onManualCheckIn={() => void station.submitManual()}
          onOverrideCheckIn={() => void station.submitOverride()}
          busy={station.busy}
          canOverride={station.result?.status === 'EXPIRED_PLAN'}
        />
      </section>

      <ScannerResultOverlay result={station.result} onDismiss={station.clearResult} />
    </div>
  );
}
