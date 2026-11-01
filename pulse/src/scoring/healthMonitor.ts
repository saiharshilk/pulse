import type { HealthMonitorStatus } from '@/types/computed';
import type { SpO2SpotCheck } from '@/types/raw';

import { calculateBaseline, type NightVitals } from './baselineCalculator';
import { HEALTH_MONITOR } from './scoringConstants';

export type HealthMonitorInput = {
  lastNight: NightVitals | null;
  priorNights: NightVitals[]; // trailing 30 days before lastNight
  lastSpO2: SpO2SpotCheck | null;
};

function isInRange(value: number, mean: number, sd: number): boolean {
  return Math.abs(value - mean) <= HEALTH_MONITOR.rangeSd * sd;
}

export function calculateHealthMonitor({ lastNight, priorNights, lastSpO2 }: HealthMonitorInput): HealthMonitorStatus {
  const restingHR = lastNight === null ? null : lastNight.restingHR;
  const averageSleepingHR = lastNight === null ? null : lastNight.averageSleepingHR;
  const baseline = calculateBaseline(priorNights);

  if (lastNight === null || baseline === null || priorNights.length < HEALTH_MONITOR.minNights) {
    return { state: { kind: 'calibrating' }, restingHR, averageSleepingHR, lastSpO2 };
  }

  const checks = [
    isInRange(lastNight.restingHR, baseline.restingHRMean, baseline.restingHRSd),
    isInRange(lastNight.averageSleepingHR, baseline.sleepingHRMean, baseline.sleepingHRSd),
  ];
  const count = checks.filter((inRange) => !inRange).length;
  return {
    state: count === 0 ? { kind: 'withinRange' } : { kind: 'outOfRange', count },
    restingHR,
    averageSleepingHR,
    lastSpO2,
  };
}
