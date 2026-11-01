export type Sex = 'male' | 'female' | 'other';

export type UserProfile = {
  name: string;
  age: number;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  maxHROverride: number | null;
  stepGoal: number;
  sleepNeedBaselineHours: number;
};

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Me',
  age: 30,
  sex: 'male',
  heightCm: 175,
  weightKg: 75,
  maxHROverride: null,
  stepGoal: 10000,
  sleepNeedBaselineHours: 8,
};
