// Estimates sleep (asleep vs. awake only, no stages) from heart rate and zero-step periods.
import type { SleepEstimate } from '@/types/computed';
import type { HeartRateSample, StepSample } from '@/types/raw';
import { clockDiffMinutes, MS_PER_HOUR, MS_PER_MINUTE, minuteOfDay } from '@/utils/time';

import { EPOCH_MINUTES, SLEEP } from './scoringConstants';
import { refineBedtime, refineWakeTime } from './sleepEdges';

const EPOCH_MS = EPOCH_MINUTES * MS_PER_MINUTE;

// The part of a sleep estimate that depends only on that night's raw data.
export type SleepSession = Pick<
  SleepEstimate,
  | 'bedtime'
  | 'wakeTime'
  | 'timeInBedMs'
  | 'timeAsleepMs'
  | 'awakeIntervals'
  | 'efficiency'
  | 'restingHR'
  | 'averageSleepingHR'
>;

export type SleepSessionInput = {
  heartRates: HeartRateSample[]; // sorted, inside the window
  steps: StepSample[]; // sorted, inside the window
  windowStart: number;
  windowEnd: number;
};

type Epoch = { steps: number; hr: number | null };

function buildEpochs({ heartRates, steps, windowStart, windowEnd }: SleepSessionInput): Epoch[] {
  const count = Math.floor((windowEnd - windowStart) / EPOCH_MS);
  const stepTotals = new Array<number>(count).fill(0);
  const hrSums = new Array<number>(count).fill(0);
  const hrCounts = new Array<number>(count).fill(0);

  for (const bucket of steps) {
    const index = Math.floor((bucket.start - windowStart) / EPOCH_MS);
    if (index >= 0 && index < count) stepTotals[index] += bucket.steps;
  }
  for (const sample of heartRates) {
    const index = Math.floor((sample.ts - windowStart) / EPOCH_MS);
    if (sample.bpm !== 0 && index >= 0 && index < count) {
      hrSums[index] += sample.bpm;
      hrCounts[index] += 1;
    }
  }
  return stepTotals.map((stepTotal, i) => ({
    steps: stepTotal,
    hr: hrCounts[i] === 0 ? null : hrSums[i] / hrCounts[i],
  }));
}

function percentile(values: number[], fraction: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor((sorted.length - 1) * fraction)];
}

// The highest heart rate that still looks asleep tonight, or null with no readings.
function asleepThreshold(epochs: Epoch[]): number | null {
  const known = epochs.flatMap((epoch) => (epoch.hr === null ? [] : [epoch.hr]));
  if (known.length === 0) return null;
  return percentile(known, SLEEP.nightLowPercentile) + SLEEP.asleepHrMargin;
}

function findAsleepLikeEpochs(epochs: Epoch[], threshold: number): boolean[] {
  const looksAsleep = epochs.map((e) => e.hr !== null && e.steps === 0 && e.hr <= threshold);
  // Missing heart rate counts as asleep only when both neighbors look asleep.
  return epochs.map((epoch, i) => {
    if (epoch.hr !== null) return looksAsleep[i];
    return epoch.steps === 0 && looksAsleep[i - 1] === true && looksAsleep[i + 1] === true;
  });
}

type EpochRun = { first: number; last: number; gaps: { first: number; last: number }[] };

// The longest run of asleep-like epochs, bridging gaps of up to SLEEP.maxGapEpochs.
function findLongestRun(asleep: boolean[]): EpochRun | null {
  let best: EpochRun | null = null;
  let current: EpochRun | null = null;

  for (let i = 0; i < asleep.length; i++) {
    if (!asleep[i]) continue;
    if (current !== null && i - current.last - 1 <= SLEEP.maxGapEpochs) {
      if (i - current.last > 1) current.gaps.push({ first: current.last + 1, last: i - 1 });
      current.last = i;
    } else {
      current = { first: i, last: i, gaps: [] };
    }
    if (best === null || current.last - current.first > best.last - best.first) {
      best = { first: current.first, last: current.last, gaps: [...current.gaps] };
    }
  }
  return best;
}

function lowestRollingAverage(values: number[], windowSize: number): number {
  if (values.length < windowSize) return values.reduce((a, b) => a + b, 0) / values.length;
  let sum = values.slice(0, windowSize).reduce((a, b) => a + b, 0);
  let lowest = sum;
  for (let i = windowSize; i < values.length; i++) {
    sum += values[i] - values[i - windowSize];
    lowest = Math.min(lowest, sum);
  }
  return lowest / windowSize;
}

// Steps 1–6 of the estimate, with both edges refined past the 15-minute epochs. Returns null when no sleep of at least 3 hours is found.
export function detectSleepSession(input: SleepSessionInput): SleepSession | null {
  const epochs = buildEpochs(input);
  const threshold = asleepThreshold(epochs);
  if (threshold === null) return null;
  const run = findLongestRun(findAsleepLikeEpochs(epochs, threshold));
  if (run === null) return null;

  const { windowStart } = input;
  const roughBedtime = windowStart + run.first * EPOCH_MS;
  const roughWakeTime = windowStart + (run.last + 1) * EPOCH_MS;
  if (roughWakeTime - roughBedtime < SLEEP.minSessionHours * MS_PER_HOUR) return null;

  const known = input.heartRates.filter((sample) => sample.bpm !== 0);
  const bedtime = refineBedtime(known, input.steps, roughBedtime, threshold);
  const wakeTime = refineWakeTime(known, input.steps, roughWakeTime, threshold);
  const timeInBedMs = wakeTime - bedtime;

  const bpms = known.filter((sample) => sample.ts >= bedtime && sample.ts < wakeTime).map((sample) => sample.bpm);
  if (bpms.length === 0) return null;

  const awakeIntervals = run.gaps.map((gap) => ({
    start: windowStart + gap.first * EPOCH_MS,
    end: windowStart + (gap.last + 1) * EPOCH_MS,
  }));
  const awakeMs = awakeIntervals.reduce((total, gap) => total + gap.end - gap.start, 0);
  const timeAsleepMs = timeInBedMs - awakeMs;

  return {
    bedtime,
    wakeTime,
    timeInBedMs,
    timeAsleepMs,
    awakeIntervals,
    efficiency: (timeAsleepMs / timeInBedMs) * 100,
    restingHR: lowestRollingAverage(bpms, SLEEP.restingWindowSamples),
    averageSleepingHR: bpms.reduce((a, b) => a + b, 0) / bpms.length,
  };
}

export type PriorNight = { bedtime: number; wakeTime: number; timeAsleepMs: number; sleepNeededMs: number };

export type SleepContext = {
  baselineHours: number;
  previousDayStrain: number | null;
  // Nights before this one, oldest → newest. Null marks a day with no detected sleep.
  priorDays: (PriorNight | null)[];
};

export function calculateSleepNeed(context: SleepContext): SleepEstimate['needBreakdown'] {
  const baselineMs = context.baselineHours * MS_PER_HOUR;
  const extraStrain = Math.max(0, (context.previousDayStrain ?? 0) - SLEEP.strainThreshold);
  const strainMs =
    Math.min(SLEEP.strainCapMinutes, extraStrain * SLEEP.strainMinutesPerPoint) * MS_PER_MINUTE;
  const shortfallMs = context.priorDays
    .slice(-SLEEP.debtLookbackNights)
    .reduce(
      (total, night) => total + (night === null ? 0 : Math.max(0, night.sleepNeededMs - night.timeAsleepMs)),
      0,
    );
  const debtMs = Math.min(SLEEP.debtCapMinutes * MS_PER_MINUTE, SLEEP.debtFraction * shortfallMs);
  return { baselineMs, strainMs, debtMs };
}

// Compares tonight's clock times to the previous few nights. Null until there are enough nights.
export function calculateConsistency(session: SleepSession, priorDays: (PriorNight | null)[]): number | null {
  const nights = priorDays.filter((night) => night !== null).slice(-SLEEP.consistencyNights);
  if (nights.length < SLEEP.consistencyNights) return null;
  const bedtime = minuteOfDay(session.bedtime);
  const wake = minuteOfDay(session.wakeTime);
  const totalDiff = nights.reduce(
    (total, night) =>
      total +
      clockDiffMinutes(bedtime, minuteOfDay(night.bedtime)) +
      clockDiffMinutes(wake, minuteOfDay(night.wakeTime)),
    0,
  );
  const meanDiffMinutes = totalDiff / (nights.length * 2);
  return Math.max(0, Math.round(100 - meanDiffMinutes));
}

// Steps 7–9: adds sleep need, performance and consistency to a session.
export function buildSleepEstimate(session: SleepSession, context: SleepContext): SleepEstimate {
  const needBreakdown = calculateSleepNeed(context);
  const sleepNeededMs = needBreakdown.baselineMs + needBreakdown.strainMs + needBreakdown.debtMs;
  return {
    ...session,
    sleepNeededMs,
    needBreakdown,
    performance: Math.min(100, Math.round((session.timeAsleepMs / sleepNeededMs) * 100)),
    consistency: calculateConsistency(session, context.priorDays),
  };
}
