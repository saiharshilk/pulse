// TEST-ONLY. Reveals the hidden sleep window so tests can grade the sleep estimator.
// App code must never import this: the app has to estimate sleep from heart rate and steps.
import { planNight, type TimeSpan } from './mockDayPlan';

export type MockSleepTruth = TimeSpan & { isShort: boolean };

export function getMockSleepTruth(seed: number, dayStart: number): MockSleepTruth {
  const night = planNight(seed, dayStart);
  return { start: night.bedtime, end: night.wakeTime, isShort: night.isShort };
}
