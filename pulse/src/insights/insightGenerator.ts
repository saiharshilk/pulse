// Friendly one- or two-sentence insights, built from simple rules (no AI).
import { RECOVERY_BANDS, SLEEP_BANDS } from '@/scoring/scoringConstants';
import type { StrainTarget } from '@/scoring/strainTarget';
import type { RecoveryMetrics, SleepEstimate, StrainMetrics } from '@/types/computed';
import { MS_PER_MINUTE } from '@/utils/time';

export const INSIGHT_THRESHOLDS = {
  sleepGood: SLEEP_BANDS.optimal, // performance at or above this is "the sleep you needed"
  sleepPoor: SLEEP_BANDS.sufficient, // below this is "less sleep than your body needed"
  consistencyLow: 60,
  debtMinutes: 30,
  efficiencyLow: 85,
  calibrationNights: 4,
} as const;

export function sleepInsight(sleep: SleepEstimate, previousNights: SleepEstimate[]): string {
  const { sleepGood, sleepPoor, consistencyLow, debtMinutes, efficiencyLow, calibrationNights } = INSIGHT_THRESHOLDS;

  let first: string;
  if (sleep.performance >= sleepGood) first = 'You got the sleep you needed.';
  else if (sleep.performance < sleepPoor) first = 'You got less sleep than your body needed.';
  // TODO(spec): the spec has no sentence for 70–84%, so this one fills the gap.
  else first = 'You got most of the sleep you needed.';

  // At most one extra sentence, the most useful one first.
  const hasHistory = previousNights.length >= calibrationNights;
  let second: string | null = null;
  if (hasHistory && sleep.consistency !== null && sleep.consistency < consistencyLow) {
    second = 'Your bedtime has been inconsistent lately; a steadier schedule should help.';
  } else if (sleep.needBreakdown.debtMs > debtMinutes * MS_PER_MINUTE) {
    second = "You're carrying some sleep debt from recent nights.";
  } else if (sleep.efficiency < efficiencyLow) {
    second = 'You woke up several times during the night.';
  }
  return second === null ? first : `${first} ${second}`;
}

const RESTING_PHRASE = { down: 'below', flat: 'close to', up: 'above' } as const;
const SLEEPING_SENTENCE = {
  up: 'Your heart rate also stayed higher than usual overnight.',
  down: 'Your heart rate also stayed lower than usual overnight.',
  flat: null,
} as const;

export function recoveryInsight(recovery: RecoveryMetrics): string {
  if (recovery.isCalibrating || recovery.score === null) {
    return `PULSE is still learning your baseline. Recovery appears after ${INSIGHT_THRESHOLDS.calibrationNights} nights.`;
  }

  const sleepPhrase =
    recovery.sleepPerformance >= INSIGHT_THRESHOLDS.sleepGood
      ? 'you slept well'
      : recovery.sleepPerformance < INSIGHT_THRESHOLDS.sleepPoor
        ? 'you were short on sleep'
        : 'you slept reasonably';
  let outcome: string;
  if (recovery.score >= RECOVERY_BANDS.green) outcome = "you're well recovered";
  else if (recovery.score >= RECOVERY_BANDS.yellow) outcome = "you're moderately recovered";
  else outcome = 'your body could use some rest today';

  const first = `Your resting heart rate is ${RESTING_PHRASE[recovery.restingHRTrend]} your baseline and ${sleepPhrase}, so ${outcome}.`;
  const second = SLEEPING_SENTENCE[recovery.sleepingHRTrend];
  return second === null ? first : `${first} ${second}`;
}

export function strainInsight(strain: StrainMetrics, target: StrainTarget): string {
  if (strain.score < target.low) return "You're below today's optimal strain. You have room to push.";
  if (strain.score <= target.high) return "You're in your optimal strain range.";
  return "You've gone past today's optimal strain. Prioritize recovery tonight.";
}
