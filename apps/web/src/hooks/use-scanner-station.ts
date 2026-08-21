'use client';

import { useCallback, useEffect, useState } from 'react';
import { listLocations, type LocationResponse } from '@/services/location-service';
import { lookupMemberByNumber } from '@/services/member-service';
import { manualCheckIn, validateQrToken, type CheckInResponse } from '@/services/checkin-service';

export type ScannerResult = CheckInResponse & {
  memberId: string;
  mode: 'QR' | 'MANUAL';
  overrideReason?: string;
};

/** Statuses that auto-dismiss after 2.5s — all others stay until manually dismissed */
const TRANSIENT_STATUSES = new Set(['VALID', 'OVERRIDE']);

export function useScannerStation() {
  const [locations, setLocations] = useState<LocationResponse[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [locationId, setLocationId] = useState('');
  const [manualMemberNumber, setManualMemberNumber] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [result, setResult] = useState<ScannerResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoadingLocations(true);
      try {
        const data = await listLocations();
        if (!active) return;
        const activeLocs = data.filter((l) => l.isActive);
        setLocations(activeLocs);
        setLocationId((cur) => cur || activeLocs[0]?.id || '');
      } catch {
        if (!active) return;
        setError('Failed to load locations. Please check your connection or sign in again.');
      } finally {
        if (active) setLoadingLocations(false);
      }
    };


    void load();
    return () => { active = false; };
  }, []);

  // Auto-dismiss only VALID / OVERRIDE results after 2.5 s
  useEffect(() => {
    if (!result) return;
    if (!TRANSIENT_STATUSES.has(result.status)) return; // persistent — cashier dismisses manually
    const timer = window.setTimeout(() => setResult(null), 2500);
    return () => window.clearTimeout(timer);
  }, [result]);

  const submitQr = useCallback(async (token: string) => {
    if (!locationId) { setError('Choose a location before scanning.'); return; }
    setBusy(true);
    setError(null);
    try {
      const response = await validateQrToken(token, locationId);
      setResult({ ...response, memberId: response.memberId, mode: 'QR' });
    } catch {
      setError('QR validation failed. Try another scan or use manual entry.');
    } finally {
      setBusy(false);
    }
  }, [locationId]);

  const submitManual = useCallback(async () => {
    if (!locationId) { setError('Choose a location before manual check-in.'); return; }
    setBusy(true);
    setError(null);
    try {
      const member = await lookupMemberByNumber(manualMemberNumber.trim());
      if (!member) { setError('No member matched that number.'); return; }
      const response = await manualCheckIn(member.id, locationId);
      setResult({ ...response, memberId: member.id, mode: 'MANUAL' });
    } catch {
      setError('Manual check-in failed.');
    } finally {
      setBusy(false);
    }
  }, [locationId, manualMemberNumber]);

  const submitOverride = useCallback(async () => {
    if (!result?.memberId) { setError('No member is available to override.'); return; }
    if (!overrideReason.trim()) { setError('Add an override reason before continuing.'); return; }
    setBusy(true);
    setError(null);
    try {
      const response = await manualCheckIn(result.memberId, locationId, overrideReason.trim());
      setResult({ ...response, memberId: result.memberId, mode: 'MANUAL', overrideReason: overrideReason.trim() });
      setOverrideReason('');
    } catch {
      setError('Override check-in failed.');
    } finally {
      setBusy(false);
    }
  }, [result?.memberId, locationId, overrideReason]);

  const clearResult = useCallback(() => setResult(null), []);
  const clearError = useCallback(() => setError(null), []);

  return {
    locations,
    loadingLocations,
    locationId,
    setLocationId,
    manualMemberNumber,
    setManualMemberNumber,
    overrideReason,
    setOverrideReason,
    result,
    error,
    busy,
    submitQr,
    submitManual,
    submitOverride,
    clearResult,
    clearError,
  };

}
