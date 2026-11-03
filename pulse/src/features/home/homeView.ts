// Pure: turns one day's summary into the display-ready strings the Home screen shows.
import type { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import { recoveryDialLabel, sleepDialLabel, strainDialLabel } from '@/features/shared/accessibilityLabels';
import { RECOVERY_BANDS, STRAIN } from '@/scoring/scoringConstants';
import { colors } from '@/theme/colors';
import type { DailySummary } from '@/types/computed';
import type { UserProfile } from '@/types/profile';
import {
  formatClockTime,
  formatDayLabel,
  formatDuration,
  formatNumber,
  formatStrain,
  formatTimeAgo,
  formatTimeRange,
  NO_VALUE,
} from '@/utils/format';
import { dayKeyOf } from '@/utils/time';

export type DialView = {
  value: number;
  maxValue: number;
  valueText?: string;
  suffix?: string;
  color: string;
  label: string;
  placeholder: boolean;
  accessibilityLabel: string;
};

export type HealthStatusView = {
  icon: ComponentProps<typeof Ionicons>['name'];
  color: string;
  text: string;
  caption: string;
};

export type ActivityRowView = {
  id: string;
  name: string;
  timeRange: string;
  duration: string;
  strain: string;
};

export type HomeView = {
  dateLabel: string;
  sleepDial: DialView;
  recoveryDial: DialView;
  strainDial: DialView;
  healthStatus: HealthStatusView;
  stepsValue: string;
  stepsProgress: number; // 0–1
  stepsCaption: string;
  activitiesTitle: string;
  sleepRow: { timeRange: string; duration: string } | null;
  activityRows: ActivityRowView[];
  activitiesEmptyText: string;
  heartRateValue: string;
  heartRateCaption: string;
};

export function recoveryColor(score: number): string {
  if (score >= RECOVERY_BANDS.green) return colors.recoveryGreen;
  if (score >= RECOVERY_BANDS.yellow) return colors.recoveryYellow;
  return colors.recoveryRed;
}

function sleepDial(summary: DailySummary | null): DialView {
  const sleep = summary?.sleep ?? null;
  return {
    value: sleep?.performance ?? 0,
    maxValue: 100,
    suffix: '%',
    color: colors.sleep,
    label: 'SLEEP',
    placeholder: sleep === null,
    accessibilityLabel: sleepDialLabel(sleep?.performance ?? null),
  };
}

function recoveryDial(summary: DailySummary | null): DialView {
  const recovery = summary?.recovery ?? null;
  const score = recovery?.score ?? null;
  return {
    value: score ?? 0,
    maxValue: 100,
    suffix: '%',
    color: score === null ? colors.track : recoveryColor(score),
    label: recovery?.isCalibrating === true ? 'CALIBRATING' : 'RECOVERY',
    placeholder: score === null,
    accessibilityLabel: recoveryDialLabel(score, recovery?.isCalibrating === true),
  };
}

function strainDial(summary: DailySummary | null): DialView {
  const score = summary?.strain.score ?? 0;
  return {
    value: score,
    maxValue: STRAIN.maxScore,
    valueText: formatStrain(score),
    color: colors.strain,
    label: 'STRAIN',
    placeholder: summary === null,
    accessibilityLabel: strainDialLabel(score),
  };
}

function healthStatus(summary: DailySummary | null): HealthStatusView {
  const monitor = summary?.healthMonitor ?? null;
  const restingHR = monitor?.restingHR ?? null;
  const caption = restingHR === null ? `RHR ${NO_VALUE}` : `RHR ${Math.round(restingHR)} bpm`;
  const state = monitor?.state ?? { kind: 'calibrating' as const };

  if (state.kind === 'withinRange') {
    return { icon: 'checkmark-circle', color: colors.good, text: 'Within range', caption };
  }
  if (state.kind === 'outOfRange') {
    const noun = state.count === 1 ? 'metric' : 'metrics';
    return { icon: 'alert-circle', color: colors.warn, text: `${state.count} ${noun} out of range`, caption };
  }
  return { icon: 'ellipse', color: colors.textSecondary, text: 'Calibrating', caption };
}

export function buildHomeView(
  summary: DailySummary | null,
  profile: UserProfile,
  now: number,
): HomeView {
  const isToday = summary !== null && summary.dayKey === dayKeyOf(now);
  const steps = summary?.steps ?? 0;
  const goalFraction = steps / profile.stepGoal;
  const sleep = summary?.sleep ?? null;
  const latest = summary?.latestHeartRate ?? null;

  let heartRateCaption = 'No readings';
  if (latest !== null) {
    heartRateCaption = isToday ? formatTimeAgo(latest.ts, now) : `Last at ${formatClockTime(latest.ts)}`;
  }

  return {
    dateLabel: summary === null ? 'TODAY' : formatDayLabel(summary.dayStart, now),
    sleepDial: sleepDial(summary),
    recoveryDial: recoveryDial(summary),
    strainDial: strainDial(summary),
    healthStatus: healthStatus(summary),
    stepsValue: formatNumber(steps),
    stepsProgress: Math.min(1, goalFraction),
    stepsCaption: `${Math.round(goalFraction * 100)}% of goal · ${formatNumber(summary?.calories ?? 0)} cal`,
    activitiesTitle: isToday ? "TODAY'S ACTIVITIES" : 'ACTIVITIES',
    sleepRow:
      sleep === null
        ? null
        : {
            timeRange: formatTimeRange(sleep.bedtime, sleep.wakeTime),
            duration: formatDuration(sleep.timeAsleepMs),
          },
    activityRows: (summary?.activities ?? []).map((activity) => ({
      id: activity.id,
      name: activity.name,
      timeRange: formatTimeRange(activity.start, activity.end),
      duration: formatDuration(activity.end - activity.start),
      strain: formatStrain(activity.strainAdded),
    })),
    activitiesEmptyText: isToday ? 'No activities detected yet today.' : 'No activities detected this day.',
    heartRateValue: latest === null ? NO_VALUE : String(latest.bpm),
    heartRateCaption,
  };
}
