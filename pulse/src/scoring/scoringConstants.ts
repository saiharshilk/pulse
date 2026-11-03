// Every scoring number lives here. These are simple, explainable approximations.

export const EPOCH_MINUTES = 15;

export const SLEEP = {
  windowStartHour: 18, // previous day
  windowEndHour: 14, // this day
  nightLowPercentile: 0.1,
  asleepHrMargin: 10, // bpm above the night's low that still looks asleep
  maxGapEpochs: 2,
  minSessionHours: 3,
  restingWindowSamples: 6,
  strainThreshold: 10,
  strainMinutesPerPoint: 3,
  strainCapMinutes: 45,
  debtFraction: 0.25,
  debtLookbackNights: 3,
  debtCapMinutes: 90,
  consistencyNights: 4,
  edgeMaxSteps: 120, // a bucket with more steps than this can't contain falling asleep or still sleeping
} as const;

export const SLEEP_BANDS = { optimal: 85, sufficient: 70 } as const;

export const RECOVERY = {
  minNights: 4,
  baselineDays: 30,
  sdFloor: 1,
  zClip: 3,
  sleepTermCenter: 85,
  sleepTermScale: 15,
  restingWeight: 0.55,
  sleepingWeight: 0.15,
  sleepWeight: 0.3,
  curveSlope: 1.6,
  curveShift: 0.4,
  minScore: 1,
  maxScore: 99,
  trendFlatSd: 0.25,
} as const;

export const RECOVERY_BANDS = { green: 67, yellow: 34 } as const;

export const STRAIN = {
  maxScore: 21,
  loadScale: 200,
  defaultRestingHR: 60,
  noSleepStartHour: 6,
  noSleepEndHour: 23,
  noSleepEndMinute: 59,
  maxInterpolationGapMinutes: 20,
} as const;

export const STRAIN_BANDS = { moderate: 10, strenuous: 14, allOut: 18 } as const;

export const HEART_RATE = {
  maxHrBase: 208,
  maxHrAgeFactor: 0.7,
  // Lower edge of Zones 1–5, as a fraction of heart-rate reserve.
  zoneFloors: [0.5, 0.6, 0.7, 0.8, 0.9],
  zoneWeights: [1, 2, 3, 4, 5],
  // Everyday movement below Zone 1. Adds strain, but stays out of the zone breakdown.
  lightZone: { floor: 0.3, weight: 0.5 },
} as const;

export const ACTIVITY = {
  minHrr: 0.5,
  minMinutes: 10,
  mergeGapMinutes: 3, // gaps shorter than this are merged
  defaultName: 'Activity',
} as const;

export const CALORIES = {
  weightFactor: 10,
  heightFactor: 6.25,
  ageFactor: 5,
  sexOffset: { male: 5, female: -161, other: -78 },
} as const;

export const HEALTH_MONITOR = {
  minNights: 4,
  rangeSd: 1.5,
} as const;
