import type { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

type IconName = ComponentProps<typeof Ionicons>['name'];

export const ACTIVITY_PRESETS = ['Walk', 'Run', 'Cycling', 'Strength', 'Sport', 'Yoga', 'Other'] as const;
export const ACTIVITY_NAME_MAX_LENGTH = 24;

const ICONS: Record<string, IconName> = {
  walk: 'walk',
  run: 'footsteps',
  cycling: 'bicycle',
  strength: 'barbell',
  sport: 'football',
  yoga: 'body',
  other: 'fitness',
};

// An icon to match the activity's name; custom names get a general fitness icon.
export function activityIcon(name: string): IconName {
  return ICONS[name.trim().toLowerCase()] ?? 'fitness';
}
