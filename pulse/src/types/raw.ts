// What we store in SQLite. All timestamps are epoch milliseconds.

export type HeartRateSample = { ts: number; bpm: number }; // never stored when bpm === 0

// A 15-minute bucket from the ring's step log.
export type StepSample = {
  start: number;
  steps: number;
  calories: number; // TODO(ring): verify calorie units with the real ring. Treated as kcal for now.
  distanceMeters: number;
};

export type SpO2SpotCheck = { ts: number; percent: number }; // saved by the app after a live reading
