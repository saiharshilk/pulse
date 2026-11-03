import { generateMockHistory } from '@/data/mock/mockDataGenerator';
import { dropMissingHeartRates } from '@/data/syncFilters';
import { basalMetabolicRate } from '@/scoring/calorieCalculator';
import { computeSummaries } from '@/scoring/scoringEngine';
import { detectSleepSession } from '@/scoring/sleepEstimator';
import { calculateStrain } from '@/scoring/strainCalculator';
import { DEFAULT_PROFILE } from '@/types/profile';
import { addDaysTs, MS_PER_HOUR, MS_PER_MINUTE } from '@/utils/time';

const FIVE_MINUTES = 5 * MS_PER_MINUTE;
const FIFTEEN_MINUTES = 15 * MS_PER_MINUTE;

// America/Chicago in 2026: clocks jump forward on March 8 and back on November 1.
const TRANSITIONS = [
  { name: '23-hour day (March 8)', month: 2, day: 8, hours: 23, key: '2026-03-08' },
  { name: '25-hour day (November 1)', month: 10, day: 1, hours: 25, key: '2026-11-01' },
];

// A night from 23:00 to 07:00 by the clock, with steady awake and asleep heart rates.
function syntheticNight(month: number, day: number) {
  const windowStart = new Date(2026, month, day - 1, 18).getTime();
  const windowEnd = new Date(2026, month, day, 14).getTime();
  const bedtime = new Date(2026, month, day - 1, 23).getTime();
  const wake = new Date(2026, month, day, 7).getTime();
  const heartRates = [];
  const steps = [];
  for (let ts = windowStart; ts < windowEnd; ts += FIVE_MINUTES) {
    heartRates.push({ ts, bpm: ts >= bedtime && ts < wake ? 50 : 70 });
  }
  for (let start = windowStart; start < windowEnd; start += FIFTEEN_MINUTES) {
    steps.push({ start, steps: start >= bedtime && start < wake ? 0 : 30, calories: 0, distanceMeters: 0 });
  }
  return { windowStart, windowEnd, bedtime, wake, heartRates, steps };
}

describe('timezone setup', () => {
  it('runs in America/Chicago', () => {
    expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe('America/Chicago');
  });
});

describe.each(TRANSITIONS)('daylight saving: $name', ({ month, day, hours, key }) => {
  const dayStart = new Date(2026, month, day).getTime();
  const now = new Date(2026, month, day + 3, 12).getTime();
  const history = generateMockHistory({ seed: 11, now, days: 20 });
  const heartRates = dropMissingHeartRates(history.heartRates);
  const summaries = computeSummaries({
    heartRates,
    steps: history.steps,
    spo2Checks: [],
    profile: DEFAULT_PROFILE,
    now,
  });
  const summary = summaries.find((candidate) => candidate.dayKey === key);

  it('really is that long', () => {
    expect(addDaysTs(dayStart, 1) - dayStart).toBe(hours * MS_PER_HOUR);
  });

  it('splits days at local midnight with no repeated or skipped day', () => {
    const keys = summaries.map((candidate) => candidate.dayKey);
    expect(new Set(keys).size).toBe(keys.length);
    summaries.forEach((candidate, index) => {
      const date = new Date(candidate.dayStart);
      expect([date.getHours(), date.getMinutes()]).toEqual([0, 0]);
      const next = summaries[index + 1];
      if (next !== undefined) expect(next.dayStart).toBe(addDaysTs(candidate.dayStart, 1));
    });
    expect(summary?.dayStart).toBe(dayStart);
  });

  it('generates every reading of the day, with no duplicates', () => {
    const dayEnd = addDaysTs(dayStart, 1);
    const raw = history.heartRates.filter((reading) => reading.ts >= dayStart && reading.ts < dayEnd);
    expect(raw).toHaveLength(hours * 12);
    expect(new Set(raw.map((reading) => reading.ts)).size).toBe(raw.length);
    const buckets = history.steps.filter((bucket) => bucket.start >= dayStart && bucket.start < dayEnd);
    expect(buckets).toHaveLength(hours * 4);
    expect(summary?.steps).toBe(buckets.reduce((total, bucket) => total + bucket.steps, 0));
  });

  it('counts one full day of resting calories', () => {
    const dayEnd = addDaysTs(dayStart, 1);
    const stepCalories = history.steps
      .filter((bucket) => bucket.start >= dayStart && bucket.start < dayEnd)
      .reduce((total, bucket) => total + bucket.calories, 0);
    expect(summary?.calories).toBe(Math.round(basalMetabolicRate(DEFAULT_PROFILE) + stepCalories));
  });

  it('estimates sleep at the right clock times and real elapsed length', () => {
    const night = syntheticNight(month, day);
    const session = detectSleepSession(night);
    expect(session).not.toBeNull();
    expect(Math.abs((session?.bedtime ?? 0) - night.bedtime)).toBeLessThanOrEqual(FIVE_MINUTES);
    expect(Math.abs((session?.wakeTime ?? 0) - night.wake)).toBeLessThanOrEqual(FIVE_MINUTES);
    // By the clock this is 8 hours, but really 7 in March and 9 in November.
    const expectedMs = (hours - 16) * MS_PER_HOUR;
    expect(Math.abs((session?.timeInBedMs ?? 0) - expectedMs)).toBeLessThanOrEqual(2 * FIVE_MINUTES);
  });

  it('measures strain over real elapsed minutes', () => {
    // Steady Zone 1 effort from midnight to 6 AM by the clock crosses the transition.
    const start = dayStart;
    const end = new Date(2026, month, day, 6).getTime();
    const samples = [];
    for (let ts = start; ts <= end; ts += FIVE_MINUTES) samples.push({ ts, bpm: 125 });
    const strain = calculateStrain({
      heartRates: samples,
      window: { start, end },
      restingHR: 50,
      maxHR: 187,
      calories: 0,
    });
    const expectedMinutes = (hours - 18) * 60; // 5 real hours in March, 7 in November
    expect(strain.zoneMinutes[0]).toBe(expectedMinutes);
    expect(strain.score).toBeLessThanOrEqual(21);
  });
});
