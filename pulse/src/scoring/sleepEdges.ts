// Moves a sleep session's edges off the 15-minute grid, using the 5-minute heart-rate samples.
// Heart rate marks where sleep starts and ends; a busy step bucket rules out sleep in that bucket.
import type { HeartRateSample, StepSample } from '@/types/raw';
import { MS_PER_MINUTE } from '@/utils/time';

import { EPOCH_MINUTES, SLEEP } from './scoringConstants';

const EPOCH_MS = EPOCH_MINUTES * MS_PER_MINUTE;

function isQuietBucket(steps: StepSample[], start: number): boolean {
  const total = steps
    .filter((bucket) => bucket.start >= start && bucket.start < start + EPOCH_MS)
    .reduce((sum, bucket) => sum + bucket.steps, 0);
  return total <= SLEEP.edgeMaxSteps;
}

// The moment heart rate crossed the threshold between an awake and an asleep sample, to the minute.
function crossingTime(awake: HeartRateSample, asleep: HeartRateSample, threshold: number): number {
  const fraction = (awake.bpm - threshold) / (awake.bpm - asleep.bpm);
  const ts = awake.ts + fraction * (asleep.ts - awake.ts);
  return Math.round(ts / MS_PER_MINUTE) * MS_PER_MINUTE;
}

export function refineBedtime(
  samples: HeartRateSample[],
  steps: StepSample[],
  bedtime: number,
  threshold: number,
): number {
  const earliest = isQuietBucket(steps, bedtime - EPOCH_MS) ? bedtime - EPOCH_MS : bedtime;
  const latest = bedtime + EPOCH_MS;

  // Start from the last sample near the edge and walk back while it still looks asleep.
  let index = samples.length - 1;
  while (index >= 0 && samples[index].ts >= latest) index--;
  if (index < 0 || samples[index].ts < earliest || samples[index].bpm > threshold) return bedtime;
  while (index > 0 && samples[index - 1].ts >= earliest && samples[index - 1].bpm <= threshold) index--;

  const asleep = samples[index];
  const awake = samples[index - 1];
  if (awake === undefined || awake.bpm <= threshold || asleep.ts - awake.ts > EPOCH_MS) return asleep.ts;
  return crossingTime(awake, asleep, threshold);
}

export function refineWakeTime(
  samples: HeartRateSample[],
  steps: StepSample[],
  wakeTime: number,
  threshold: number,
): number {
  const earliest = wakeTime - EPOCH_MS;
  const latest = isQuietBucket(steps, wakeTime) ? wakeTime + EPOCH_MS : wakeTime;

  // Start from the first sample near the edge and walk forward while it still looks asleep.
  let index = samples.findIndex((sample) => sample.ts >= earliest);
  if (index < 0 || samples[index].ts >= latest || samples[index].bpm > threshold) return wakeTime;
  while (index < samples.length - 1 && samples[index + 1].ts < latest && samples[index + 1].bpm <= threshold) index++;

  const asleep = samples[index];
  const awake = samples[index + 1];
  if (awake === undefined || awake.bpm <= threshold || awake.ts - asleep.ts > EPOCH_MS) return asleep.ts;
  return crossingTime(awake, asleep, threshold);
}
