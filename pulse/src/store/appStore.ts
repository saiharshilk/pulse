import { create } from 'zustand';

import { getAllHeartRates } from '@/data/db/heartRatesRepository';
import { getLastSyncTs } from '@/data/db/metaRepository';
import { loadOrCreateProfile } from '@/data/db/profileRepository';
import { getAllSpO2Checks, insertSpO2Check } from '@/data/db/spo2ChecksRepository';
import { getAllSteps } from '@/data/db/stepsRepository';
import { connectToRing, getConnectionState, getDeviceInfo, onConnectionStateChange } from '@/data/deviceManager';
import * as syncService from '@/data/syncService';
import { computeSummaries } from '@/scoring/scoringEngine';
import type { DailySummary } from '@/types/computed';
import { DEFAULT_PROFILE, type UserProfile } from '@/types/profile';
import type { ConnectionState, DeviceInfo } from '@/types/provider';
import type { SpO2SpotCheck } from '@/types/raw';

export type InitStatus = 'loading' | 'ready' | 'error';

type AppState = {
  initStatus: InitStatus;
  initError: string | null;
  summaries: DailySummary[]; // oldest → newest
  spo2Checks: SpO2SpotCheck[]; // oldest → newest
  selectedDayKey: string | null;
  connection: ConnectionState;
  deviceInfo: DeviceInfo | null;
  lastSyncTs: number | null;
  isSyncing: boolean;
  profile: UserProfile;
  init: () => Promise<void>;
  sync: () => Promise<void>;
  saveSpO2Check: (check: SpO2SpotCheck) => Promise<void>;
  selectDay: (dayKey: string) => void;
  goPrevDay: () => void;
  goNextDay: () => void;
};

// Lets the current frame finish first, so scoring doesn't interrupt a touch or an animation.
// TODO(spec): the prompt suggests InteractionManager, but React Native 0.88 removed it.
function afterCurrentFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => setTimeout(resolve, 0));
  });
}

let unsubscribeConnection: (() => void) | null = null;

export const useAppStore = create<AppState>()((set, get) => {
  async function recomputeSummaries(): Promise<void> {
    await afterCurrentFrame();
    const [heartRates, steps, spo2Checks] = await Promise.all([
      getAllHeartRates(),
      getAllSteps(),
      getAllSpO2Checks(),
    ]);
    const summaries = computeSummaries({
      heartRates,
      steps,
      spo2Checks,
      profile: get().profile,
      now: Date.now(),
    });
    const newest = summaries.at(-1);
    const selected = get().selectedDayKey;
    const stillExists = summaries.some((summary) => summary.dayKey === selected);
    set({
      summaries,
      spo2Checks,
      selectedDayKey: stillExists ? selected : newest === undefined ? null : newest.dayKey,
    });
  }

  function moveSelection(step: -1 | 1): void {
    const { summaries, selectedDayKey } = get();
    const index = summaries.findIndex((summary) => summary.dayKey === selectedDayKey);
    const target = summaries[index + step];
    if (index >= 0 && target !== undefined) set({ selectedDayKey: target.dayKey });
  }

  return {
    initStatus: 'loading',
    initError: null,
    summaries: [],
    spo2Checks: [],
    selectedDayKey: null,
    connection: { status: 'disconnected' },
    deviceInfo: null,
    lastSyncTs: null,
    isSyncing: false,
    profile: DEFAULT_PROFILE,

    init: async () => {
      set({ initStatus: 'loading', initError: null });
      try {
        const profile = await loadOrCreateProfile();
        set({ profile, connection: getConnectionState() });

        unsubscribeConnection?.();
        unsubscribeConnection = onConnectionStateChange((connection) => set({ connection }));

        await connectToRing();
        await get().sync();
        set({ initStatus: 'ready' });
      } catch (error) {
        set({
          initStatus: 'error',
          initError: error instanceof Error ? error.message : 'Something went wrong.',
        });
      }
    },

    // Errors reach the caller, so init() can show its error view.
    sync: async () => {
      set({ isSyncing: true });
      try {
        await syncService.sync(recomputeSummaries);
        set({ deviceInfo: await getDeviceInfo(), lastSyncTs: await getLastSyncTs() });
      } finally {
        set({ isSyncing: false });
      }
    },

    // Saves a finished spot check, then refreshes the scores so Health Monitor shows it.
    saveSpO2Check: async (check) => {
      await insertSpO2Check(check);
      await recomputeSummaries();
    },

    selectDay: (dayKey) => set({ selectedDayKey: dayKey }),
    goPrevDay: () => moveSelection(-1),
    goNextDay: () => moveSelection(1),
  };
});
