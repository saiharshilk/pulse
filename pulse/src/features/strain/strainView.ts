// Pure: turns a day's strain into the display-ready strings and chart data the Strain screen shows.
import type { BarDatum } from '@/components/charts/BarChart';
import type { ChartPoint } from '@/components/charts/chartMath';
import type { HorizontalBarDatum } from '@/components/charts/HorizontalBars';
import { barsSummary } from '@/features/shared/accessibilityLabels';
import { DETAIL } from '@/features/shared/detailConstants';
import { strainInsight } from '@/insights/insightGenerator';
import { HEART_RATE, STRAIN, STRAIN_BANDS } from '@/scoring/scoringConstants';
import { optimalStrainTarget, type StrainTarget } from '@/scoring/strainTarget';
import { colors } from '@/theme/colors';
import type { DailySummary } from '@/types/computed';
import type { HeartRateSample } from '@/types/raw';
import {
  formatBpm,
  formatClockTime,
  formatDuration,
  formatNumber,
  formatStrain,
  formatTimeRange,
  formatWeekdayLetter,
  NO_VALUE,
} from '@/utils/format';

export type StrainActivityRow = {
  id: string;
  name: string;
  timeRange: string; // includes the average heart rate
  duration: string;
  strain: string;
};

export type StrainView = {
  score: number;
  scoreText: string;
  levelLabel: string;
  isInProgress: boolean;
  target: StrainTarget;
  targetText: string;
  insight: string;
  averageHR: string;
  maxHR: string;
  calories: string;
  steps: string;
  heartRate: ChartPoint[];
  heartRateWindow: { start: number; end: number };
  activityRanges: { start: number; end: number }[];
  heartRateStartLabel: string;
  heartRateEndLabel: string;
  zones: HorizontalBarDatum[];
  activities: StrainActivityRow[];
  lastDays: BarDatum[];
  heartRateSummary: string;
  zonesSummary: string;
  lastDaysSummary: string;
};

export function strainLevelLabel(score: number): string {
  if (score >= STRAIN_BANDS.allOut) return 'ALL OUT';
  if (score >= STRAIN_BANDS.strenuous) return 'STRENUOUS';
  if (score >= STRAIN_BANDS.moderate) return 'MODERATE';
  return 'LIGHT';
}

function zoneRows(zoneMinutes: number[]): HorizontalBarDatum[] {
  return zoneMinutes.map((minutes, zone) => {
    const floor = Math.round(HEART_RATE.zoneFloors[zone] * 100);
    const next = HEART_RATE.zoneFloors[zone + 1];
    const ceiling = next === undefined ? 100 : Math.round(next * 100);
    return {
      key: `zone-${zone}`,
      label: `Zone ${zone + 1}`,
      caption: `${floor}–${ceiling}%`,
      value: minutes,
      valueLabel: formatDuration(minutes * 60_000),
      color: colors.strainZones[zone] ?? colors.strain,
    };
  });
}

export function buildStrainView(
  summary: DailySummary | null,
  history: DailySummary[],
  heartRates: HeartRateSample[],
  isToday: boolean,
): StrainView {
  const strain = summary?.strain ?? null;
  const score = strain?.score ?? 0;
  // TODO(spec): a day without detected sleep has no recovery, so it uses the calibrating range.
  const target = optimalStrainTarget(summary?.recovery?.score ?? null);
  const window = strain?.window ?? { start: 0, end: 1 };

  const zones = zoneRows(strain?.zoneMinutes ?? HEART_RATE.zoneFloors.map(() => 0));
  const lastDays = history.slice(-DETAIL.historyDays).map((day) => ({
    label: formatWeekdayLetter(day.dayStart),
    value: day.strain.score,
    valueLabel: formatStrain(day.strain.score),
    color: colors.strain,
  }));

  return {
    score,
    scoreText: formatStrain(score),
    levelLabel: strainLevelLabel(score),
    isInProgress: isToday,
    target,
    targetText: `Optimal ${formatStrain(target.low)}–${formatStrain(target.high)}`,
    insight: strain === null ? '' : strainInsight(strain, target),
    averageHR: strain === null || strain.averageHR === 0 ? NO_VALUE : formatBpm(strain.averageHR),
    maxHR: strain === null || strain.maxHR === 0 ? NO_VALUE : formatBpm(strain.maxHR),
    calories: formatNumber(summary?.calories ?? 0),
    steps: formatNumber(summary?.steps ?? 0),
    heartRate: heartRates
      .filter((sample) => sample.ts >= window.start && sample.ts <= window.end)
      .map((sample) => ({ x: sample.ts, y: sample.bpm })),
    heartRateWindow: window,
    activityRanges: (summary?.activities ?? []).map((activity) => ({ start: activity.start, end: activity.end })),
    heartRateStartLabel: formatClockTime(window.start),
    heartRateEndLabel: formatClockTime(window.end),
    heartRateSummary:
      strain === null || strain.averageHR === 0
        ? 'No heart-rate readings for this day yet.'
        : `Heart rate from ${formatClockTime(window.start)} to ${formatClockTime(window.end)}, average ${formatBpm(strain.averageHR)}, highest ${formatBpm(strain.maxHR)}.`,
    zones,
    zonesSummary: barsSummary('Time in each heart-rate zone', zones.map((zone) => ({ label: zone.label, valueLabel: zone.valueLabel }))),
    activities: (summary?.activities ?? []).map((activity) => ({
      id: activity.id,
      name: activity.name,
      timeRange: `${formatTimeRange(activity.start, activity.end)} · avg ${formatBpm(activity.averageHR)}`,
      duration: formatDuration(activity.end - activity.start),
      strain: formatStrain(activity.strainAdded),
    })),
    lastDays,
    lastDaysSummary: barsSummary('Strain over the last 7 days', lastDays),
  };
}

export const STRAIN_MAX = STRAIN.maxScore;
