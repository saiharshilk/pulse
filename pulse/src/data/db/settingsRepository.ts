import { DEFAULT_SETTINGS, type AppSettings } from '@/types/settings';

import { getMeta, setMeta } from './metaRepository';

const SETTINGS_KEY = 'settings';
const ONBOARDING_KEY = 'onboardingComplete';
const PAIRED_RING_KEY = 'pairedRing';

export async function loadSettings(): Promise<AppSettings> {
  const stored = await getMeta(SETTINGS_KEY);
  if (stored === null) return DEFAULT_SETTINGS;
  // Defaults fill in any setting added after these were saved.
  const parsed = JSON.parse(stored) as Partial<AppSettings>;
  return { ...DEFAULT_SETTINGS, ...parsed, heartRateLog: { ...DEFAULT_SETTINGS.heartRateLog, ...parsed.heartRateLog } };
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await setMeta(SETTINGS_KEY, JSON.stringify(settings));
}

export async function getOnboardingComplete(): Promise<boolean> {
  if ((await getMeta(ONBOARDING_KEY)) === '1') return true;
  // TODO(spec): someone who used the app before onboarding existed already has a paired ring,
  // so they skip onboarding instead of being sent through it on update.
  if ((await getMeta(PAIRED_RING_KEY)) !== null) {
    await setOnboardingComplete();
    return true;
  }
  return false;
}

export async function setOnboardingComplete(): Promise<void> {
  await setMeta(ONBOARDING_KEY, '1');
}
