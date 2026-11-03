import { useCallback, useEffect, useRef, useState } from 'react';

import { startRealtime } from '@/data/deviceManager';
import type { RealtimeReading } from '@/types/provider';

import { addToStats, EMPTY_STATS, LIVE, trimToWindow, type SessionStats } from './liveMath';
import { useStopOnBackground } from './useStopOnBackground';

export type LiveReading = { ts: number; bpm: number };

// Streams live heart rate from the ring while `enabled` is true.
// The stream starts automatically, and always stops on unmount or when the app is backgrounded.
export function useLiveHeartRate(enabled: boolean) {
  const [readings, setReadings] = useState<LiveReading[]>([]); // the last 60 seconds
  const [stats, setStats] = useState<SessionStats>(EMPTY_STATS);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stopStream = useRef<(() => void) | null>(null);
  const isMounted = useRef(true);

  const stop = useCallback(() => {
    stopStream.current?.();
    stopStream.current = null;
    if (isMounted.current) setIsRunning(false);
  }, []);

  const start = useCallback(() => {
    if (stopStream.current !== null) return; // only one stream at a time
    setError(null);
    setReadings([]);
    setStats(EMPTY_STATS);
    setIsRunning(true);
    const onReading = (reading: RealtimeReading) => {
      if (!isMounted.current) return;
      const next = { ts: reading.ts, bpm: reading.value };
      setReadings((previous) => trimToWindow([...previous, next], next.ts, LIVE.chartWindowMs));
      setStats((previous) => addToStats(previous, next.bpm));
    };
    const onError = (streamError: Error) => {
      if (!isMounted.current) return;
      setError(streamError.message);
      stop();
    };
    try {
      stopStream.current = startRealtime('heartRate', onReading, onError);
    } catch (startError) {
      onError(startError instanceof Error ? startError : new Error('Could not start the live stream.'));
    }
  }, [stop]);

  // Start when this mode is shown, stop when it's hidden or the screen closes.
  useEffect(() => {
    if (enabled) start();
    return stop;
  }, [enabled, start, stop]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useStopOnBackground(stop);

  return { readings, latest: readings.at(-1) ?? null, stats, isRunning, error, start, stop };
}
