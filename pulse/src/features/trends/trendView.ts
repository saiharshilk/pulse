// Pure: builds the Health tab cards and the trend detail screen for one metric and range.
import type { BarDatum } from '@/components/charts/BarChart';
import type { ChartPoint } from '@/components/charts/chartMath';
import type { DailySummary, Trend } from '@/types/computed';
import type { UserProfile } from '@/types/profile';
import type { SpO2SpotCheck } from '@/types/raw';
import { colors } from '@/theme/colors';
import { formatDayLabel, formatDuration, formatShortDate, formatWeekdayLetter, NO_VALUE } from '@/utils/format';
import { addDaysTs, dayKeyOf, MS_PER_HOUR } from '@/utils/time';

import { averageOf, bestAndWorst, extremes, halfVsHalfTrend, meanBand, type DayValue, type TrendRange } from './trendMath';
import { TREND_METRICS, type TrendMetricKey } from './trendMetrics';

export type TrendChartData =
  | {
      kind: 'bar';
      bars: BarDatum[];
      maxValue?: number;
      target?: { value: number; label: string };
      showValueLabels: boolean;
      startLabel?: string;
      endLabel?: string;
    }
  | {
      kind: 'line';
      data: ChartPoint[];
      variant: 'line' | 'dots';
      band?: { low: number; high: number };
      xDomain: { start: number; end: number };
      startLabel: string;
      endLabel: string;
    };

export type TrendCardView = {
  key: TrendMetricKey;
  title: string;
  averageText: string;
  caption: string;
  trend: Trend;
  higherIsBetter: boolean;
  chart: TrendChartData | null; // null shows the empty state
};

export type TrendContext = { profile: UserProfile; spo2Checks: SpO2SpotCheck[] };

export const TREND_EMPTY_TEXT = 'No data in this range yet.';
const LABEL_EVERY_DAY_UP_TO = 7;

// The mean SpO2 of each day's spot checks, keyed by day.
function spo2ByDay(checks: SpO2SpotCheck[]): Map<string, number> {
  const groups = new Map<string, number[]>();
  for (const check of checks) {
    const key = dayKeyOf(check.ts);
    groups.set(key, [...(groups.get(key) ?? []), check.percent]);
  }
  return new Map([...groups].map(([key, values]) => [key, values.reduce((a, b) => a + b, 0) / values.length]));
}

export function dayValues(metric: TrendMetricKey, days: DailySummary[], context: TrendContext): DayValue[] {
  const byDay = spo2ByDay(context.spo2Checks);
  return days.map((day) => ({ dayKey: day.dayKey, dayStart: day.dayStart, value: TREND_METRICS[metric].value(day, byDay) }));
}

function targetFor(metric: TrendMetricKey, days: DailySummary[], context: TrendContext) {
  if (metric === 'steps') return { value: context.profile.stepGoal, label: 'Goal' };
  if (metric !== 'hoursAsleep') return undefined;
  const need = averageOf(days.map((day) => (day.sleep === null ? null : day.sleep.sleepNeededMs)));
  return need === null ? undefined : { value: need / MS_PER_HOUR, label: `Need ${formatDuration(need)}` };
}

function chartFor(metric: TrendMetricKey, days: DailySummary[], points: DayValue[], context: TrendContext): TrendChartData | null {
  const definition = TREND_METRICS[metric];
  const first = days[0];
  const last = days.at(-1);
  if (first === undefined || last === undefined || points.every((point) => point.value === null)) return null;
  const startLabel = formatShortDate(first.dayStart);
  const endLabel = formatShortDate(last.dayStart);

  if (definition.chart === 'bar') {
    const labelEachDay = days.length <= LABEL_EVERY_DAY_UP_TO;
    return {
      kind: 'bar',
      bars: points.map((point) => ({
        label: labelEachDay ? formatWeekdayLetter(point.dayStart) : '',
        value: point.value ?? 0,
        valueLabel: definition.format(point.value),
        color: point.value === null ? colors.track : definition.color(point.value),
      })),
      maxValue: definition.maxValue,
      target: targetFor(metric, days, context),
      showValueLabels: labelEachDay,
      startLabel: labelEachDay ? undefined : startLabel,
      endLabel: labelEachDay ? undefined : endLabel,
    };
  }

  const xDomain = { start: first.dayStart, end: addDaysTs(last.dayStart, 1) };
  if (definition.chart === 'dots') {
    const checks = context.spo2Checks.filter((check) => check.ts >= xDomain.start && check.ts < xDomain.end);
    if (checks.length === 0) return null;
    return {
      kind: 'line',
      variant: 'dots',
      data: checks.map((check) => ({ x: check.ts, y: check.percent })),
      xDomain,
      startLabel,
      endLabel,
    };
  }
  const data = points.flatMap((point) => (point.value === null ? [] : [{ x: point.dayStart, y: point.value }]));
  if (data.length < 2) return null;
  return {
    kind: 'line',
    variant: 'line',
    data,
    band: metric === 'restingHR' ? (meanBand(points.map((point) => point.value)) ?? undefined) : undefined,
    xDomain,
    startLabel,
    endLabel,
  };
}

export function buildTrendCard(metric: TrendMetricKey, days: DailySummary[], range: TrendRange, context: TrendContext): TrendCardView {
  const definition = TREND_METRICS[metric];
  const points = dayValues(metric, days, context);
  const values = points.map((point) => point.value);
  let caption = `avg · ${range} days`;
  if (metric === 'sleepPerformance') {
    const asleep = averageOf(days.map((day) => (day.sleep === null ? null : day.sleep.timeAsleepMs)));
    if (asleep !== null) caption += ` · ${formatDuration(asleep)} asleep`;
  }
  return {
    key: metric,
    title: definition.title,
    averageText: definition.format(averageOf(values)),
    caption,
    trend: halfVsHalfTrend(values),
    higherIsBetter: definition.higherIsBetter,
    chart: chartFor(metric, days, points, context),
  };
}

export type TrendDetailView = {
  card: TrendCardView;
  stats: { label: string; value: string; caption?: string }[];
  rows: { dayKey: string; dayLabel: string; value: string }[]; // newest first
};

export function buildTrendDetail(
  metric: TrendMetricKey,
  days: DailySummary[],
  range: TrendRange,
  context: TrendContext,
  now: number,
): TrendDetailView {
  const definition = TREND_METRICS[metric];
  const points = dayValues(metric, days, context);
  const { min, max } = extremes(points);
  const { best, worst } = bestAndWorst(points, definition.higherIsBetter);
  const dayStat = (point: DayValue | null) => (point === null ? undefined : formatDayLabel(point.dayStart, now));
  return {
    card: buildTrendCard(metric, days, range, context),
    stats: [
      { label: 'Average', value: definition.format(averageOf(points.map((point) => point.value))) },
      { label: 'Min', value: definition.format(min?.value ?? null), caption: dayStat(min) },
      { label: 'Max', value: definition.format(max?.value ?? null), caption: dayStat(max) },
      { label: 'Best day', value: definition.format(best?.value ?? null), caption: dayStat(best) ?? NO_VALUE },
      { label: 'Worst day', value: definition.format(worst?.value ?? null), caption: dayStat(worst) ?? NO_VALUE },
    ],
    rows: [...points]
      .reverse()
      .filter((point) => metric !== 'spo2' || point.value !== null)
      .map((point) => ({ dayKey: point.dayKey, dayLabel: formatDayLabel(point.dayStart, now), value: definition.format(point.value) })),
  };
}
