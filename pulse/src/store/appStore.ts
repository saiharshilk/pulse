import { create } from 'zustand';

import { applyActivityNames } from '@/data/applyActivityNames';
import { getActivityNames } from '@/data/db/activityNamesRepository';
import { getAllHeartRates } from '@/data/db/heartRatesRepository';
import { getLastSyncTs } from '@/data/db/metaRepository';
import { loadOrCreateProfile } from '@/data/db/profileRepository';
import { getOnboardingComplete, loadSettings } from '@/data/db/settingsRepository';
import { getAllSpO2Checks, insertSpO2Check } from '@/data/db/spo2ChecksRepository';
import { getAllSteps } from '@/data/db/stepsRepository';
import { connectToRing, getConnectionState, getDeviceInfo, onConnectionStateChange } from '@/data/deviceManager';
import { configureProvider } from '@/data/providers';
import * as syncService from '@/data/syncService';
import { computeSummaries } from '@/scoring/scoringEngine';
import { DEFAULT_PROFILE } from '@/types/profile';
import { DEFAULT_SETTINGS, type AppSettings } from '@/types/settings';
import { MS_PER_MINUTE } from '@/utils/time';

import { createDeviceActions } from './deviceActions';
import type { AppState } from './storeTypes';
import { showToast } from './toastStore';

export type { InitStatus } from './storeTypes';

// Returning to the app syncs in the background once the last sync is older than this.
const STALE_SYNC_MS = 15 * MS_PER_MINUTE;

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
    const [heartRates, steps, spo2Checks] = await Promise.all([getAllHeartRates(), getAllSteps(), getAllSpO2Checks()]);
    const scored = computeSummaries({ heartRates, steps, spo2Checks, profile: get().profile, now: Date.now() });
    const summaries = applyActivityNames(scored, get().activityNames);
    const newest = summaries.at(-1);
    const selected = get().selectedDayKey;
    const stillExists = summaries.some((summary) => summary.dayKey === selected);
    set({
      summaries,
      spo2Checks,
      selectedDayKey: stillExists ? selected : newest === undefined ? null : newest.dayKey,
    });
  }

  // Points the app at the provider the settings ask for, and follows its connection state.
  function applyProviderSettings(settings: AppSettings): void {
    configureProvider({ dataSource: settings.dataSource, mockSeed: settings.mockSeed });
    unsubscribeConnection?.();
    unsubscribeConnection = onConnectionStateChange((connection) => set({ connection }));
    set({ connection: getConnectionState() });
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
    onboardingComplete: false,
    summaries: [],
    spo2Checks: [],
    activityNames: {},
    selectedDayKey: null,
    connection: { status: 'disconnected' },
    deviceInfo: null,
    lastSyncTs: null,
    isSyncing: false,
    profile: DEFAULT_PROFILE,
    settings: DEFAULT_SETTINGS,

    init: async () => {
      set({ initStatus: 'loading', initError: null });
      try {
        const [profile, settings, onboardingComplete, activityNames, lastSyncTs] = await Promise.all([
          loadOrCreateProfile(),
          loadSettings(),
          getOnboardingComplete(),
          getActivityNames(),
          getLastSyncTs(),
        ]);
        set({ profile, settings, onboardingComplete, activityNames, lastSyncTs });
        applyProviderSettings(settings);

        // First launch: onboarding pairs the ring and runs the first sync.
        if (!onboardingComplete) {
          set({ initStatus: 'ready' });
          return;
        }

        await connectToRing();
        try {
          await get().sync();
        } catch (error) {
          // With history already saved, a failed sync shouldn't lock you out of the app.
          if (lastSyncTs === null) throw error;
          await recomputeSummaries();
          showToast("Couldn't sync with your ring. Showing saved data.", 'warning');
        }
        set({ initStatus: 'ready' });
      } catch (error) {
        set({ initStatus: 'error', initError: error instanceof Error ? error.message : 'Something went wrong.' });
      }
    },

    // Errors reach the caller, so init() and onboarding can show them.
    sync: async () => {
      set({ isSyncing: true });
      try {
        await syncService.sync(recomputeSummaries, get().settings.mockHistoryDays);
        set({ deviceInfo: await getDeviceInfo(), lastSyncTs: await getLastSyncTs() });
      } finally {
        set({ isSyncing: false });
      }
    },

    // Called when the app comes back to the foreground. Never blocks the UI.
    syncIfStale: () => {
      const { initStatus, onboardingComplete, lastSyncTs, isSyncing } = get();
      if (initStatus !== 'ready' || !onboardingComplete || isSyncing) return;
      if (lastSyncTs !== null && Date.now() - lastSyncTs < STALE_SYNC_MS) return;
      get()
        .sync()
        .catch(() => showToast("Couldn't sync with your ring.", 'warning'));
    },

    // Saves a finished spot check, then refreshes the scores so Health Monitor shows it.
    saveSpO2Check: async (check) => {
      await insertSpO2Check(check);
      await recomputeSummaries();
    },

    selectDay: (dayKey) => set({ selectedDayKey: dayKey }),
    goPrevDay: () => moveSelection(-1),
    goNextDay: () => moveSelection(1),

    ...createDeviceActions({ set, get, recomputeSummaries, applyProviderSettings }),
  };
});
