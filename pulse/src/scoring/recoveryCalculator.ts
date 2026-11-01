import type { RecoveryMetrics, Trend } from '@/types/computed';

import { calculateBaseline, type NightVitals } from './baselineCalculator';
import { RECOVERY } from './scoringConstants';

export type RecoveryInput = {
  restingHR: number;
  averageSleepingHR: number;
  sleepPerformance: number;
  priorNights: NightVitals[]; // the trailing 30 days of nights with sleep, not counting today
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function trendAgainst(value: number, mean: number, sd: number): Trend {
  if (Math.abs(value - mean) <= RECOVERY.trendFlatSd * sd) return 'flat';
  return value > mean ? 'up' : 'down';
}

export function calculateRecovery(input: RecoveryInput): RecoveryMetrics {
  const { restingHR, averageSleepingHR, sleepPerformance, priorNights } = input;
  const shared = { nightsCollected: priorNights.length, restingHR, averageSleepingHR, sleepPerformance };
  const baseline = calculateBaseline(priorNights);

  if (baseline === null || priorNights.length < RECOVERY.minNights) {
    return {
      ...shared,
      score: null,
      isCalibrating: true,
      restingHRTrend: 'flat',
      sleepingHRTrend: 'flat',
      baseline: null,
    };
  }

  // Lower heart rate than usual is good, so the z-scores are flipped.
  const restingZ = clamp(
    -(restingHR - baseline.restingHRMean) / baseline.restingHRSd,
    -RECOVERY.zClip,
    RECOVERY.zClip,
  );
  const sleepingZ = clamp(
    -(averageSleepingHR - baseline.sleepingHRMean) / baseline.sleepingHRSd,
    -RECOVERY.zClip,
    RECOVERY.zClip,
  );
  const sleepTerm = (sleepPerformance - RECOVERY.sleepTermCenter) / RECOVERY.sleepTermScale;
  const raw =
    RECOVERY.restingWeight * restingZ + RECOVERY.sleepingWeight * sleepingZ + RECOVERY.sleepWeight * sleepTerm;
  // An S-curve squeezes any raw value into 0–100.
  const curved = 100 / (1 + Math.exp(-(RECOVERY.curveSlope * raw + RECOVERY.curveShift)));

  return {
    ...shared,
    score: clamp(Math.round(curved), RECOVERY.minScore, RECOVERY.maxScore),
    isCalibrating: false,
    restingHRTrend: trendAgainst(restingHR, baseline.restingHRMean, baseline.restingHRSd),
    sleepingHRTrend: trendAgainst(averageSleepingHR, baseline.sleepingHRMean, baseline.sleepingHRSd),
    baseline,
  };
}
