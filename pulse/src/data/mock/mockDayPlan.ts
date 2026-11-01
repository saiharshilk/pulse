// The hidden "true day" behind the mock data: when you really slept, walked and trained.
// Only mockDataGenerator (to shape readings) and mockTruth (for tests) may use this.
// Each plan depends only on the seed and the date, so past days never change as "now" moves.
import { MOCK_ACTIVITY, MOCK_HEART_RATE, MOCK_HISTORY, MOCK_SLEEP } from '@/data/mock/mockConstants';
import { addDaysTs, dayKeyOf, MS_PER_MINUTE } from '@/utils/time';

import { createSeededRandom, deriveSeed, type SeededRandom } from './seededRandom';

export type TimeSpan = { start: number; end: number };

export type NightPlan = {
  bedtime: number;
  wakeTime: number;
  wakeUps: TimeSpan[];
  isShort: boolean;
};

export type Workout = TimeSpan & { targetBpm: number };

export type DaytimePlan = {
  walks: TimeSpan[];
  workout: Workout | null;
  chargingGap: TimeSpan | null;
};

function randomFor(seed: number, dayStart: number, purpose: string): SeededRandom {
  return createSeededRandom(deriveSeed(seed, `${purpose}:${dayKeyOf(dayStart)}`));
}

function atMinute(dayStart: number, minute: number): number {
  return dayStart + minute * MS_PER_MINUTE;
}

// The night that ends on the morning of `dayStart`.
export function planNight(seed: number, dayStart: number): NightPlan {
  const random = randomFor(seed, dayStart, 'night');
  const weekday = new Date(dayStart).getDay(); // 0 = Sunday
  const isLateNight = weekday === 6 || weekday === 0; // started on a Friday or Saturday evening
  const isWeekendMorning = weekday === 6 || weekday === 0;
  const isShort = random.chance(MOCK_SLEEP.shortNightChance);

  let bedtimeMinute: number;
  let wakeMinute: number;
  if (isShort) {
    bedtimeMinute = random.range(MOCK_SLEEP.shortNightBedtime.min, MOCK_SLEEP.shortNightBedtime.max);
    wakeMinute =
      bedtimeMinute + 60 * random.range(MOCK_SLEEP.shortNightHours.min, MOCK_SLEEP.shortNightHours.max);
  } else {
    const bed = isLateNight ? MOCK_SLEEP.lateBedtime : MOCK_SLEEP.weeknightBedtime;
    const wake = isWeekendMorning ? MOCK_SLEEP.weekendWake : MOCK_SLEEP.weekdayWake;
    bedtimeMinute = random.range(bed.min, bed.max);
    wakeMinute = random.range(wake.min, wake.max);
  }

  const wakeUpCount = isShort
    ? random.int(MOCK_SLEEP.shortNightWakeUps.min, MOCK_SLEEP.shortNightWakeUps.max)
    : random.chance(MOCK_SLEEP.normalNightWakeUpChance)
      ? 1
      : 0;

  // Space wake-ups out evenly through the night, with a little jitter.
  const margin = MOCK_SLEEP.wakeUpEdgeMarginMinutes;
  const usable = wakeMinute - bedtimeMinute - 2 * margin;
  const wakeUps: TimeSpan[] = [];
  for (let i = 0; i < wakeUpCount; i++) {
    const slot = usable / wakeUpCount;
    const startMinute = bedtimeMinute + margin + slot * i + random.range(0, slot * MOCK_SLEEP.wakeUpJitterFraction);
    const length = random.range(MOCK_SLEEP.wakeUpMinutes.min, MOCK_SLEEP.wakeUpMinutes.max);
    wakeUps.push({
      start: atMinute(dayStart, startMinute),
      end: atMinute(dayStart, startMinute + length),
    });
  }

  return {
    bedtime: atMinute(dayStart, bedtimeMinute),
    wakeTime: atMinute(dayStart, wakeMinute),
    wakeUps,
    isShort,
  };
}

function planWorkout(random: SeededRandom, dayStart: number, wakeTime: number): Workout | null {
  if (!random.chance(MOCK_ACTIVITY.workoutDayChance)) return null;
  const minutes = random.int(MOCK_ACTIVITY.workoutMinutes.min, MOCK_ACTIVITY.workoutMinutes.max);
  const start = random.chance(MOCK_ACTIVITY.morningWorkoutChance)
    ? wakeTime +
      random.range(
        MOCK_ACTIVITY.morningWorkoutDelayMinutes.min,
        MOCK_ACTIVITY.morningWorkoutDelayMinutes.max,
      ) *
        MS_PER_MINUTE
    : atMinute(
        dayStart,
        random.range(MOCK_ACTIVITY.eveningWorkoutStart.min, MOCK_ACTIVITY.eveningWorkoutStart.max),
      );
  return {
    start,
    end: start + minutes * MS_PER_MINUTE,
    targetBpm: random.range(MOCK_ACTIVITY.workoutTargetBpm.min, MOCK_ACTIVITY.workoutTargetBpm.max),
  };
}

// The waking hours of `dayStart`.
export function planDaytime(seed: number, dayStart: number): DaytimePlan {
  const random = randomFor(seed, dayStart, 'day');
  const { wakeTime } = planNight(seed, dayStart);
  const nextBedtime = planNight(seed, addDaysTs(dayStart, 1)).bedtime;

  const workout = planWorkout(random, dayStart, wakeTime);

  // Share the waking hours out into equal slots and drop one walk into each.
  const walkCount = random.int(MOCK_ACTIVITY.walksPerDay.min, MOCK_ACTIVITY.walksPerDay.max);
  const earliest = wakeTime + MOCK_ACTIVITY.walkEarliestAfterWakeMinutes * MS_PER_MINUTE;
  const latest = nextBedtime - MOCK_ACTIVITY.walkLatestBeforeBedMinutes * MS_PER_MINUTE;
  const slotMs = (latest - earliest) / walkCount;
  const walks: TimeSpan[] = [];
  for (let i = 0; i < walkCount; i++) {
    const minutes = random.range(MOCK_ACTIVITY.walkMinutes.min, MOCK_ACTIVITY.walkMinutes.max);
    const length = minutes * MS_PER_MINUTE;
    const start = earliest + slotMs * i + random.range(0, Math.max(0, slotMs - length));
    walks.push({ start, end: start + length });
  }

  let chargingGap: TimeSpan | null = null;
  if (random.chance(MOCK_HISTORY.chargingDayChance)) {
    const start = atMinute(
      dayStart,
      random.range(MOCK_ACTIVITY.chargingStart.min, MOCK_ACTIVITY.chargingStart.max),
    );
    const minutes = random.range(MOCK_ACTIVITY.chargingMinutes.min, MOCK_ACTIVITY.chargingMinutes.max);
    chargingGap = { start, end: start + minutes * MS_PER_MINUTE };
  }

  return { walks, workout, chargingGap };
}

// How much the night ending on `dayStart` shifts sleeping heart rate, in bpm.
// Hard days and short nights push it up; rest days bring it down.
export function nightHeartRateOffset(seed: number, dayStart: number): number {
  const previousDay = addDaysTs(dayStart, -1);
  const random = randomFor(seed, dayStart, 'night-offset');
  const yesterday = planDaytime(seed, previousDay);
  const { workout } = yesterday;
  const workoutMinutes = workout === null ? 0 : (workout.end - workout.start) / MS_PER_MINUTE;
  const isHighStrain =
    workout !== null &&
    workout.targetBpm >= MOCK_HEART_RATE.highStrainWorkoutBpm &&
    workoutMinutes >= MOCK_HEART_RATE.highStrainWorkoutMinutes;

  if (isHighStrain || planNight(seed, previousDay).isShort) {
    return random.range(MOCK_HEART_RATE.highStrainNightBump.min, MOCK_HEART_RATE.highStrainNightBump.max);
  }
  if (workout === null) {
    return -random.range(MOCK_HEART_RATE.restDayNightDrop.min, MOCK_HEART_RATE.restDayNightDrop.max);
  }
  return 0;
}
