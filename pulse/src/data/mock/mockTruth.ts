// TEST-ONLY. Reveals the hidden plan so tests can grade the sleep estimator and strain.
// App code must never import this: the app has to estimate sleep from heart rate and steps.
import { planDaytime, planNight, type DayKind, type TimeSpan } from './mockDayPlan';

export type MockSleepTruth = TimeSpan & { isShort: boolean };

export function getMockSleepTruth(seed: number, dayStart: number): MockSleepTruth {
  const night = planNight(seed, dayStart);
  return { start: night.bedtime, end: night.wakeTime, isShort: night.isShort };
}

export type MockDayTruth = { kind: DayKind; hadChargingGap: boolean };

export function getMockDayTruth(seed: number, dayStart: number): MockDayTruth {
  const daytime = planDaytime(seed, dayStart);
  return { kind: daytime.kind, hadChargingGap: daytime.chargingGap !== null };
}
