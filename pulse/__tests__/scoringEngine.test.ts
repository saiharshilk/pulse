import { generateMockHistory } from '@/data/mock/mockDataGenerator';
import { dropMissingHeartRates } from '@/data/syncFilters';
import { RECOVERY_BANDS } from '@/scoring/scoringConstants';
import { computeSummaries } from '@/scoring/scoringEngine';
import { DEFAULT_PROFILE } from '@/types/profile';

const NOW = new Date(2026, 9, 15, 18, 0).getTime();

function summariesFor(seed: number, days: number) {
  const history = generateMockHistory({ seed, now: NOW, days });
  return computeSummaries({
    heartRates: dropMissingHeartRates(history.heartRates),
    steps: history.steps,
    spo2Checks: [],
    profile: DEFAULT_PROFILE,
    now: NOW,
  });
}

describe('computeSummaries', () => {
  it('returns nothing without data', () => {
    expect(
      computeSummaries({ heartRates: [], steps: [], spo2Checks: [], profile: DEFAULT_PROFILE, now: NOW }),
    ).toEqual([]);
  });

  it('produces one summary per day, oldest first, ending today', () => {
    const summaries = summariesFor(3, 60);
    expect(summaries).toHaveLength(61);
    expect(summaries[0].dayStart).toBeLessThan(summaries[1].dayStart);
    expect(summaries.at(-1)?.dayKey).toBe('2026-10-15');
  });

  it('calibrates for the first nights, then scores', () => {
    const summaries = summariesFor(3, 60);
    expect(summaries[2].recovery?.isCalibrating ?? true).toBe(true);
    expect(summaries[20].recovery?.isCalibrating).toBe(false);
  });

  it('produces green, yellow and red recovery days', () => {
    const scores = summariesFor(3, 60).flatMap((summary) => summary.recovery?.score ?? []);
    expect(scores.some((score) => score >= RECOVERY_BANDS.green)).toBe(true);
    expect(scores.some((score) => score >= RECOVERY_BANDS.yellow && score < RECOVERY_BANDS.green)).toBe(true);
    expect(scores.some((score) => score < RECOVERY_BANDS.yellow)).toBe(true);
  });

  it('keeps daily steps in a realistic range on full days', () => {
    const fullDays = summariesFor(3, 60).slice(1, -1);
    expect(fullDays.every((summary) => summary.steps <= 14000)).toBe(true);
    // A charging gap can take a walk out of a day, so only most days must reach 4,000.
    const inRange = fullDays.filter((summary) => summary.steps >= 4000);
    expect(inRange.length / fullDays.length).toBeGreaterThan(0.9);
  });

  it('computes 90 days quickly', () => {
    const history = generateMockHistory({ seed: 3, now: NOW, days: 90 });
    const heartRates = dropMissingHeartRates(history.heartRates);
    const started = Date.now();
    computeSummaries({ heartRates, steps: history.steps, spo2Checks: [], profile: DEFAULT_PROFILE, now: NOW });
    expect(Date.now() - started).toBeLessThan(1000);
  });
});
