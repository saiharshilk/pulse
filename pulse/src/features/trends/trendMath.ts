// Pure aggregation for the Health tab. Missing days are null and are always skipped.
import type { Trend } from '@/types/computed';

export const TREND_RANGES = [7, 30, 90] as const;
export type TrendRange = (typeof TREND_RANGES)[number];

export const TREND_MATH = {
  // The second half within 3% of the first half counts as flat.
  flatFraction: 0.03,
} as const;

export type DayValue = { dayKey: string; dayStart: number; value: number | null };

export function averageOf(values: (number | null)[]): number | null {
  const known = values.filter((value): value is number => value !== null && Number.isFinite(value));
  return known.length === 0 ? null : known.reduce((a, b) => a + b, 0) / known.length;
}

// Compares the average of the second half of the range with the first half.
export function halfVsHalfTrend(values: (number | null)[], flatFraction: number = TREND_MATH.flatFraction): Trend {
  const middle = Math.floor(values.length / 2);
  const first = averageOf(values.slice(0, middle));
  const second = averageOf(values.slice(middle));
  if (first === null || second === null) return 'flat';
  const tolerance = Math.abs(first) * flatFraction;
  if (Math.abs(second - first) <= tolerance) return 'flat';
  return second > first ? 'up' : 'down';
}

export type KnownDayValue = DayValue & { value: number };

function known(points: DayValue[]): KnownDayValue[] {
  return points.filter((point): point is KnownDayValue => point.value !== null);
}

// The lowest and highest days. On a tie, the earliest day wins.
export function extremes(points: DayValue[]): { min: KnownDayValue | null; max: KnownDayValue | null } {
  let min: KnownDayValue | null = null;
  let max: KnownDayValue | null = null;
  for (const point of known(points)) {
    if (min === null || point.value < min.value) min = point;
    if (max === null || point.value > max.value) max = point;
  }
  return { min, max };
}

// The best day is the highest for most metrics, but the lowest for heart rates.
export function bestAndWorst(
  points: DayValue[],
  higherIsBetter: boolean,
): { best: KnownDayValue | null; worst: KnownDayValue | null } {
  const { min, max } = extremes(points);
  return higherIsBetter ? { best: max, worst: min } : { best: min, worst: max };
}

// Mean ± 1 SD of the known values, for a baseline band on line charts.
export function meanBand(values: (number | null)[]): { low: number; high: number } | null {
  const mean = averageOf(values);
  if (mean === null) return null;
  const knownValues = values.filter((value): value is number => value !== null);
  const sd = Math.sqrt(knownValues.reduce((total, value) => total + (value - mean) ** 2, 0) / knownValues.length);
  return { low: mean - sd, high: mean + sd };
}
