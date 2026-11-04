// Pure validation for profile fields. Limits are in the stored metric units.
import type { UserProfile } from '@/types/profile';
import { formatNumber } from '@/utils/format';

export const PROFILE_LIMITS = {
  age: { min: 13, max: 100, unit: 'years' },
  heightCm: { min: 120, max: 230, unit: 'cm' },
  weightKg: { min: 30, max: 250, unit: 'kg' },
  maxHROverride: { min: 120, max: 220, unit: 'bpm' },
  stepGoal: { min: 1000, max: 40000, unit: 'steps' },
  sleepNeedBaselineHours: { min: 6, max: 10, unit: 'hours' },
} as const;

export type NumericProfileField = keyof typeof PROFILE_LIMITS;

export const NAME_MAX_LENGTH = 30;

// Returns a message to show, or null when the value is fine.
export function validateNumber(field: NumericProfileField, value: number): string | null {
  const limit = PROFILE_LIMITS[field];
  if (!Number.isFinite(value)) return 'Enter a number.';
  if (value < limit.min || value > limit.max) {
    return `Enter ${formatNumber(limit.min)}–${formatNumber(limit.max)} ${limit.unit}.`;
  }
  return null;
}

export function validateName(name: string): string | null {
  const trimmed = name.trim();
  if (trimmed.length === 0) return 'Enter a name.';
  if (trimmed.length > NAME_MAX_LENGTH) return `Keep it under ${NAME_MAX_LENGTH} characters.`;
  return null;
}

// Turns typed text into a number, accepting "8.5" and "8,5" and ignoring thousands separators like "10,000".
export function parseNumberInput(text: string): number {
  const cleaned = text.trim().replace(/,(?=\d{3}\b)/g, '').replace(',', '.');
  return cleaned === '' ? Number.NaN : Number(cleaned);
}

// Every problem in a whole profile, keyed by field. Empty means valid.
export function validateProfile(profile: UserProfile): Partial<Record<keyof UserProfile, string>> {
  const errors: Partial<Record<keyof UserProfile, string>> = {};
  const nameError = validateName(profile.name);
  if (nameError !== null) errors.name = nameError;
  for (const field of Object.keys(PROFILE_LIMITS) as NumericProfileField[]) {
    const value = profile[field];
    if (value === null) continue; // max HR left on automatic
    const error = validateNumber(field, value);
    if (error !== null) errors[field] = error;
  }
  return errors;
}
