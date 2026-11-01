import { useCallback, useEffect, useState } from 'react';

import { useAppStore } from '@/store/appStore';
import { layout } from '@/theme/layout';
import { NO_VALUE } from '@/utils/format';
import { downsampleAverage } from '@/utils/series';
import { MS_PER_MINUTE } from '@/utils/time';

import { buildHomeView } from './homeView';
import { useDayHeartRates } from './useDayHeartRates';

// The current time, updated once a minute so "x min ago" stays true.
function useNow(): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), MS_PER_MINUTE);
    return () => clearInterval(timer);
  }, []);
  return now;
}

export function useHomeViewModel() {
  const summaries = useAppStore((state) => state.summaries);
  const selectedDayKey = useAppStore((state) => state.selectedDayKey);
  const profile = useAppStore((state) => state.profile);
  const deviceInfo = useAppStore((state) => state.deviceInfo);
  const connection = useAppStore((state) => state.connection);
  const lastSyncTs = useAppStore((state) => state.lastSyncTs);
  const sync = useAppStore((state) => state.sync);
  const goPrevDay = useAppStore((state) => state.goPrevDay);
  const goNextDay = useAppStore((state) => state.goNextDay);

  const now = useNow();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshFailed, setRefreshFailed] = useState(false);

  const selectedIndex = summaries.findIndex((summary) => summary.dayKey === selectedDayKey);
  const summary = summaries[selectedIndex] ?? null;
  const samples = useDayHeartRates(summary?.dayStart ?? null, lastSyncTs);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    setRefreshFailed(false);
    try {
      await sync();
    } catch {
      setRefreshFailed(true);
    } finally {
      setIsRefreshing(false);
    }
  }, [sync]);

  return {
    ...buildHomeView(summary, profile, now),
    dayKey: selectedDayKey,
    canPrev: selectedIndex > 0,
    canNext: selectedIndex >= 0 && selectedIndex < summaries.length - 1,
    goPrevDay,
    goNextDay,
    batteryLabel: deviceInfo === null ? NO_VALUE : `${deviceInfo.batteryPercent}%`,
    isRingConnected: connection.status === 'connected',
    sparklineValues: downsampleAverage(samples.map((sample) => sample.bpm), layout.sparklineMaxPoints),
    isRefreshing,
    refreshErrorText: refreshFailed ? "Couldn't sync. Pull down to try again." : null,
    refresh,
  };
}
