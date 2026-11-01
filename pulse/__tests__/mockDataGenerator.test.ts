import { generateMockHistory } from '@/data/mock/mockDataGenerator';

const NOW = new Date(2026, 9, 15, 14, 30).getTime();

describe('generateMockHistory', () => {
  it('returns identical output for the same seed and now', () => {
    expect(generateMockHistory({ seed: 7, now: NOW })).toEqual(generateMockHistory({ seed: 7, now: NOW }));
  });

  it('returns different output for a different seed', () => {
    expect(generateMockHistory({ seed: 7, now: NOW })).not.toEqual(generateMockHistory({ seed: 8, now: NOW }));
  });

  it('never returns readings from the future', () => {
    const { heartRates, steps } = generateMockHistory({ seed: 7, now: NOW });
    expect(heartRates.every((reading) => reading.ts <= NOW)).toBe(true);
    expect(steps.every((bucket) => bucket.start <= NOW)).toBe(true);
  });

  it('keeps past readings the same when now moves forward', () => {
    const earlier = generateMockHistory({ seed: 7, now: NOW });
    const later = generateMockHistory({ seed: 7, now: NOW + 3 * 3_600_000, days: 61 });
    const laterByTs = new Map(later.heartRates.map((reading) => [reading.ts, reading.bpm]));
    expect(earlier.heartRates.every((reading) => laterByTs.get(reading.ts) === reading.bpm)).toBe(true);
  });

  it('includes missing (0 bpm) readings like the real ring', () => {
    const { heartRates } = generateMockHistory({ seed: 7, now: NOW });
    expect(heartRates.some((reading) => reading.bpm === 0)).toBe(true);
  });

  it('generates 90 days quickly', () => {
    const started = Date.now();
    generateMockHistory({ seed: 7, now: NOW, days: 90 });
    expect(Date.now() - started).toBeLessThan(1000);
  });
});
