import type { UserProfile } from '@/types/profile';
import type { StepSample } from '@/types/raw';
import { MS_PER_DAY } from '@/utils/time';

import { CALORIES } from './scoringConstants';

// Mifflin-St Jeor: estimated calories burned per day at complete rest.
export function basalMetabolicRate(profile: UserProfile): number {
  return (
    CALORIES.weightFactor * profile.weightKg +
    CALORIES.heightFactor * profile.heightCm -
    CALORIES.ageFactor * profile.age +
    CALORIES.sexOffset[profile.sex]
  );
}

// Resting burn for the part of the day so far, plus the ring's step calories.
export function calculateCalories(
  profile: UserProfile,
  steps: StepSample[],
  dayStart: number,
  now: number,
): number {
  const elapsed = Math.min(1, Math.max(0, (now - dayStart) / MS_PER_DAY));
  const stepCalories = steps.reduce((total, bucket) => total + bucket.calories, 0); // TODO(ring): verify units.
  return Math.round(basalMetabolicRate(profile) * elapsed + stepCalories);
}
