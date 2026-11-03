// The nine metrics on the Health tab: how to read each from a day, format it, and color it.
import { recoveryColor } from '@/features/home/homeView';
import { performanceColor } from '@/features/sleep/sleepView';
import { colors } from '@/theme/colors';
import type { DailySummary } from '@/types/computed';
import { formatBpm, formatDuration, formatNumber, formatPercent, formatStrain, NO_VALUE } from '@/utils/format';
import { MS_PER_HOUR } from '@/utils/time';

export const TREND_METRIC_KEYS = [
  'recovery',
  'sleepPerformance',
  'hoursAsleep',
  'strain',
  'restingHR',
  'sleepingHR',
  'steps',
  'calories',
  'spo2',
] as const;
export type TrendMetricKey = (typeof TREND_METRIC_KEYS)[number];

export function isTrendMetricKey(value: string | undefined): value is TrendMetricKey {
  return TREND_METRIC_KEYS.some((key) => key === value);
}

export type TrendMetric = {
  key: TrendMetricKey;
  title: string;
  higherIsBetter: boolean;
  chart: 'bar' | 'line' | 'dots';
  maxValue?: number; // fixed top of a bar chart, e.g. 100 for percentages
  value: (day: DailySummary, spo2ByDay: Map<string, number>) => number | null;
  format: (value: number | null) => string;
  color: (value: number) => string;
};

const constant = (color: string) => () => color;

export const TREND_METRICS: Record<TrendMetricKey, TrendMetric> = {
  recovery: {
    key: 'recovery',
    title: 'Recovery',
    higherIsBetter: true,
    chart: 'bar',
    maxValue: 100,
    value: (day) => day.recovery?.score ?? null,
    format: formatPercent,
    color: recoveryColor,
  },
  sleepPerformance: {
    key: 'sleepPerformance',
    title: 'Sleep performance',
    higherIsBetter: true,
    chart: 'bar',
    maxValue: 100,
    value: (day) => day.sleep?.performance ?? null,
    format: formatPercent,
    color: performanceColor,
  },
  hoursAsleep: {
    key: 'hoursAsleep',
    title: 'Hours asleep',
    higherIsBetter: true,
    chart: 'bar',
    value: (day) => (day.sleep === null ? null : day.sleep.timeAsleepMs / MS_PER_HOUR),
    format: (value) => (value === null ? NO_VALUE : formatDuration(value * MS_PER_HOUR)),
    color: constant(colors.sleep),
  },
  strain: {
    key: 'strain',
    title: 'Strain',
    higherIsBetter: true,
    chart: 'bar',
    maxValue: 21,
    value: (day) => day.strain.score,
    format: (value) => (value === null ? NO_VALUE : formatStrain(value)),
    color: constant(colors.strain),
  },
  restingHR: {
    key: 'restingHR',
    title: 'Resting heart rate',
    higherIsBetter: false,
    chart: 'line',
    value: (day) => day.sleep?.restingHR ?? null,
    format: formatBpm,
    color: constant(colors.recoveryRed),
  },
  sleepingHR: {
    key: 'sleepingHR',
    title: 'Sleeping heart rate',
    higherIsBetter: false,
    chart: 'line',
    value: (day) => day.sleep?.averageSleepingHR ?? null,
    format: formatBpm,
    color: constant(colors.sleep),
  },
  steps: {
    key: 'steps',
    title: 'Steps',
    higherIsBetter: true,
    chart: 'bar',
    value: (day) => day.steps,
    format: (value) => (value === null ? NO_VALUE : formatNumber(value)),
    color: constant(colors.good),
  },
  calories: {
    key: 'calories',
    title: 'Calories',
    higherIsBetter: true,
    chart: 'bar',
    value: (day) => day.calories,
    format: (value) => (value === null ? NO_VALUE : formatNumber(value)),
    color: constant(colors.bandPoor),
  },
  spo2: {
    key: 'spo2',
    title: 'Blood oxygen (spot checks)',
    higherIsBetter: true,
    chart: 'dots',
    value: (day, spo2ByDay) => spo2ByDay.get(day.dayKey) ?? null,
    format: formatPercent,
    color: constant(colors.link),
  },
};
