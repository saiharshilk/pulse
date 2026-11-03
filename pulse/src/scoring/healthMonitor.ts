import type { HealthMonitorStatus } from '@/types/computed';
import type { SpO2SpotCheck } from '@/types/raw';

import { calculateBaseline, type NightVitals } from './baselineCalculator';
import { HEALTH_MONITOR } from './scoringConstants';

export type HealthMonitorInput = {
  lastNight: NightVitals | null;
  priorNights: NightVitals[]; // trailing 30 days before lastNight
  lastSpO2: SpO2SpotCheck | null;
};

// A personal normal range: the 30-day mean ± 1.5 SD.
export type NormalRange = { low: number; high: number };

export type HealthMonitorRanges = { restingHR: NormalRange; sleepingHR: NormalRange };

export function normalRange(mean: number, sd: number): NormalRange {
  return { low: mean - HEALTH_MONITOR.rangeSd * sd, high: mean + HEALTH_MONITOR.rangeSd * sd };
}

export function isWithinRange(value: number, range: NormalRange): boolean {
  return value >= range.low && value <= range.high;
}

// Both normal ranges, or null while calibrating (fewer than 4 earlier nights).
export function healthMonitorRanges(priorNights: NightVitals[]): HealthMonitorRanges | null {
  const baseline = calculateBaseline(priorNights);
  if (baseline === null || priorNights.length < HEALTH_MONITOR.minNights) return null;
  return {
    restingHR: normalRange(baseline.restingHRMean, baseline.restingHRSd),
    sleepingHR: normalRange(baseline.sleepingHRMean, baseline.sleepingHRSd),
  };
}

// SpO2 is shown but never counted here: it's a spot check, not measured every night.
export function calculateHealthMonitor({ lastNight, priorNights, lastSpO2 }: HealthMonitorInput): HealthMonitorStatus {
  const restingHR = lastNight === null ? null : lastNight.restingHR;
  const averageSleepingHR = lastNight === null ? null : lastNight.averageSleepingHR;
  const ranges = healthMonitorRanges(priorNights);

  if (lastNight === null || ranges === null) {
    return { state: { kind: 'calibrating' }, restingHR, averageSleepingHR, lastSpO2 };
  }

  const checks = [
    isWithinRange(lastNight.restingHR, ranges.restingHR),
    isWithinRange(lastNight.averageSleepingHR, ranges.sleepingHR),
  ];
  const count = checks.filter((inRange) => !inRange).length;
  return {
    state: count === 0 ? { kind: 'withinRange' } : { kind: 'outOfRange', count },
    restingHR,
    averageSleepingHR,
    lastSpO2,
  };
}
