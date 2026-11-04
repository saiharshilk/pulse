import { MOCK_SEED } from '@/config/appConfig';
import { generateMockHistory } from '@/data/mock/mockDataGenerator';
import { cleanSyncBatch } from '@/data/syncFilters';
import { RECOVERY_BANDS } from '@/scoring/scoringConstants';
import { computeSummaries } from '@/scoring/scoringEngine';
import { DEFAULT_PROFILE } from '@/types/profile';
import { addDaysTs, dayKeyOf, startOfDayTs } from '@/utils/time';

// The whole pipeline without the database: mock ring → the sync service's filter → scoring.
describe('mock ring to daily summaries', () => {
  const now = new Date(2026, 10, 3, 18).getTime();
  const batch = generateMockHistory({ seed: MOCK_SEED, now, days: 60 });
  const { heartRates, steps } = cleanSyncBatch(batch);

  const started = performance.now();
  const summaries = computeSummaries({ heartRates, steps, spo2Checks: [], profile: DEFAULT_PROFILE, now });
  const elapsedMs = performance.now() - started;

  it('drops missing readings before scoring', () => {
    expect(batch.heartRates.some((reading) => reading.bpm === 0)).toBe(true);
    expect(heartRates.every((sample) => sample.bpm > 0)).toBe(true);
  });

  it('has a summary for every day, oldest first', () => {
    const firstDay = startOfDayTs(heartRates[0].ts);
    const expectedDays = [];
    for (let day = firstDay; day <= startOfDayTs(now); day = addDaysTs(day, 1)) expectedDays.push(dayKeyOf(day));
    expect(summaries.map((summary) => summary.dayKey)).toEqual(expectedDays);
  });

  it('shows recovery from the fifth night with sleep', () => {
    const nights = summaries.filter((summary) => summary.sleep !== null);
    nights.slice(0, 4).forEach((night) => expect(night.recovery?.isCalibrating).toBe(true));
    expect(nights[4].recovery?.isCalibrating).toBe(false);
    expect(nights[4].recovery?.score).not.toBeNull();
  });

  it('includes green, yellow and red recovery days', () => {
    const scores = summaries.flatMap((summary) => summary.recovery?.score ?? []);
    expect(scores.some((score) => score >= RECOVERY_BANDS.green)).toBe(true);
    expect(scores.some((score) => score >= RECOVERY_BANDS.yellow && score < RECOVERY_BANDS.green)).toBe(true);
    expect(scores.some((score) => score < RECOVERY_BANDS.yellow)).toBe(true);
  });

  it('scores 60 days quickly', () => {
    console.log(`computeSummaries for 61 days took ${elapsedMs.toFixed(1)} ms`);
    expect(elapsedMs).toBeLessThan(1000);
  });

  it('scores 90 days quickly', () => {
    const ninety = cleanSyncBatch(generateMockHistory({ seed: MOCK_SEED, now, days: 90 }));
    const start = performance.now();
    computeSummaries({ ...ninety, spo2Checks: [], profile: DEFAULT_PROFILE, now });
    const ms = performance.now() - start;
    console.log(`computeSummaries for 91 days took ${ms.toFixed(1)} ms`);
    expect(ms).toBeLessThan(1000);
  });
});
