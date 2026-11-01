import { DEFAULT_PROFILE, type UserProfile } from '@/types/profile';

import { getMeta, setMeta } from './metaRepository';

const PROFILE_KEY = 'profile';

export async function saveProfile(profile: UserProfile): Promise<void> {
  await setMeta(PROFILE_KEY, JSON.stringify(profile));
}

export async function getProfile(): Promise<UserProfile | null> {
  const stored = await getMeta(PROFILE_KEY);
  if (stored === null) return null;
  // Defaults fill in any field added after this profile was saved.
  return { ...DEFAULT_PROFILE, ...(JSON.parse(stored) as Partial<UserProfile>) };
}

export async function loadOrCreateProfile(): Promise<UserProfile> {
  const existing = await getProfile();
  if (existing !== null) return existing;
  await saveProfile(DEFAULT_PROFILE);
  return DEFAULT_PROFILE;
}
