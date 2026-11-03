import { useMemo, useState } from 'react';

import { useAppStore } from '@/store/appStore';

import type { TrendRange } from './trendMath';
import { TREND_METRICS, type TrendMetricKey } from './trendMetrics';
import { buildTrendDetail } from './trendView';

export function useTrendDetailViewModel(metric: TrendMetricKey, range: TrendRange) {
  const summaries = useAppStore((state) => state.summaries);
  const spo2Checks = useAppStore((state) => state.spo2Checks);
  const profile = useAppStore((state) => state.profile);
  const [now] = useState(() => Date.now());

  const detail = useMemo(
    () => buildTrendDetail(metric, summaries.slice(-range), range, { profile, spo2Checks }, now),
    [metric, summaries, range, profile, spo2Checks, now],
  );
  return { title: TREND_METRICS[metric].title.toUpperCase(), ...detail };
}
