// How each profile row is shown, edited and validated.
import { maxHeartRate } from '@/scoring/heartRateSeries';
import type { Sex, UserProfile } from '@/types/profile';
import type { Units } from '@/types/settings';
import { formatNumber } from '@/utils/format';
import {
  formatHeight,
  formatWeight,
  heightForInput,
  heightFromInput,
  weightForInput,
  weightFromInput,
} from '@/utils/units';

import { parseNumberInput, validateName, validateNumber } from './profileValidation';

export type ProfileFieldKey =
  | 'name'
  | 'age'
  | 'sex'
  | 'heightCm'
  | 'weightKg'
  | 'maxHROverride'
  | 'stepGoal'
  | 'sleepNeedBaselineHours';

export const PROFILE_FIELD_ORDER: ProfileFieldKey[] = [
  'name',
  'age',
  'sex',
  'heightCm',
  'weightKg',
  'maxHROverride',
  'stepGoal',
  'sleepNeedBaselineHours',
];

export const SEX_OPTIONS: { key: Sex; label: string }[] = [
  { key: 'male', label: 'Male' },
  { key: 'female', label: 'Female' },
  { key: 'other', label: 'Other' },
];

export const FIELD_LABELS: Record<ProfileFieldKey, string> = {
  name: 'Name',
  age: 'Age',
  sex: 'Sex',
  heightCm: 'Height',
  weightKg: 'Weight',
  maxHROverride: 'Max HR',
  stepGoal: 'Step goal',
  sleepNeedBaselineHours: 'Sleep need',
};

export function displayValue(field: ProfileFieldKey, profile: UserProfile, units: Units): string {
  switch (field) {
    case 'name':
      return profile.name;
    case 'age':
      return `${profile.age}`;
    case 'sex':
      return SEX_OPTIONS.find((option) => option.key === profile.sex)?.label ?? profile.sex;
    case 'heightCm':
      return formatHeight(profile.heightCm, units);
    case 'weightKg':
      return formatWeight(profile.weightKg, units);
    case 'maxHROverride':
      return profile.maxHROverride === null ? `Auto (${maxHeartRate(profile)} bpm)` : `${profile.maxHROverride} bpm`;
    case 'stepGoal':
      return formatNumber(profile.stepGoal);
    case 'sleepNeedBaselineHours':
      return `${profile.sleepNeedBaselineHours} h`;
  }
}

export function inputUnit(field: ProfileFieldKey, units: Units): string {
  if (field === 'heightCm') return units === 'metric' ? 'cm' : 'in';
  if (field === 'weightKg') return units === 'metric' ? 'kg' : 'lb';
  if (field === 'maxHROverride') return 'bpm';
  if (field === 'sleepNeedBaselineHours') return 'hours';
  if (field === 'age') return 'years';
  return '';
}

// What the text field starts with.
export function initialInput(field: ProfileFieldKey, profile: UserProfile, units: Units): string {
  switch (field) {
    case 'name':
      return profile.name;
    case 'heightCm':
      return `${heightForInput(profile.heightCm, units)}`;
    case 'weightKg':
      return `${weightForInput(profile.weightKg, units)}`;
    case 'maxHROverride':
      return `${profile.maxHROverride ?? maxHeartRate(profile)}`;
    case 'sex':
      return profile.sex;
    default:
      return `${profile[field]}`;
  }
}

export type EditResult = { profile: UserProfile } | { error: string };

// Turns what was typed into an updated profile, or an error message to show.
export function applyEdit(
  field: ProfileFieldKey,
  text: string,
  profile: UserProfile,
  units: Units,
  isAutoMaxHR: boolean,
): EditResult {
  if (field === 'name') {
    const error = validateName(text);
    return error === null ? { profile: { ...profile, name: text.trim() } } : { error };
  }
  if (field === 'sex') return { profile: { ...profile, sex: text as Sex } };
  if (field === 'maxHROverride' && isAutoMaxHR) return { profile: { ...profile, maxHROverride: null } };

  const typed = parseNumberInput(text);
  let value = typed;
  if (field === 'heightCm') value = heightFromInput(typed, units);
  if (field === 'weightKg') value = weightFromInput(typed, units);
  const error = validateNumber(field, value);
  if (error !== null) return { error };
  const rounded = field === 'sleepNeedBaselineHours' ? Math.round(value * 4) / 4 : Math.round(value);
  return { profile: { ...profile, [field]: rounded } };
}
