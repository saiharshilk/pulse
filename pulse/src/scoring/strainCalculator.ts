import type { StrainMetrics } from '@/types/computed';
import type { HeartRateSample } from '@/types/raw';

import { heartRateReserve, toMinuteSeries, zoneIndex } from './heartRateSeries';
import { HEART_RATE, STRAIN } from './scoringConstants';

export type StrainInput = {
  heartRates: HeartRateSample[]; // sorted, inside the window
  window: { start: number; end: number };
  restingHR: number;
  maxHR: number;
  calories: number;
};

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

// More load always means more strain, but it flattens out and can never pass 21.
export function strainFromLoad(load: number): number {
  return round1(STRAIN.maxScore * (1 - Math.exp(-load / STRAIN.loadScale)));
}

// Load of a minute-by-minute series: minutes × zone weight. Unknown minutes count as zero.
export function loadOfMinutes(minutes: (number | null)[], restingHR: number, maxHR: number): number {
  let load = 0;
  for (const bpm of minutes) {
    if (bpm === null) continue;
    const hrr = heartRateReserve(bpm, restingHR, maxHR);
    const zone = zoneIndex(hrr);
    if (zone >= 0) load += HEART_RATE.zoneWeights[zone];
    else if (hrr >= HEART_RATE.lightZone.floor) load += HEART_RATE.lightZone.weight;
  }
  return load;
}

export function calculateStrain({ heartRates, window, restingHR, maxHR, calories }: StrainInput): StrainMetrics {
  const minutes = toMinuteSeries(heartRates, window.start, window.end);
  const zoneMinutes = HEART_RATE.zoneFloors.map(() => 0);
  let lightMinutes = 0;
  for (const bpm of minutes) {
    if (bpm === null) continue;
    const hrr = heartRateReserve(bpm, restingHR, maxHR);
    const zone = zoneIndex(hrr);
    if (zone >= 0) zoneMinutes[zone] += 1;
    else if (hrr >= HEART_RATE.lightZone.floor) lightMinutes += 1;
  }

  const bpms = heartRates.filter((s) => s.bpm !== 0).map((s) => s.bpm);
  return {
    score: strainFromLoad(loadOfMinutes(minutes, restingHR, maxHR)),
    averageHR: bpms.length === 0 ? 0 : Math.round(bpms.reduce((a, b) => a + b, 0) / bpms.length),
    maxHR: bpms.length === 0 ? 0 : Math.max(...bpms),
    zoneMinutes,
    lightMinutes,
    calories,
    window,
  };
}
