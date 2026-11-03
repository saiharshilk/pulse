import { MOCK_SEED } from '@/config/appConfig';
import { generateMockHistory } from '@/data/mock/mockDataGenerator';
import { getMockDayTruth } from '@/data/mock/mockTruth';
import { dropMissingHeartRates } from '@/data/syncFilters';
import { computeSummaries } from '@/scoring/scoringEngine';
import { DEFAULT_PROFILE } from '@/types/profile';

const NOW = new Date(2026, 9, 15, 18, 0).getTime();
const RANGES = {
  desk: { min: 3, max: 8 },
  walking: { min: 5, max: 10 },
  workout: { min: 10, max: 16 },
  hard: { min: 10, max: 18.5 }, // "up to about 18"
};

describe.each([MOCK_SEED, 7, 42])('daily strain on generated days (seed %i)', (seed) => {
  const history = generateMockHistory({ seed, now: NOW, days: 60 });
  const summaries = computeSummaries({
    heartRates: dropMissingHeartRates(history.heartRates),
    steps: history.steps,
    spo2Checks: [],
    profile: DEFAULT_PROFILE,
    now: NOW,
  });
  // The first day is partial and today is unfinished. A charging gap hides real effort.
  const fullDays = summaries.slice(1, -1).filter((day) => !getMockDayTruth(seed, day.dayStart).hadChargingGap);

  it('keeps each kind of day in its range', () => {
    const outOfRange = fullDays.flatMap((day) => {
      const { kind } = getMockDayTruth(seed, day.dayStart);
      const { min, max } = RANGES[kind];
      return day.strain.score >= min && day.strain.score <= max ? [] : [`${day.dayKey} ${kind} ${day.strain.score}`];
    });
    expect(outOfRange).toEqual([]);
  });

  it('never goes above 21 and includes every kind of day', () => {
    expect(summaries.every((day) => day.strain.score <= 21)).toBe(true);
    const kinds = new Set(fullDays.map((day) => getMockDayTruth(seed, day.dayStart).kind));
    expect(kinds.size).toBe(4);
  });
});
