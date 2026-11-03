import { parse } from 'date-fns';
import { useEffect, useState } from 'react';

import { getHeartRatesBetween } from '@/data/db/heartRatesRepository';
import { getStepsBetween } from '@/data/db/stepsRepository';
import { useAppStore } from '@/store/appStore';
import type { HeartRateSample, StepSample } from '@/types/raw';
import { localTimeOn } from '@/utils/time';

export type DaySamples = { heartRates: HeartRateSample[]; steps: StepSample[] };

const EMPTY: DaySamples = { heartRates: [], steps: [] };
// Cached per day and per sync, so moving between screens doesn't hit the database again.
const cache = new Map<string, DaySamples>();

// The range covers last night's sleep window (from 18:00 the day before) and the day's strain
// window, which can run past midnight until the next sleep starts (up to 14:00 the next day).
function rangeFor(dayKey: string): { start: number; end: number } {
  const dayStart = parse(dayKey, 'yyyy-MM-dd', new Date()).getTime();
  return { start: localTimeOn(dayStart, -1, 18), end: localTimeOn(dayStart, 1, 14) };
}

export function useDaySamples(dayKey: string | null): DaySamples & { isLoading: boolean } {
  const lastSyncTs = useAppStore((state) => state.lastSyncTs);
  const cacheKey = dayKey === null ? null : `${dayKey}:${lastSyncTs}`;
  const [loaded, setLoaded] = useState<{ key: string; samples: DaySamples } | null>(null);

  useEffect(() => {
    if (dayKey === null || cacheKey === null || cache.has(cacheKey)) return;
    let isCurrent = true; // ignore a slow answer if the day changed meanwhile
    const { start, end } = rangeFor(dayKey);
    Promise.all([getHeartRatesBetween(start, end), getStepsBetween(start, end)])
      .then(([heartRates, steps]) => {
        const samples = { heartRates, steps };
        cache.set(cacheKey, samples);
        if (isCurrent) setLoaded({ key: cacheKey, samples });
      })
      .catch(() => {
        if (isCurrent) setLoaded({ key: cacheKey, samples: EMPTY });
      });
    return () => {
      isCurrent = false;
    };
  }, [dayKey, cacheKey]);

  if (cacheKey === null) return { ...EMPTY, isLoading: false };
  const cached = cache.get(cacheKey) ?? (loaded?.key === cacheKey ? loaded.samples : undefined);
  return cached === undefined ? { ...EMPTY, isLoading: true } : { ...cached, isLoading: false };
}
