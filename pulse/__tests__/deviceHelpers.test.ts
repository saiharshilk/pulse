import { applyActivityNames } from '@/data/applyActivityNames';
import { activityIcon } from '@/features/activities/activityIcons';
import { applyEdit } from '@/features/device/profileFields';
import { parseNumberInput, validateName, validateNumber, validateProfile } from '@/features/device/profileValidation';
import { recoveryDialLabel, sleepDialLabel, strainDialLabel } from '@/features/shared/accessibilityLabels';
import type { DailySummary } from '@/types/computed';
import { DEFAULT_PROFILE } from '@/types/profile';
import { formatLastSynced } from '@/utils/format';
import { MS_PER_HOUR, MS_PER_MINUTE } from '@/utils/time';
import { cmToInches, formatDistance, formatHeight, formatWeight, heightFromInput, kgToLb, lbToKg } from '@/utils/units';

describe('profile validation', () => {
  it('checks each range from the spec', () => {
    expect(validateNumber('age', 12)).not.toBeNull();
    expect(validateNumber('age', 13)).toBeNull();
    expect(validateNumber('age', 101)).not.toBeNull();
    expect(validateNumber('heightCm', 119)).not.toBeNull();
    expect(validateNumber('heightCm', 230)).toBeNull();
    expect(validateNumber('weightKg', 29)).not.toBeNull();
    expect(validateNumber('maxHROverride', 221)).not.toBeNull();
    expect(validateNumber('stepGoal', 1000)).toBeNull();
    expect(validateNumber('stepGoal', 40001)).not.toBeNull();
    expect(validateNumber('sleepNeedBaselineHours', 5.5)).not.toBeNull();
    expect(validateNumber('sleepNeedBaselineHours', 8.5)).toBeNull();
    expect(validateNumber('age', Number.NaN)).toBe('Enter a number.');
  });

  it('requires a name', () => {
    expect(validateName('  ')).not.toBeNull();
    expect(validateName('Sam')).toBeNull();
  });

  it('validates a whole profile and allows automatic max HR', () => {
    expect(validateProfile(DEFAULT_PROFILE)).toEqual({});
    expect(Object.keys(validateProfile({ ...DEFAULT_PROFILE, age: 5, weightKg: 300 }))).toEqual(['age', 'weightKg']);
  });

  it('reads typed numbers with commas', () => {
    expect(parseNumberInput('10,000')).toBe(10000);
    expect(parseNumberInput('7,5')).toBe(7.5);
    expect(parseNumberInput('')).toBeNaN();
  });

  it('turns an edit into a saved profile, converting imperial input', () => {
    const edit = applyEdit('heightCm', '69', DEFAULT_PROFILE, 'imperial', false);
    expect('profile' in edit && edit.profile.heightCm).toBe(175);
    expect(applyEdit('age', '9', DEFAULT_PROFILE, 'metric', false)).toEqual({ error: 'Enter 13–100 years.' });
    const auto = applyEdit('maxHROverride', '', { ...DEFAULT_PROFILE, maxHROverride: 190 }, 'metric', true);
    expect('profile' in auto && auto.profile.maxHROverride).toBeNull();
  });
});

describe('units', () => {
  it('converts between metric and imperial', () => {
    expect(cmToInches(2.54)).toBeCloseTo(1);
    expect(kgToLb(1)).toBeCloseTo(2.2046, 3);
    expect(lbToKg(kgToLb(75))).toBeCloseTo(75);
    expect(heightFromInput(69, 'imperial')).toBeCloseTo(175.26);
  });

  it('formats for display', () => {
    expect(formatHeight(175, 'metric')).toBe('175 cm');
    expect(formatHeight(175, 'imperial')).toBe('5 ft 9 in');
    expect(formatWeight(75, 'imperial')).toBe('165 lb');
    expect(formatDistance(7500, 'metric')).toBe('7.5 km');
    expect(formatDistance(7500, 'imperial')).toBe('4.7 mi');
  });
});

describe('last synced text', () => {
  const now = new Date(2026, 10, 3, 12).getTime();
  it('reads naturally at every scale', () => {
    expect(formatLastSynced(null, now)).toBe('Not synced yet');
    expect(formatLastSynced(now - 20_000, now)).toBe('Synced just now');
    expect(formatLastSynced(now - 2 * MS_PER_MINUTE, now)).toBe('Last synced 2 min ago');
    expect(formatLastSynced(now - 3 * MS_PER_HOUR, now)).toBe('Last synced 3 hr ago');
    expect(formatLastSynced(now - 26 * MS_PER_HOUR, now)).toBe('Last synced 1 day ago');
    expect(formatLastSynced(now - 72 * MS_PER_HOUR, now)).toBe('Last synced 3 days ago');
  });
});

describe('activity names', () => {
  const activity = (start: number) => ({ id: `act-${start}`, start, end: start + 1, averageHR: 140, maxHR: 160, strainAdded: 8, name: 'Activity' });
  const day = { dayKey: '2026-11-01', activities: [activity(1), activity(2)] } as unknown as DailySummary;

  it('applies saved names and leaves the rest alone', () => {
    const [named] = applyActivityNames([day], { 'act-2': 'Run' });
    expect(named.activities.map((a) => a.name)).toEqual(['Activity', 'Run']);
    expect(day.activities[1].name).toBe('Activity'); // the original isn't changed
  });

  it('returns the same day object when nothing was renamed', () => {
    expect(applyActivityNames([day], {})[0]).toBe(day);
  });

  it('picks an icon for each preset and a general one otherwise', () => {
    expect(activityIcon('Cycling')).toBe('bicycle');
    expect(activityIcon(' yoga ')).toBe('body');
    expect(activityIcon('Climbing')).toBe('fitness');
  });
});

describe('dial accessibility labels', () => {
  it('describes each dial', () => {
    expect(recoveryDialLabel(72, false)).toBe('Recovery 72 percent, green');
    expect(recoveryDialLabel(null, true)).toBe('Recovery, calibrating');
    expect(sleepDialLabel(64)).toBe('Sleep 64 percent, poor');
    expect(strainDialLabel(12.4)).toBe('Strain 12.4 of 21, moderate');
  });
});
