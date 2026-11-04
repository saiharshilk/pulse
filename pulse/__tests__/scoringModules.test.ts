import { detectActivities } from '@/scoring/activityDetector';
import { calculateBaseline } from '@/scoring/baselineCalculator';
import { basalMetabolicRate, calculateCalories } from '@/scoring/calorieCalculator';
import { calculateRecovery } from '@/scoring/recoveryCalculator';
import { DEFAULT_PROFILE } from '@/types/profile';
import { MS_PER_HOUR, MS_PER_MINUTE } from '@/utils/time';

const PRIOR = [48, 49, 50, 51, 52].map((restingHR) => ({ restingHR, averageSleepingHR: restingHR + 5 }));

describe('recovery bands and trends', () => {
  const score = (restingHR: number, sleepPerformance: number) =>
    calculateRecovery({ restingHR, averageSleepingHR: restingHR + 5, sleepPerformance, priorNights: PRIOR }).score ?? -1;

  it('is green after a low resting heart rate and good sleep', () => {
    expect(score(47, 95)).toBeGreaterThanOrEqual(67);
  });

  it('is yellow around the usual heart rate with okay sleep', () => {
    const value = score(50, 80);
    expect(value).toBeGreaterThanOrEqual(34);
    expect(value).toBeLessThan(67);
  });

  it('is red after a high resting heart rate and poor sleep', () => {
    expect(score(55, 55)).toBeLessThan(34);
  });

  it('reports up, down and flat trends', () => {
    const trend = (restingHR: number) =>
      calculateRecovery({ restingHR, averageSleepingHR: 55, sleepPerformance: 85, priorNights: PRIOR }).restingHRTrend;
    expect(trend(55)).toBe('up');
    expect(trend(46)).toBe('down');
    expect(trend(50)).toBe('flat');
  });
});

describe('baseline calculator', () => {
  it('returns the mean and standard deviation of each heart rate', () => {
    const baseline = calculateBaseline([
      { restingHR: 48, averageSleepingHR: 52 },
      { restingHR: 52, averageSleepingHR: 58 },
    ]);
    expect(baseline).toEqual({ restingHRMean: 50, restingHRSd: 2, sleepingHRMean: 55, sleepingHRSd: 3 });
  });

  it('never lets the SD fall below 1', () => {
    const baseline = calculateBaseline([{ restingHR: 50, averageSleepingHR: 55 }, { restingHR: 50, averageSleepingHR: 55 }]);
    expect(baseline?.restingHRSd).toBe(1);
  });

  it('is null without nights', () => {
    expect(calculateBaseline([])).toBeNull();
  });
});

describe('calories', () => {
  it('uses Mifflin-St Jeor for resting burn', () => {
    // 10 × 75 + 6.25 × 175 − 5 × 30 + 5
    expect(basalMetabolicRate(DEFAULT_PROFILE)).toBeCloseTo(1698.75);
    expect(basalMetabolicRate({ ...DEFAULT_PROFILE, sex: 'female' })).toBeCloseTo(1532.75);
  });

  it('counts only the part of the day so far, plus step calories', () => {
    const dayStart = new Date(2026, 9, 15).getTime();
    const steps = [{ start: dayStart, steps: 1000, calories: 40, distanceMeters: 750 }];
    expect(calculateCalories(DEFAULT_PROFILE, steps, dayStart, dayStart + 12 * MS_PER_HOUR)).toBe(Math.round(1698.75 / 2 + 40));
    expect(calculateCalories(DEFAULT_PROFILE, [], dayStart, dayStart + 30 * MS_PER_HOUR)).toBe(Math.round(1698.75));
  });
});

describe('activity detector', () => {
  const start = new Date(2026, 9, 15, 7).getTime();
  const window = { start, end: start + 6 * MS_PER_HOUR };
  // One reading per minute: 150 bpm during each effort, 70 otherwise.
  function minutes(efforts: [number, number][]) {
    return Array.from({ length: 6 * 60 }, (_, minute) => ({
      ts: start + minute * MS_PER_MINUTE,
      bpm: efforts.some(([from, to]) => minute >= from && minute < to) ? 150 : 70,
    }));
  }
  const detect = (efforts: [number, number][]) =>
    detectActivities({ heartRates: minutes(efforts), window, restingHR: 50, maxHR: 187 });

  it('merges efforts separated by a short pause', () => {
    expect(detect([[60, 75], [77, 95]])).toHaveLength(1);
  });

  it('keeps efforts apart after a longer pause', () => {
    expect(detect([[60, 75], [85, 100]])).toHaveLength(2);
  });

  it('ignores efforts shorter than 10 minutes', () => {
    expect(detect([[60, 68]])).toEqual([]);
    expect(detect([[60, 70]])).toHaveLength(1);
  });
});
