import { MOCK_SEED } from '@/config/appConfig';
import { generateMockHistory } from '@/data/mock/mockDataGenerator';
import { dropMissingHeartRates } from '@/data/syncFilters';
import { computeSummaries } from '@/scoring/scoringEngine';
import { DEFAULT_PROFILE } from '@/types/profile';

// The busiest days, where a hard cap would show up as near-identical totals.
const TOP_DAYS = 5;
const CLOSE_STEPS = 50;

describe.each([MOCK_SEED, 7, 42])('daily mock steps (seed %i)', (seed) => {
  const now = new Date(2026, 10, 3, 18).getTime();
  const history = generateMockHistory({ seed, now, days: 60 });
  const summaries = computeSummaries({
    heartRates: dropMissingHeartRates(history.heartRates),
    steps: history.steps,
    spo2Checks: [],
    profile: DEFAULT_PROFILE,
    now,
  });
  const totals = summaries.slice(1, -1).map((day) => day.steps); // the first and last days are partial

  it("don't pile up at a ceiling", () => {
    // Among the busiest days, at most 2 may sit within 50 steps of another.
    const top = [...totals].sort((a, b) => b - a).slice(0, TOP_DAYS);
    const crowded = top.filter((value, i) => top.some((other, j) => j !== i && Math.abs(other - value) <= CLOSE_STEPS));
    expect(crowded.length).toBeLessThanOrEqual(2);
  });

  it('are mostly 5,000–13,000, with occasional big and lazy days', () => {
    const normal = totals.filter((steps) => steps >= 5000 && steps <= 13000);
    expect(normal.length / totals.length).toBeGreaterThan(0.75);
    expect(Math.max(...totals)).toBeLessThanOrEqual(18500);
    expect(Math.min(...totals)).toBeGreaterThanOrEqual(2000);
    expect(totals.some((steps) => steps >= 15000) || totals.some((steps) => steps <= 4000)).toBe(true);
  });
});
