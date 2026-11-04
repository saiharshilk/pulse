// Pure: turns a day's sleep into the display-ready strings and chart data the Sleep screen shows.
import type { BarDatum } from '@/components/charts/BarChart';
import type { ChartPoint } from '@/components/charts/chartMath';
import type { HorizontalBarDatum } from '@/components/charts/HorizontalBars';
import { barsSummary } from '@/features/shared/accessibilityLabels';
import { DETAIL } from '@/features/shared/detailConstants';
import { sleepInsight } from '@/insights/insightGenerator';
import { SLEEP_BANDS } from '@/scoring/scoringConstants';
import { colors } from '@/theme/colors';
import type { DailySummary, SleepEstimate } from '@/types/computed';
import type { HeartRateSample } from '@/types/raw';
import {
  formatBpm,
  formatClockTime,
  formatDuration,
  formatPercent,
  formatWeekdayLetter,
  NO_VALUE,
} from '@/utils/format';
import { MS_PER_HOUR } from '@/utils/time';

export type SleepView = {
  hasSleep: boolean;
  dialValue: number;
  performanceText: string;
  performance: number;
  consistencyText: string;
  consistency: number | null;
  consistencyCaption?: string;
  efficiencyText: string;
  efficiency: number;
  insight: string | null;
  timeline: {
    start: number;
    end: number;
    awakeIntervals: { start: number; end: number }[];
    startLabel: string;
    endLabel: string;
    heartRate: ChartPoint[];
  } | null;
  hoursAsleep: string;
  timeInBed: string;
  wakeUps: string;
  restingHR: string;
  averageSleepingHR: string;
  needRows: HorizontalBarDatum[];
  needTotal: string;
  lastNights: BarDatum[];
  needTarget: { value: number; label: string } | null;
  hasLastNights: boolean;
  timelineSummary: string;
  lastNightsSummary: string;
};

export function performanceColor(performance: number): string {
  if (performance >= SLEEP_BANDS.optimal) return colors.bandOptimal;
  if (performance >= SLEEP_BANDS.sufficient) return colors.bandSufficient;
  return colors.bandPoor;
}

function lastNightsChart(
  history: DailySummary[],
): Pick<SleepView, 'lastNights' | 'needTarget' | 'hasLastNights' | 'lastNightsSummary'> {
  const days = history.slice(-DETAIL.historyDays);
  const nights = days.flatMap((day) => (day.sleep === null ? [] : [day.sleep]));
  const longest = Math.max(...nights.map((night) => night.timeAsleepMs / MS_PER_HOUR), 1);
  const lastNights = days.map((day) => {
    const sleep = day.sleep;
    return sleep === null
      ? { label: formatWeekdayLetter(day.dayStart), value: longest * DETAIL.calibratingBarFraction, valueLabel: NO_VALUE, color: colors.track }
      : {
          label: formatWeekdayLetter(day.dayStart),
          value: sleep.timeAsleepMs / MS_PER_HOUR,
          valueLabel: formatDuration(sleep.timeAsleepMs),
          color: performanceColor(sleep.performance),
        };
  });
  const averageNeedMs =
    nights.length === 0 ? null : nights.reduce((total, night) => total + night.sleepNeededMs, 0) / nights.length;
  return {
    lastNights,
    needTarget:
      averageNeedMs === null ? null : { value: averageNeedMs / MS_PER_HOUR, label: `Need ${formatDuration(averageNeedMs)}` },
    hasLastNights: nights.length > 0,
    lastNightsSummary: barsSummary('Hours asleep over the last 7 nights', lastNights),
  };
}

function needRows(sleep: SleepEstimate): HorizontalBarDatum[] {
  const { baselineMs, strainMs, debtMs } = sleep.needBreakdown;
  return [
    { key: 'baseline', label: 'Baseline', value: baselineMs, valueLabel: formatDuration(baselineMs), color: colors.sleep },
    { key: 'strain', label: 'Recent strain', value: strainMs, valueLabel: `+${formatDuration(strainMs)}`, color: colors.strain },
    { key: 'debt', label: 'Sleep debt', value: debtMs, valueLabel: `+${formatDuration(debtMs)}`, color: colors.warn },
  ];
}

export function buildSleepView(summary: DailySummary | null, history: DailySummary[], heartRates: HeartRateSample[]): SleepView {
  const sleep = summary?.sleep ?? null;
  const previousNights = history.slice(0, -1).flatMap((day) => (day.sleep === null ? [] : [day.sleep]));
  const chart = lastNightsChart(history);

  if (sleep === null) {
    return {
      hasSleep: false,
      dialValue: 0,
      performanceText: NO_VALUE,
      performance: 0,
      consistencyText: NO_VALUE,
      consistency: null,
      efficiencyText: NO_VALUE,
      efficiency: 0,
      insight: null,
      timeline: null,
      hoursAsleep: NO_VALUE,
      timeInBed: NO_VALUE,
      wakeUps: NO_VALUE,
      timelineSummary: 'No sleep detected for this night.',
      restingHR: NO_VALUE,
      averageSleepingHR: NO_VALUE,
      needRows: [],
      needTotal: NO_VALUE,
      ...chart,
    };
  }

  return {
    hasSleep: true,
    dialValue: sleep.performance,
    performanceText: formatPercent(sleep.performance),
    performance: sleep.performance,
    consistencyText: formatPercent(sleep.consistency),
    consistency: sleep.consistency,
    consistencyCaption: sleep.consistency === null ? `needs ${DETAIL.calibrationNights} nights` : undefined,
    efficiencyText: formatPercent(sleep.efficiency),
    efficiency: sleep.efficiency,
    insight: sleepInsight(sleep, previousNights),
    timeline: {
      start: sleep.bedtime,
      end: sleep.wakeTime,
      awakeIntervals: sleep.awakeIntervals,
      startLabel: formatClockTime(sleep.bedtime),
      endLabel: formatClockTime(sleep.wakeTime),
      heartRate: heartRates
        .filter((sample) => sample.ts >= sleep.bedtime && sample.ts <= sleep.wakeTime)
        .map((sample) => ({ x: sample.ts, y: sample.bpm })),
    },
    hoursAsleep: formatDuration(sleep.timeAsleepMs),
    timeInBed: formatDuration(sleep.timeInBedMs),
    wakeUps: String(sleep.awakeIntervals.length),
    timelineSummary: `Asleep ${formatDuration(sleep.timeAsleepMs)} between ${formatClockTime(sleep.bedtime)} and ${formatClockTime(sleep.wakeTime)}, with ${sleep.awakeIntervals.length} wake-ups.`,
    restingHR: formatBpm(sleep.restingHR),
    averageSleepingHR: formatBpm(sleep.averageSleepingHR),
    needRows: needRows(sleep),
    needTotal: formatDuration(sleep.sleepNeededMs),
    ...chart,
  };
}
