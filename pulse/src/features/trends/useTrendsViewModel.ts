import { useMemo } from 'react';

import { useAppStore } from '@/store/appStore';

import type { TrendRange } from './trendMath';
import { TREND_METRIC_KEYS } from './trendMetrics';
import { buildTrendCard } from './trendView';

export function useTrendsViewModel(range: TrendRange) {
  const summaries = useAppStore((state) => state.summaries);
  const spo2Checks = useAppStore((state) => state.spo2Checks);
  const profile = useAppStore((state) => state.profile);

  // Rebuilt only when the data or the range changes, not on every render.
  const cards = useMemo(() => {
    const days = summaries.slice(-range);
    return TREND_METRIC_KEYS.map((metric) => buildTrendCard(metric, days, range, { profile, spo2Checks }));
  }, [summaries, spo2Checks, profile, range]);

  return { cards, hasData: summaries.length > 0 };
}
