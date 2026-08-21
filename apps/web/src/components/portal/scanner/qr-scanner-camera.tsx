'use client';

import { useEffect, useRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { ScanLine } from 'lucide-react';

export function QrScannerCamera({
  enabled,
  onDetected,
}: {
  enabled: boolean;
  onDetected: (token: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const onDetectedRef = useRef(onDetected);

  useEffect(() => {
    onDetectedRef.current = onDetected;
  }, [onDetected]);

  useEffect(() => {
    if (!enabled || !videoRef.current) return;

    const reader = new BrowserMultiFormatReader();
    let stopped = false;
    let stopFn: (() => void) | undefined;

    reader
      .decodeFromVideoDevice(undefined, videoRef.current, (result, _err, controls) => {
        if (!stopFn) stopFn = () => controls.stop();
        if (stopped) return;
        if (result) {
          onDetectedRef.current(result.getText());
          controls.stop();
          stopped = true;
        }
      })
      .catch(() => {/* camera unavailable — parent UI handles */});

    return () => {
      stopped = true;
      stopFn?.();
    };
  }, [enabled]);


  return (
    <div className="relative overflow-hidden rounded-2xl border border-[color:var(--color-border)] bg-black shadow-[0_4px_16px_var(--color-shadow-md)]">
      <video ref={videoRef} className="h-[380px] w-full object-cover sm:h-[480px]" muted playsInline />
      {/* Scan frame overlay */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="relative h-48 w-48">
          <div className="absolute left-0 top-0 h-8 w-8 rounded-tl-xl border-l-2 border-t-2 border-white/70" />
          <div className="absolute right-0 top-0 h-8 w-8 rounded-tr-xl border-r-2 border-t-2 border-white/70" />
          <div className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-xl border-b-2 border-l-2 border-white/70" />
          <div className="absolute bottom-0 right-0 h-8 w-8 rounded-br-xl border-b-2 border-r-2 border-white/70" />
          {enabled && (
            <div className="absolute inset-x-0 top-0 h-0.5 bg-[color:var(--color-accent)] opacity-80 animate-[scan_2s_ease-in-out_infinite]" />
          )}
        </div>
      </div>
      {!enabled && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 backdrop-blur-sm">
          <ScanLine className="h-8 w-8 text-white/50" />
          <p className="text-sm text-white/60">Select a location to enable the camera</p>
        </div>
      )}
    </div>
  );
}
