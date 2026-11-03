// Store actions for the Device tab, onboarding and activity names.
import { applyActivityNames } from '@/data/applyActivityNames';
import { saveActivityName } from '@/data/db/activityNamesRepository';
import { clearEverything, clearRawReadings } from '@/data/db/database';
import { saveProfile } from '@/data/db/profileRepository';
import { saveSettings, setOnboardingComplete } from '@/data/db/settingsRepository';
import { connectToRing, disconnectRing, setHeartRateLog, setRingTime } from '@/data/deviceManager';
import { DEFAULT_PROFILE } from '@/types/profile';
import { DEFAULT_SETTINGS, type AppSettings } from '@/types/settings';

import type { DeviceActions, StoreHelpers } from './storeTypes';
import { showToast } from './toastStore';

const MAX_SEED = 2 ** 31;

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong.';
}

export function createDeviceActions({ set, get, recomputeSummaries, applyProviderSettings }: StoreHelpers): DeviceActions {
  async function updateSettings(change: Partial<AppSettings>): Promise<AppSettings> {
    const settings = { ...get().settings, ...change };
    await saveSettings(settings);
    set({ settings });
    return settings;
  }

  return {
    // Scores depend on age, max heart rate and sleep need, so every day is scored again.
    updateProfile: async (profile) => {
      await saveProfile(profile);
      set({ profile });
      if (get().onboardingComplete) await recomputeSummaries();
    },

    setUnits: async (units) => {
      await updateSettings({ units });
    },

    setHeartRateLog: async (enabled, intervalMinutes) => {
      try {
        await setHeartRateLog(enabled, intervalMinutes);
        await updateSettings({ heartRateLog: { enabled, intervalMinutes } });
      } catch (error) {
        showToast(`Couldn't update the ring: ${errorMessage(error)}`, 'warning');
      }
    },

    setRingTime: async () => {
      try {
        await setRingTime(Date.now());
        showToast('Ring time updated', 'success');
      } catch (error) {
        showToast(`Couldn't set the ring time: ${errorMessage(error)}`, 'warning');
      }
    },

    reconnect: async () => {
      try {
        await connectToRing();
      } catch (error) {
        showToast(`Couldn't reconnect: ${errorMessage(error)}`, 'warning');
      }
    },

    // TODO(spec): changing this doesn't re-download history by itself; it applies the next time mock
    // data is regenerated, which avoids a surprise 90-day download from a single tap.
    setMockHistoryDays: async (mockHistoryDays) => {
      await updateSettings({ mockHistoryDays });
    },

    // A new random seed means brand-new mock history.
    regenerateMockData: async () => {
      const settings = await updateSettings({ mockSeed: Math.floor(Math.random() * MAX_SEED) });
      await clearRawReadings();
      applyProviderSettings(settings);
      set({ lastSyncTs: null, summaries: [] });
      try {
        await connectToRing();
        await get().sync();
        showToast('New mock data generated', 'success');
      } catch (error) {
        showToast(`Couldn't sync: ${errorMessage(error)}`, 'warning');
      }
    },

    // Clears the database and settings, then the root layout sends you to onboarding.
    resetEverything: async () => {
      await disconnectRing().catch(() => undefined);
      await clearEverything();
      applyProviderSettings(DEFAULT_SETTINGS);
      set({
        onboardingComplete: false,
        summaries: [],
        spo2Checks: [],
        activityNames: {},
        selectedDayKey: null,
        deviceInfo: null,
        lastSyncTs: null,
        profile: DEFAULT_PROFILE,
        settings: DEFAULT_SETTINGS,
      });
    },

    completeOnboarding: async () => {
      await setOnboardingComplete();
      set({ onboardingComplete: true });
    },

    // Names are applied on top of the scores, so renaming doesn't need a full recompute.
    renameActivity: async (id, name) => {
      await saveActivityName(id, name);
      const activityNames = { ...get().activityNames, [id]: name };
      set({ activityNames, summaries: applyActivityNames(get().summaries, activityNames) });
    },
  };
}
