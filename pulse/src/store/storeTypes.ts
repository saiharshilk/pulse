import type { ActivityNames } from '@/data/db/activityNamesRepository';
import type { DailySummary } from '@/types/computed';
import type { UserProfile } from '@/types/profile';
import type { ConnectionState, DeviceInfo } from '@/types/provider';
import type { SpO2SpotCheck } from '@/types/raw';
import type { AppSettings, HeartRateLogInterval, MockHistoryDays, Units } from '@/types/settings';

export type InitStatus = 'loading' | 'ready' | 'error';

export type DeviceActions = {
  updateProfile: (profile: UserProfile) => Promise<void>;
  setUnits: (units: Units) => Promise<void>;
  setHeartRateLog: (enabled: boolean, intervalMinutes: HeartRateLogInterval) => Promise<void>;
  setRingTime: () => Promise<void>;
  reconnect: () => Promise<void>;
  setMockHistoryDays: (days: MockHistoryDays) => Promise<void>;
  regenerateMockData: () => Promise<void>;
  resetEverything: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  renameActivity: (id: string, name: string) => Promise<void>;
};

export type AppState = DeviceActions & {
  initStatus: InitStatus;
  initError: string | null;
  onboardingComplete: boolean;
  summaries: DailySummary[]; // oldest → newest, with activity names applied
  spo2Checks: SpO2SpotCheck[]; // oldest → newest
  activityNames: ActivityNames;
  selectedDayKey: string | null;
  connection: ConnectionState;
  deviceInfo: DeviceInfo | null;
  lastSyncTs: number | null;
  isSyncing: boolean;
  profile: UserProfile;
  settings: AppSettings;
  init: () => Promise<void>;
  sync: () => Promise<void>;
  syncIfStale: () => void;
  saveSpO2Check: (check: SpO2SpotCheck) => Promise<void>;
  selectDay: (dayKey: string) => void;
  goPrevDay: () => void;
  goNextDay: () => void;
};

export type SetState = (partial: Partial<AppState>) => void;
export type GetState = () => AppState;

// Shared helpers the store passes to its action modules.
export type StoreHelpers = {
  set: SetState;
  get: GetState;
  recomputeSummaries: () => Promise<void>;
  applyProviderSettings: (settings: AppSettings) => void;
};
