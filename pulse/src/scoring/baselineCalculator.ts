import type { RecoveryMetrics } from '@/types/computed';

import { RECOVERY } from './scoringConstants';

export type NightVitals = { restingHR: number; averageSleepingHR: number };
export type Baseline = NonNullable<RecoveryMetrics['baseline']>;

function meanAndSd(values: number[]): { mean: number; sd: number } {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((total, value) => total + (value - mean) ** 2, 0) / values.length;
  return { mean, sd: Math.max(RECOVERY.sdFloor, Math.sqrt(variance)) };
}

// `nights` = the trailing 30 days of nights with sleep, not counting today.
export function calculateBaseline(nights: NightVitals[]): Baseline | null {
  if (nights.length === 0) return null;
  const resting = meanAndSd(nights.map((night) => night.restingHR));
  const sleeping = meanAndSd(nights.map((night) => night.averageSleepingHR));
  return {
    restingHRMean: resting.mean,
    restingHRSd: resting.sd,
    sleepingHRMean: sleeping.mean,
    sleepingHRSd: sleeping.sd,
  };
}
