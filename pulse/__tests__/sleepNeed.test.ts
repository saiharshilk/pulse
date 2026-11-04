import { MOCK_SEED } from '@/config/appConfig';
import { generateMockHistory } from '@/data/mock/mockDataGenerator';
import { dropMissingHeartRates } from '@/data/syncFilters';
import { computeSummaries } from '@/scoring/scoringEngine';
import { calculateSleepNeed, type PriorNight } from '@/scoring/sleepEstimator';
import { DEFAULT_PROFILE } from '@/types/profile';
import { MS_PER_HOUR, MS_PER_MINUTE } from '@/utils/time';

function night(asleepHours: number, debtMs = 0): PriorNight & { needBreakdown: { debtMs: number } } {
  return {
    bedtime: 0,
    wakeTime: 0,
    timeAsleepMs: asleepHours * MS_PER_HOUR,
    needBreakdown: { baselineMs: 8 * MS_PER_HOUR, strainMs: 0, debtMs },
  };
}

describe('calculateSleepNeed', () => {
  it('only adds strain time above 12, capped at 30 minutes', () => {
    const need = (strain: number) => calculateSleepNeed({ baselineHours: 8, previousDayStrain: strain, priorDays: [] }).strainMs;
    expect(need(11)).toBe(0);
    expect(need(14)).toBe(6 * MS_PER_MINUTE);
    expect(need(21)).toBe(27 * MS_PER_MINUTE);
    expect(calculateSleepNeed({ baselineHours: 8, previousDayStrain: 30, priorDays: [] }).strainMs).toBe(30 * MS_PER_MINUTE);
  });

  it("doesn't count earlier debt when measuring shortfalls", () => {
    // Each night slept 7 h against a need of 8 h. Their own large debt must not grow tonight's.
    const withDebt = calculateSleepNeed({ baselineHours: 8, previousDayStrain: null, priorDays: [night(7, 60 * MS_PER_MINUTE), night(7, 60 * MS_PER_MINUTE)] });
    const withoutDebt = calculateSleepNeed({ baselineHours: 8, previousDayStrain: null, priorDays: [night(7), night(7)] });
    expect(withDebt.debtMs).toBe(withoutDebt.debtMs);
  });

  it('caps debt at 60 minutes', () => {
    const debt = calculateSleepNeed({ baselineHours: 8, previousDayStrain: null, priorDays: [night(2), night(2), night(2)] }).debtMs;
    expect(debt).toBe(60 * MS_PER_MINUTE);
  });
});

describe('sleep need with the mock data', () => {
  const now = new Date(2026, 10, 3, 18).getTime();
  const history = generateMockHistory({ seed: MOCK_SEED, now, days: 60 });
  const summaries = computeSummaries({
    heartRates: dropMissingHeartRates(history.heartRates),
    steps: history.steps,
    spo2Checks: [],
    profile: DEFAULT_PROFILE,
    now,
  });
  const needMinutes = summaries.flatMap((day) => (day.sleep === null ? [] : [day.sleep.sleepNeededMs / MS_PER_MINUTE]));

  it('is mostly between 8:00 and 9:00', () => {
    const inRange = needMinutes.filter((minutes) => minutes >= 480 && minutes <= 540);
    expect(inRange.length / needMinutes.length).toBeGreaterThan(0.85);
    expect(Math.min(...needMinutes)).toBeGreaterThanOrEqual(480);
  });

  it('averages roughly 8:15–8:30', () => {
    const average = needMinutes.reduce((a, b) => a + b, 0) / needMinutes.length;
    expect(average).toBeGreaterThanOrEqual(8 * 60 + 10);
    expect(average).toBeLessThanOrEqual(8 * 60 + 35);
  });
});
