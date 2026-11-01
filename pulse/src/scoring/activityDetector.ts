// Finds workouts from sustained elevated heart rate.
import type { DetectedActivity } from '@/types/computed';
import type { HeartRateSample } from '@/types/raw';
import { MS_PER_MINUTE } from '@/utils/time';

import { heartRateReserve, toMinuteSeries } from './heartRateSeries';
import { ACTIVITY } from './scoringConstants';
import { loadOfMinutes, strainFromLoad } from './strainCalculator';

export type ActivityInput = {
  heartRates: HeartRateSample[]; // sorted, inside the window
  window: { start: number; end: number };
  restingHR: number;
  maxHR: number;
};

type MinuteRange = { first: number; last: number };

export function detectActivities({ heartRates, window, restingHR, maxHR }: ActivityInput): DetectedActivity[] {
  const minutes = toMinuteSeries(heartRates, window.start, window.end);

  const ranges: MinuteRange[] = [];
  let current: MinuteRange | null = null;
  minutes.forEach((bpm, minute) => {
    if (bpm === null || heartRateReserve(bpm, restingHR, maxHR) < ACTIVITY.minHrr) return;
    if (current !== null && minute - current.last - 1 < ACTIVITY.mergeGapMinutes) {
      current.last = minute;
    } else {
      current = { first: minute, last: minute };
      ranges.push(current);
    }
  });

  return ranges
    .filter((range) => range.last - range.first + 1 >= ACTIVITY.minMinutes)
    .map((range) => {
      const slice = minutes.slice(range.first, range.last + 1);
      const known = slice.filter((bpm) => bpm !== null);
      const start = window.start + range.first * MS_PER_MINUTE;
      return {
        id: `act-${start}`,
        start,
        end: window.start + (range.last + 1) * MS_PER_MINUTE,
        averageHR: Math.round(known.reduce((a, b) => a + b, 0) / known.length),
        maxHR: Math.round(Math.max(...known)),
        strainAdded: strainFromLoad(loadOfMinutes(slice, restingHR, maxHR)),
        name: ACTIVITY.defaultName,
      };
    });
}
