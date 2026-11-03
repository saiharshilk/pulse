import Constants from 'expo-constants';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { MOCK_RING } from '@/data/mock/mockConstants';
import { useAppStore } from '@/store/appStore';
import { colors } from '@/theme/colors';
import type { ConnectionState } from '@/types/provider';
import { formatLastSynced, NO_VALUE } from '@/utils/format';

const LAST_SYNCED_REFRESH_MS = 30_000;
export const LOW_BATTERY_PERCENT = 20;

function statusOf(connection: ConnectionState): { label: string; color: string; detail: string | null } {
  switch (connection.status) {
    case 'connected':
      return { label: 'Connected', color: colors.good, detail: null };
    case 'connecting':
    case 'scanning':
      return { label: 'Connecting…', color: colors.link, detail: null };
    case 'failed':
      return { label: 'Failed', color: colors.warn, detail: connection.message };
    case 'disconnected':
      return { label: 'Disconnected', color: colors.textTertiary, detail: null };
  }
}

export function useDeviceViewModel() {
  const connection = useAppStore((state) => state.connection);
  const deviceInfo = useAppStore((state) => state.deviceInfo);
  const lastSyncTs = useAppStore((state) => state.lastSyncTs);
  const isSyncing = useAppStore((state) => state.isSyncing);
  const [now, setNow] = useState(() => Date.now());

  // "Last synced 2 min ago" stays true while the tab is open.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), LAST_SYNCED_REFRESH_MS);
    return () => clearInterval(timer);
  }, []);

  const battery = deviceInfo?.batteryPercent ?? null;
  const config = Constants.expoConfig;
  return {
    ringName: deviceInfo?.name ?? MOCK_RING.name,
    status: statusOf(connection),
    canReconnect: connection.status === 'disconnected' || connection.status === 'failed',
    batteryText: battery === null ? NO_VALUE : `${battery}%`,
    batteryIcon: battery === null || battery > 60 ? 'battery-full' : battery > LOW_BATTERY_PERCENT ? 'battery-half' : 'battery-dead',
    batteryColor: battery !== null && battery < LOW_BATTERY_PERCENT ? colors.warn : colors.textSecondary,
    firmwareText: deviceInfo?.firmware === undefined ? NO_VALUE : `Firmware ${deviceInfo.firmware}`,
    lastSyncedText: formatLastSynced(lastSyncTs, now),
    isSyncing,
    versionText: `Version ${config?.version ?? NO_VALUE} · ${Platform.OS} ${String(Platform.Version)}`,
    buildText: `Expo SDK ${config?.sdkVersion ?? NO_VALUE} · ${Constants.executionEnvironment}`,
  } as const;
}
