import { useCallback, useEffect, useRef, useState } from 'react';

import { startRealtime } from '@/data/deviceManager';
import { useAppStore } from '@/store/appStore';

import { LIVE, spo2Outcome } from './liveMath';
import { useStopOnBackground } from './useStopOnBackground';

export type SpO2Phase =
  | { kind: 'idle' }
  | { kind: 'measuring'; elapsedMs: number }
  | { kind: 'result'; percent: number; saveState: 'saving' | 'saved' | 'failed' }
  | { kind: 'failed' };

// Runs one SpO2 spot check: idle → measuring → result (saved) or failed.
// Everything stops on unmount, when `enabled` turns false, or when the app is backgrounded.
export function useSpO2SpotCheck(enabled: boolean) {
  const saveSpO2Check = useAppStore((state) => state.saveSpO2Check);
  const [phase, setPhase] = useState<SpO2Phase>({ kind: 'idle' });
  const stopStream = useRef<(() => void) | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const readings = useRef<number[]>([]);
  const isMounted = useRef(true);

  const stopAll = useCallback(() => {
    stopStream.current?.();
    stopStream.current = null;
    if (timer.current !== null) clearInterval(timer.current);
    timer.current = null;
  }, []);

  const cancel = useCallback(() => {
    stopAll();
    if (isMounted.current) setPhase({ kind: 'idle' });
  }, [stopAll]);

  const finish = useCallback(
    (percent: number) => {
      stopAll();
      setPhase({ kind: 'result', percent, saveState: 'saving' });
      saveSpO2Check({ ts: Date.now(), percent })
        .then(() => {
          if (isMounted.current) setPhase({ kind: 'result', percent, saveState: 'saved' });
        })
        .catch(() => {
          if (isMounted.current) setPhase({ kind: 'result', percent, saveState: 'failed' });
        });
    },
    [saveSpO2Check, stopAll],
  );

  const start = useCallback(() => {
    stopAll(); // only one stream at a time
    readings.current = [];
    const startedAt = Date.now();
    setPhase({ kind: 'measuring', elapsedMs: 0 });
    try {
      stopStream.current = startRealtime(
        'spo2',
        (reading) => readings.current.push(reading.value),
        () => {
          stopAll();
          if (isMounted.current) setPhase({ kind: 'failed' });
        },
      );
    } catch {
      setPhase({ kind: 'failed' });
      return;
    }
    timer.current = setInterval(() => {
      if (!isMounted.current) return;
      const elapsedMs = Date.now() - startedAt;
      const outcome = spo2Outcome(readings.current, elapsedMs);
      if (outcome.kind === 'result') finish(outcome.percent);
      else if (outcome.kind === 'failed') {
        stopAll();
        setPhase({ kind: 'failed' });
      } else setPhase({ kind: 'measuring', elapsedMs });
    }, LIVE.tickMs);
  }, [finish, stopAll]);

  // Leaving SpO2 mode stops the check and resets it.
  useEffect(() => {
    if (!enabled) cancel();
  }, [enabled, cancel]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      stopAll();
    };
  }, [stopAll]);

  useStopOnBackground(() => {
    if (stopStream.current !== null) cancel();
  });

  return { phase, start, cancel };
}
