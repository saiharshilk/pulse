// Turns each hidden day plan into what the ring would actually log: heart rate and steps only.
import { MOCK_ACTIVITY, MOCK_HEART_RATE, MOCK_HISTORY } from '@/data/mock/mockConstants';
import type { HeartRateReading, RingSyncBatch, StepReading } from '@/types/provider';
import { addDaysTs, dayKeyOf, MS_PER_MINUTE, startOfDayTs } from '@/utils/time';

import {
  nightHeartRateOffset,
  planDaytime,
  planNight,
  type DaytimePlan,
  type NightPlan,
  type TimeSpan,
} from './mockDayPlan';
import { createSeededRandom, deriveSeed, type SeededRandom } from './seededRandom';

export type MockHistoryOptions = { seed: number; now: number; days?: number };

type DayContext = {
  dayStart: number;
  morningNight: NightPlan; // ends this morning
  eveningNight: NightPlan; // starts tonight
  morningLow: number;
  eveningLow: number;
  daytime: DaytimePlan;
};

function overlaps(start: number, end: number, span: TimeSpan): boolean {
  return start < span.end && end > span.start;
}

function contains(ts: number, span: TimeSpan): boolean {
  return ts >= span.start && ts < span.end;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function isAsleep(ts: number, night: NightPlan): boolean {
  return ts >= night.bedtime && ts < night.wakeTime && !night.wakeUps.some((w) => contains(ts, w));
}

function sleepingBpm(ts: number, night: NightPlan, low: number, random: SeededRandom): number {
  // U-shape: the curve is 1 at both ends of the night and 0 in the middle, so mid-night is lowest.
  const progress = (ts - night.bedtime) / (night.wakeTime - night.bedtime);
  const curve = Math.pow(2 * progress - 1, 2);
  return low + MOCK_HEART_RATE.sleepCurveAmplitude * curve + random.normal(0, MOCK_HEART_RATE.sleepNoiseSd);
}

function workoutBpm(ts: number, workout: DaytimePlan['workout'] & object, random: SeededRandom): number {
  const { rampMinutes, restCenter, workoutSpreadSd, workout: limits } = MOCK_HEART_RATE;
  const rampMs = rampMinutes * MS_PER_MINUTE;
  const edge = Math.min(ts - workout.start, workout.end - ts);
  const effort = clamp(edge / rampMs, 0, 1); // warm-up and cool-down ramps
  if (effort < 1) return restCenter + (workout.targetBpm - restCenter) * effort;
  return clamp(random.normal(workout.targetBpm, workoutSpreadSd), limits.min, limits.max);
}

function heartRateAt(ts: number, day: DayContext, random: SeededRandom): number {
  const { morningNight, eveningNight, daytime } = day;
  if (daytime.chargingGap !== null && contains(ts, daytime.chargingGap)) return 0;
  if (random.chance(MOCK_HISTORY.missingReadingChance)) return 0;

  if (isAsleep(ts, morningNight)) return sleepingBpm(ts, morningNight, day.morningLow, random);
  if (isAsleep(ts, eveningNight)) return sleepingBpm(ts, eveningNight, day.eveningLow, random);
  if (morningNight.wakeUps.some((w) => contains(ts, w)) || eveningNight.wakeUps.some((w) => contains(ts, w))) {
    return random.range(MOCK_HEART_RATE.wakeUpBump.min, MOCK_HEART_RATE.wakeUpBump.max);
  }
  if (daytime.workout !== null && contains(ts, daytime.workout)) {
    return workoutBpm(ts, daytime.workout, random);
  }
  if (daytime.walks.some((walk) => contains(ts, walk))) {
    return random.range(MOCK_HEART_RATE.walk.min, MOCK_HEART_RATE.walk.max);
  }
  // Resting: a slow swing over the day plus a little noise.
  const swing = Math.sin(((ts - day.dayStart) / (24 * 60 * MS_PER_MINUTE)) * 2 * Math.PI * 2);
  const bpm =
    MOCK_HEART_RATE.restCenter +
    MOCK_HEART_RATE.restDrift * swing +
    random.normal(0, MOCK_HEART_RATE.restNoiseSd);
  return clamp(bpm, MOCK_HEART_RATE.rest.min, MOCK_HEART_RATE.rest.max);
}

// Minutes of `span` inside the bucket.
function overlapMinutes(start: number, end: number, span: TimeSpan): number {
  return Math.max(0, Math.min(end, span.end) - Math.max(start, span.start)) / MS_PER_MINUTE;
}

function stepsInBucket(start: number, end: number, day: DayContext, random: SeededRandom): number {
  const { morningNight, eveningNight, daytime } = day;
  if (daytime.chargingGap !== null && overlaps(start, end, daytime.chargingGap)) return 0;

  const nights = [morningNight, eveningNight];
  const inWakeUp = nights.some((night) => night.wakeUps.some((w) => overlaps(start, end, w)));
  const fullyAsleep = nights.some((night) => start >= night.bedtime && end <= night.wakeTime);
  if (fullyAsleep) {
    return inWakeUp
      ? random.int(MOCK_ACTIVITY.wakeUpStepsPerBucket.min, MOCK_ACTIVITY.wakeUpStepsPerBucket.max)
      : 0;
  }

  let steps = random.int(MOCK_ACTIVITY.deskStepsPerBucket.min, MOCK_ACTIVITY.deskStepsPerBucket.max);
  for (const walk of daytime.walks) {
    const perMinute = random.range(MOCK_ACTIVITY.walkStepsPerMinute.min, MOCK_ACTIVITY.walkStepsPerMinute.max);
    steps += overlapMinutes(start, end, walk) * perMinute;
  }
  if (daytime.workout !== null) {
    const perMinute = random.range(MOCK_ACTIVITY.workoutStepsPerMinute.min, MOCK_ACTIVITY.workoutStepsPerMinute.max);
    steps += overlapMinutes(start, end, daytime.workout) * perMinute;
  }
  return Math.round(steps);
}

function buildDayContext(seed: number, dayStart: number): DayContext {
  const tomorrow = addDaysTs(dayStart, 1);
  const lowRandom = createSeededRandom(deriveSeed(seed, `low:${dayKeyOf(dayStart)}`));
  const lowTomorrow = createSeededRandom(deriveSeed(seed, `low:${dayKeyOf(tomorrow)}`));
  const { sleepLow, sleepLowNightlySd } = MOCK_HEART_RATE;
  return {
    dayStart,
    morningNight: planNight(seed, dayStart),
    eveningNight: planNight(seed, tomorrow),
    morningLow: lowRandom.normal(sleepLow, sleepLowNightlySd) + nightHeartRateOffset(seed, dayStart),
    eveningLow: lowTomorrow.normal(sleepLow, sleepLowNightlySd) + nightHeartRateOffset(seed, tomorrow),
    daytime: planDaytime(seed, dayStart),
  };
}

// Readings for one whole calendar day. Cutting off at "now" happens afterwards,
// so the morning of a day looks the same however late in the day you ask.
function generateDay(seed: number, dayStart: number): RingSyncBatch {
  const random = createSeededRandom(deriveSeed(seed, `readings:${dayKeyOf(dayStart)}`));
  const day = buildDayContext(seed, dayStart);
  const dayEnd = addDaysTs(dayStart, 1);

  const heartRates: HeartRateReading[] = [];
  const heartRateStep = MOCK_HISTORY.heartRateIntervalMinutes * MS_PER_MINUTE;
  for (let ts = dayStart; ts < dayEnd; ts += heartRateStep) {
    heartRates.push({ ts, bpm: Math.round(heartRateAt(ts, day, random)) });
  }

  const bucketMs = MOCK_HISTORY.stepBucketMinutes * MS_PER_MINUTE;
  const rawSteps: { start: number; steps: number }[] = [];
  let total = 0;
  for (let start = dayStart; start < dayEnd; start += bucketMs) {
    const steps = stepsInBucket(start, start + bucketMs, day, random);
    rawSteps.push({ start, steps });
    total += steps;
  }

  // Busy days are scaled down so the daily total stays realistic.
  const scale = total > MOCK_HISTORY.maxDailySteps ? MOCK_HISTORY.maxDailySteps / total : 1;
  const steps: StepReading[] = rawSteps.map((bucket) => {
    const count = Math.floor(bucket.steps * scale); // floor, so the total can't round past the cap
    return {
      start: bucket.start,
      steps: count,
      calories: count * MOCK_HISTORY.caloriesPerStep, // TODO(ring): verify units with the real ring.
      distanceMeters: count * MOCK_HISTORY.metersPerStep,
    };
  });

  return { heartRates, steps };
}

export function generateMockHistory({
  seed,
  now,
  days = MOCK_HISTORY.defaultDays,
}: MockHistoryOptions): RingSyncBatch {
  const today = startOfDayTs(now);
  const bucketMs = MOCK_HISTORY.stepBucketMinutes * MS_PER_MINUTE;
  const cutoff = now - days * 24 * 60 * MS_PER_MINUTE;
  const heartRates: HeartRateReading[] = [];
  const steps: StepReading[] = [];

  for (let offset = -days; offset <= 0; offset++) {
    const generated = generateDay(seed, addDaysTs(today, offset));
    for (const reading of generated.heartRates) {
      if (reading.ts >= cutoff && reading.ts <= now) heartRates.push(reading);
    }
    for (const bucket of generated.steps) {
      // A bucket only appears once its 15 minutes are over.
      if (bucket.start >= cutoff && bucket.start + bucketMs <= now) steps.push(bucket);
    }
  }
  return { heartRates, steps };
}
