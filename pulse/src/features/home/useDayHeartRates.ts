import { useEffect, useState } from 'react';

import { getHeartRatesBetween } from '@/data/db/heartRatesRepository';
import type { HeartRateSample } from '@/types/raw';
import { addDaysTs } from '@/utils/time';

// Loads one day's heart-rate samples for the sparkline.
// `refreshKey` reloads them after a sync brings in new readings.
export function useDayHeartRates(dayStart: number | null, refreshKey: number | null): HeartRateSample[] {
  const [samples, setSamples] = useState<HeartRateSample[]>([]);

  useEffect(() => {
    if (dayStart === null) return;
    let isCurrent = true; // ignore a slow answer if the user has already moved to another day
    getHeartRatesBetween(dayStart, addDaysTs(dayStart, 1))
      .then((loaded) => {
        if (isCurrent) setSamples(loaded);
      })
      .catch(() => {
        if (isCurrent) setSamples([]);
      });
    return () => {
      isCurrent = false;
    };
  }, [dayStart, refreshKey]);

  return samples;
}
