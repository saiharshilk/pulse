// Turns raw samples into one DailySummary per day. Pure: "now" is passed in, nothing is read or saved.
import type { DailySummary } from '@/types/computed';
import type { UserProfile } from '@/types/profile';
import type { HeartRateSample, SpO2SpotCheck, StepSample } from '@/types/raw';
import { addDaysTs, dayKeyOf, localTimeOn, startOfDayTs } from '@/utils/time';

import { detectActivities } from './activityDetector';
import type { NightVitals } from './baselineCalculator';
import { calculateCalories } from './calorieCalculator';
import { calculateHealthMonitor } from './healthMonitor';
import { maxHeartRate, sliceByTime } from './heartRateSeries';
import { calculateRecovery } from './recoveryCalculator';
import { RECOVERY, SLEEP, STRAIN } from './scoringConstants';
import { buildSleepEstimate, detectSleepSession, type PriorNight, type SleepSession } from './sleepEstimator';
import { calculateStrain } from './strainCalculator';

export type ComputeSummariesInput = {
  heartRates: HeartRateSample[];
  steps: StepSample[];
  spo2Checks: SpO2SpotCheck[];
  profile: UserProfile;
  now: number;
};

const heartRateTs = (sample: HeartRateSample) => sample.ts;
const stepStart = (bucket: StepSample) => bucket.start;

function listDays(firstTs: number, now: number): number[] {
  const days: number[] = [];
  const lastDay = startOfDayTs(now);
  for (let day = startOfDayTs(firstTs); day <= lastDay; day = addDaysTs(day, 1)) days.push(day);
  return days;
}

// The nights before day `index`, within the trailing baseline period.
function trailingVitals(sessions: (SleepSession | null)[], index: number): NightVitals[] {
  const start = Math.max(0, index - RECOVERY.baselineDays);
  return sessions.slice(start, index).filter((session) => session !== null);
}

// Strain runs from waking up until the next sleep starts (or until now, for today).
function strainWindow(
  dayStart: number,
  session: SleepSession | null,
  nextSession: SleepSession | null,
  now: number,
): { start: number; end: number } {
  if (session === null) {
    const start = localTimeOn(dayStart, 0, STRAIN.noSleepStartHour);
    const end = localTimeOn(dayStart, 0, STRAIN.noSleepEndHour, STRAIN.noSleepEndMinute);
    return { start, end: Math.max(start, Math.min(end, now)) };
  }
  const end = nextSession === null ? Math.min(now, addDaysTs(dayStart, 1)) : nextSession.bedtime;
  return { start: session.wakeTime, end: Math.max(session.wakeTime, end) };
}

export function computeSummaries(input: ComputeSummariesInput): DailySummary[] {
  const { profile, now } = input;
  const heartRates = [...input.heartRates].sort((a, b) => a.ts - b.ts);
  const steps = [...input.steps].sort((a, b) => a.start - b.start);
  const spo2Checks = [...input.spo2Checks].sort((a, b) => a.ts - b.ts);

  const firstHeartRate = heartRates[0];
  const firstStep = steps[0];
  if (firstHeartRate === undefined && firstStep === undefined) return [];
  const firstTs = Math.min(firstHeartRate?.ts ?? Infinity, firstStep?.start ?? Infinity);

  const days = listDays(firstTs, now);
  const maxHR = maxHeartRate(profile);

  // First pass: each night's raw session. Strain needs the next night's bedtime,
  // and sleep need needs the previous day's strain, so sessions must come first.
  const sessions = days.map((dayStart) => {
    const windowStart = localTimeOn(dayStart, -1, SLEEP.windowStartHour);
    const windowEnd = Math.min(now, localTimeOn(dayStart, 0, SLEEP.windowEndHour));
    return detectSleepSession({
      heartRates: sliceByTime(heartRates, heartRateTs, windowStart, windowEnd),
      steps: sliceByTime(steps, stepStart, windowStart, windowEnd),
      windowStart,
      windowEnd,
    });
  });

  const summaries: DailySummary[] = [];
  const priorDays: (PriorNight | null)[] = [];
  let latestRestingHR: number = STRAIN.defaultRestingHR;
  let latestNightIndex = -1;

  days.forEach((dayStart, index) => {
    const dayEnd = addDaysTs(dayStart, 1);
    const session = sessions[index];
    if (session !== null) {
      latestRestingHR = session.restingHR;
      latestNightIndex = index;
    }

    const previousSummary = summaries.at(-1);
    const sleep =
      session === null
        ? null
        : buildSleepEstimate(session, {
            baselineHours: profile.sleepNeedBaselineHours,
            previousDayStrain: previousSummary === undefined ? null : previousSummary.strain.score,
            priorDays,
          });
    priorDays.push(sleep);

    const recovery =
      sleep === null
        ? null
        : calculateRecovery({
            restingHR: sleep.restingHR,
            averageSleepingHR: sleep.averageSleepingHR,
            sleepPerformance: sleep.performance,
            priorNights: trailingVitals(sessions, index),
          });

    const daySteps = sliceByTime(steps, stepStart, dayStart, dayEnd);
    const calories = calculateCalories(profile, daySteps, dayStart, now);
    const window = strainWindow(dayStart, session, sessions[index + 1] ?? null, now);
    const windowHeartRates = sliceByTime(heartRates, heartRateTs, window.start, window.end);
    const dayHeartRates = sliceByTime(heartRates, heartRateTs, dayStart, Math.min(dayEnd, now + 1));
    const dayChecks = sliceByTime(spo2Checks, (check) => check.ts, 0, Math.min(dayEnd, now + 1));

    // TODO(spec): if no sleep was detected today, Health Monitor uses the most recent night instead.
    const lastNight = latestNightIndex >= 0 ? sessions[latestNightIndex] : null;

    summaries.push({
      dayKey: dayKeyOf(dayStart),
      dayStart,
      sleep,
      recovery,
      strain: calculateStrain({
        heartRates: windowHeartRates,
        window,
        restingHR: latestRestingHR,
        maxHR,
        calories,
      }),
      steps: daySteps.reduce((total, bucket) => total + bucket.steps, 0),
      calories,
      activities: detectActivities({ heartRates: windowHeartRates, window, restingHR: latestRestingHR, maxHR }),
      healthMonitor: calculateHealthMonitor({
        lastNight,
        priorNights: latestNightIndex >= 0 ? trailingVitals(sessions, latestNightIndex) : [],
        lastSpO2: dayChecks.at(-1) ?? null,
      }),
      latestHeartRate: dayHeartRates.at(-1) ?? null,
    });
  });

  return summaries;
}
