// Pure: builds the Health Monitor screen's display strings and chart data for the selected day.
import type { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import type { ChartPoint } from '@/components/charts/chartMath';
import { DETAIL } from '@/features/shared/detailConstants';
import type { NightVitals } from '@/scoring/baselineCalculator';
import { healthMonitorRanges, isWithinRange, type NormalRange } from '@/scoring/healthMonitor';
import { RECOVERY } from '@/scoring/scoringConstants';
import { colors } from '@/theme/colors';
import type { DailySummary } from '@/types/computed';
import type { SpO2SpotCheck } from '@/types/raw';
import { formatBpm, formatDayAndTime, formatDaysAgo, formatShortDate } from '@/utils/format';
import { addDaysTs } from '@/utils/time';

const RECENT_CHECKS = 5;

type IconName = ComponentProps<typeof Ionicons>['name'];

export type VitalCardView = {
  title: string;
  value: string;
  rangeText: string | null; // "Normal 48–56 bpm", or null while calibrating
  inRange: boolean | null;
  chart: { data: ChartPoint[]; band?: NormalRange; startLabel: string; endLabel: string } | null;
};

export type HealthMonitorView = {
  hero: { icon: IconName; color: string; title: string; explanation: string };
  isCalibrating: boolean;
  calibrationText: string;
  nightsCollected: number;
  vitals: VitalCardView[];
  spo2: { latest: string; latestAgo: string; recent: { key: string; value: string; label: string }[] } | null;
};

function formatRange(range: NormalRange): string {
  return `Normal ${Math.round(range.low)}–${Math.round(range.high)} bpm`;
}

function vitalCard(
  title: string,
  value: number | null,
  range: NormalRange | null,
  nights: { dayStart: number; value: number }[],
): VitalCardView {
  const first = nights[0];
  const last = nights.at(-1);
  return {
    title,
    value: formatBpm(value),
    rangeText: range === null ? null : formatRange(range),
    inRange: range === null || value === null ? null : isWithinRange(value, range),
    chart:
      first === undefined || last === undefined || nights.length < 2
        ? null
        : {
            data: nights.map((night) => ({ x: night.dayStart, y: night.value })),
            band: range ?? undefined,
            startLabel: formatShortDate(first.dayStart),
            endLabel: formatShortDate(last.dayStart),
          },
  };
}

function heroFor(summary: DailySummary | null): HealthMonitorView['hero'] {
  const state = summary?.healthMonitor.state ?? { kind: 'calibrating' as const };
  if (state.kind === 'withinRange') {
    return {
      icon: 'checkmark-circle',
      color: colors.good,
      title: 'Within range',
      explanation: 'Your overnight vitals are within your normal range.',
    };
  }
  if (state.kind === 'outOfRange') {
    const noun = state.count === 1 ? 'metric' : 'metrics';
    return {
      icon: 'alert-circle',
      color: colors.warn,
      title: `${state.count} ${noun} out of range`,
      explanation: 'Some of last night’s vitals were outside your normal range. One night isn’t cause for concern on its own.',
    };
  }
  return {
    icon: 'ellipse',
    color: colors.textSecondary,
    title: 'Calibrating',
    explanation: `Your normal ranges appear after ${DETAIL.calibrationNights} nights of sleep.`,
  };
}

function spo2Section(checks: SpO2SpotCheck[], dayEnd: number, now: number): HealthMonitorView['spo2'] {
  const upToDay = checks.filter((check) => check.ts < dayEnd);
  const latest = upToDay.at(-1);
  if (latest === undefined) return null;
  return {
    latest: `${latest.percent}%`,
    latestAgo: formatDaysAgo(latest.ts, now),
    recent: upToDay
      .slice(-RECENT_CHECKS)
      .reverse()
      .map((check) => ({ key: String(check.ts), value: `${check.percent}%`, label: formatDayAndTime(check.ts) })),
  };
}

export function buildHealthMonitorView(
  summary: DailySummary | null,
  history: DailySummary[],
  spo2Checks: SpO2SpotCheck[],
  now: number,
): HealthMonitorView {
  // The night the status is based on: today's, or the most recent one before it (as the engine does).
  let nightIndex = -1;
  history.forEach((day, i) => {
    if (day.sleep !== null) nightIndex = i;
  });
  const priorNights: NightVitals[] = history
    .slice(Math.max(0, nightIndex - RECOVERY.baselineDays), Math.max(0, nightIndex))
    .flatMap((day) => (day.sleep === null ? [] : [day.sleep]));
  const ranges = nightIndex < 0 ? null : healthMonitorRanges(priorNights);

  const chartNights = history.slice(Math.max(0, nightIndex + 1 - DETAIL.trendDays), nightIndex + 1);
  const restingNights = chartNights.flatMap((day) => (day.sleep === null ? [] : [{ dayStart: day.dayStart, value: day.sleep.restingHR }]));
  const sleepingNights = chartNights.flatMap((day) =>
    day.sleep === null ? [] : [{ dayStart: day.dayStart, value: day.sleep.averageSleepingHR }],
  );
  const monitor = summary?.healthMonitor ?? null;
  const nightsCollected = Math.min(priorNights.length, DETAIL.calibrationNights);
  const dayEnd = summary === null ? now : addDaysTs(summary.dayStart, 1);

  return {
    hero: heroFor(summary),
    isCalibrating: monitor === null || monitor.state.kind === 'calibrating',
    calibrationText: `${nightsCollected} of ${DETAIL.calibrationNights} nights collected`,
    nightsCollected,
    vitals: [
      vitalCard('Resting heart rate', monitor?.restingHR ?? null, ranges?.restingHR ?? null, restingNights),
      vitalCard('Sleeping heart rate', monitor?.averageSleepingHR ?? null, ranges?.sleepingHR ?? null, sleepingNights),
    ],
    spo2: spo2Section(spo2Checks, dayEnd, now),
  };
}

export const HEALTH_MONITOR_EMPTY_SPO2 = 'No readings yet. Take a spot check from the Live screen.';
