// Shared heart-rate helpers for the strain and activity calculators.
import type { UserProfile } from '@/types/profile';
import type { HeartRateSample } from '@/types/raw';
import { MS_PER_MINUTE } from '@/utils/time';

import { HEART_RATE, STRAIN } from './scoringConstants';

export function maxHeartRate(profile: UserProfile): number {
  return profile.maxHROverride ?? Math.round(HEART_RATE.maxHrBase - HEART_RATE.maxHrAgeFactor * profile.age);
}

export function heartRateReserve(bpm: number, restingHR: number, maxHR: number): number {
  return (bpm - restingHR) / (maxHR - restingHR);
}

// Zone number as an index: 0 = Zone 1 … 4 = Zone 5, or -1 when below Zone 1.
export function zoneIndex(hrr: number): number {
  for (let zone = HEART_RATE.zoneFloors.length - 1; zone >= 0; zone--) {
    if (hrr >= HEART_RATE.zoneFloors[zone]) return zone;
  }
  return -1;
}

// Heart rate for each minute of the window, or null where we don't know it.
// Samples must be sorted. Readings are not interpolated across long gaps.
export function toMinuteSeries(samples: HeartRateSample[], start: number, end: number): (number | null)[] {
  const minuteCount = Math.max(0, Math.floor((end - start) / MS_PER_MINUTE));
  const series: (number | null)[] = new Array(minuteCount).fill(null);
  const maxGapMs = STRAIN.maxInterpolationGapMinutes * MS_PER_MINUTE;

  let next = 0;
  for (let minute = 0; minute < minuteCount; minute++) {
    const ts = start + minute * MS_PER_MINUTE;
    while (next < samples.length && samples[next].ts < ts) next++;
    const after = samples[next];
    const before = samples[next - 1];

    if (after !== undefined && after.ts === ts) {
      series[minute] = after.bpm;
    } else if (before !== undefined && after !== undefined && after.ts - before.ts <= maxGapMs) {
      const fraction = (ts - before.ts) / (after.ts - before.ts);
      series[minute] = before.bpm + (after.bpm - before.bpm) * fraction;
    }
  }
  return series;
}

// Keeps a slice of a sorted array without scanning the whole thing.
// `start` is included, `end` is not.
export function sliceByTime<T>(sorted: T[], getTs: (item: T) => number, start: number, end: number): T[] {
  return sorted.slice(lowerBound(sorted, getTs, start), lowerBound(sorted, getTs, end));
}

function lowerBound<T>(sorted: T[], getTs: (item: T) => number, ts: number): number {
  let low = 0;
  let high = sorted.length;
  while (low < high) {
    const middle = (low + high) >> 1;
    if (getTs(sorted[middle]) < ts) low = middle + 1;
    else high = middle;
  }
  return low;
}
