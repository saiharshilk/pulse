// Pure: turns a day's recovery into the display-ready strings and chart data the Recovery screen shows.
import type { BarDatum } from '@/components/charts/BarChart';
import type { ChartPoint } from '@/components/charts/chartMath';
import { recoveryColor } from '@/features/home/homeView';
import { DETAIL } from '@/features/shared/detailConstants';
import { recoveryInsight } from '@/insights/insightGenerator';
import { colors } from '@/theme/colors';
import type { DailySummary, Trend } from '@/types/computed';
import { formatBpm, formatPercent, formatShortDate, formatWeekdayLetter, NO_VALUE } from '@/utils/format';

export type RecoveryView = {
  state: 'scored' | 'calibrating' | 'noSleep';
  dialValue: number;
  dialColor: string;
  dialLabel: string;
  nightsCollected: number; // for the calibration dots
  calibrationText: string;
  restingHR: string;
  restingHRTrend: Trend;
  sleepingHR: string;
  sleepingHRTrend: Trend;
  sleepPerformance: string;
  sleepPerformanceTrend: Trend;
  insight: string | null;
  lastDays: BarDatum[];
  restingLine: { data: ChartPoint[]; band?: { low: number; high: number }; startLabel: string; endLabel: string } | null;
};

// Sleep performance compared with the prior 30 days, since recovery doesn't store a trend for it.
function performanceTrend(today: number, history: DailySummary[]): Trend {
  const prior = history
    .slice(-DETAIL.trendDays - 1, -1)
    .flatMap((day) => (day.sleep === null ? [] : [day.sleep.performance]));
  if (prior.length === 0) return 'flat';
  const mean = prior.reduce((a, b) => a + b, 0) / prior.length;
  if (Math.abs(today - mean) <= DETAIL.performanceFlatPoints) return 'flat';
  return today > mean ? 'up' : 'down';
}

function lastDaysChart(history: DailySummary[]): BarDatum[] {
  return history.slice(-DETAIL.historyDays).map((day) => {
    const score = day.recovery?.score ?? null;
    return score === null
      ? { label: formatWeekdayLetter(day.dayStart), value: 100 * DETAIL.calibratingBarFraction, valueLabel: NO_VALUE, color: colors.track }
      : { label: formatWeekdayLetter(day.dayStart), value: score, valueLabel: String(score), color: recoveryColor(score) };
  });
}

function restingLineChart(summary: DailySummary | null, history: DailySummary[]): RecoveryView['restingLine'] {
  const days = history.slice(-DETAIL.trendDays).filter((day) => day.sleep !== null);
  const first = days[0];
  const last = days.at(-1);
  if (first === undefined || last === undefined || days.length < 2) return null;
  const baseline = summary?.recovery?.baseline ?? null;
  return {
    data: days.flatMap((day) => (day.sleep === null ? [] : [{ x: day.dayStart, y: day.sleep.restingHR }])),
    band:
      baseline === null
        ? undefined
        : { low: baseline.restingHRMean - baseline.restingHRSd, high: baseline.restingHRMean + baseline.restingHRSd },
    startLabel: formatShortDate(first.dayStart),
    endLabel: formatShortDate(last.dayStart),
  };
}

export function buildRecoveryView(summary: DailySummary | null, history: DailySummary[]): RecoveryView {
  const recovery = summary?.recovery ?? null;
  const shared = {
    lastDays: lastDaysChart(history),
    restingLine: restingLineChart(summary, history),
    calibrationText: '',
  };

  if (recovery === null) {
    return {
      ...shared,
      state: 'noSleep',
      dialValue: 0,
      dialColor: colors.track,
      dialLabel: 'RECOVERY',
      nightsCollected: 0,
      restingHR: NO_VALUE,
      restingHRTrend: 'flat',
      sleepingHR: NO_VALUE,
      sleepingHRTrend: 'flat',
      sleepPerformance: NO_VALUE,
      sleepPerformanceTrend: 'flat',
      insight: null,
    };
  }

  const score = recovery.score;
  const nights = Math.min(recovery.nightsCollected, DETAIL.calibrationNights);
  return {
    ...shared,
    state: score === null ? 'calibrating' : 'scored',
    dialValue: score ?? 0,
    dialColor: score === null ? colors.track : recoveryColor(score),
    dialLabel: score === null ? 'CALIBRATING' : 'RECOVERY',
    nightsCollected: nights,
    calibrationText: `${nights} of ${DETAIL.calibrationNights} nights collected`,
    restingHR: formatBpm(recovery.restingHR),
    restingHRTrend: recovery.restingHRTrend,
    sleepingHR: formatBpm(recovery.averageSleepingHR),
    sleepingHRTrend: recovery.sleepingHRTrend,
    sleepPerformance: formatPercent(recovery.sleepPerformance),
    sleepPerformanceTrend: performanceTrend(recovery.sleepPerformance, history),
    insight: recoveryInsight(recovery),
  };
}
