import { averageOf, bestAndWorst, extremes, halfVsHalfTrend, meanBand } from '@/features/trends/trendMath';

function day(dayKey: string, value: number | null) {
  return { dayKey, dayStart: new Date(`${dayKey}T00:00:00`).getTime(), value };
}

describe('averageOf', () => {
  it('skips missing days', () => {
    expect(averageOf([60, null, 80])).toBe(70);
    expect(averageOf([null, null])).toBeNull();
    expect(averageOf([])).toBeNull();
  });
});

describe('halfVsHalfTrend', () => {
  it('compares the second half with the first', () => {
    expect(halfVsHalfTrend([50, 52, 60, 62])).toBe('up');
    expect(halfVsHalfTrend([60, 62, 50, 52])).toBe('down');
  });

  it('is flat within 3%', () => {
    expect(halfVsHalfTrend([100, 100, 102, 102])).toBe('flat');
  });

  it('skips nulls and is flat without data in a half', () => {
    expect(halfVsHalfTrend([50, null, null, 60])).toBe('up');
    expect(halfVsHalfTrend([null, null, 60, 62])).toBe('flat');
    expect(halfVsHalfTrend([])).toBe('flat');
  });

  it('puts the extra day of an odd range in the second half', () => {
    expect(halfVsHalfTrend([50, 60, 60])).toBe('up');
  });
});

describe('min, max, best and worst days', () => {
  const points = [day('2026-10-01', 48), day('2026-10-02', null), day('2026-10-03', 55), day('2026-10-04', 48)];

  it('finds the extremes with their dates, earliest first on a tie', () => {
    const { min, max } = extremes(points);
    expect(min?.dayKey).toBe('2026-10-01');
    expect(max).toEqual(points[2]);
  });

  it('picks best and worst by direction', () => {
    expect(bestAndWorst(points, true).best?.value).toBe(55);
    expect(bestAndWorst(points, false).best?.value).toBe(48);
    expect(bestAndWorst(points, false).worst?.dayKey).toBe('2026-10-03');
  });

  it('is empty without data', () => {
    expect(extremes([day('2026-10-01', null)])).toEqual({ min: null, max: null });
  });
});

describe('meanBand', () => {
  it('is the mean ± 1 SD of known values', () => {
    expect(meanBand([48, null, 52])).toEqual({ low: 48, high: 52 });
    expect(meanBand([null])).toBeNull();
  });
});
