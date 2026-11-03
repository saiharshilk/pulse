// Pure helpers for the Live screen. No React or timers here, so they're easy to test.
import { heartRateReserve, zoneIndex } from '@/scoring/heartRateSeries';
import { MS_PER_MINUTE } from '@/utils/time';

export const LIVE = {
  chartWindowMs: MS_PER_MINUTE, // the live chart shows the last 60 seconds
  spo2MeasureMs: 30_000, // how long a spot check collects readings
  spo2TimeoutMs: 40_000, // give up if nothing valid has arrived by now
  spo2Min: 70, // readings outside 70–100 are noise
  spo2Max: 100,
  tickMs: 250, // how often the countdown updates
} as const;

export type SessionStats = { min: number; max: number; sum: number; count: number };

export const EMPTY_STATS: SessionStats = { min: Infinity, max: -Infinity, sum: 0, count: 0 };

export function addToStats(stats: SessionStats, value: number): SessionStats {
  return {
    min: Math.min(stats.min, value),
    max: Math.max(stats.max, value),
    sum: stats.sum + value,
    count: stats.count + 1,
  };
}

export function sessionStats(values: number[]): SessionStats {
  return values.reduce(addToStats, EMPTY_STATS);
}

export function averageOfStats(stats: SessionStats): number | null {
  return stats.count === 0 ? null : stats.sum / stats.count;
}

// The middle value; the mean of the two middle values for an even count.
export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

export function isValidSpO2(percent: number): boolean {
  return percent >= LIVE.spo2Min && percent <= LIVE.spo2Max;
}

export function validSpO2Readings(values: number[]): number[] {
  return values.filter(isValidSpO2);
}

export type SpO2Outcome = { kind: 'measuring' } | { kind: 'result'; percent: number } | { kind: 'failed' };

// What a spot check should do now, given everything received so far.
export function spo2Outcome(readings: number[], elapsedMs: number): SpO2Outcome {
  const valid = validSpO2Readings(readings);
  const middle = median(valid);
  if (elapsedMs >= LIVE.spo2MeasureMs && middle !== null) return { kind: 'result', percent: Math.round(middle) };
  if (elapsedMs >= LIVE.spo2TimeoutMs) return { kind: 'failed' };
  return { kind: 'measuring' };
}

// "Resting" below Zone 1, otherwise "Zone 1"…"Zone 5".
export function liveZoneLabel(bpm: number, restingHR: number, maxHR: number): string {
  const zone = zoneIndex(heartRateReserve(bpm, restingHR, maxHR));
  return zone < 0 ? 'Resting' : `Zone ${zone + 1}`;
}

// Keeps only the readings from the last `windowMs` before `now`.
export function trimToWindow<T extends { ts: number }>(readings: T[], now: number, windowMs: number): T[] {
  return readings.filter((reading) => reading.ts >= now - windowMs);
}
