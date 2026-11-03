// Every tunable number behind the mock ring.

export const MOCK_RING = {
  id: 'mock-r02',
  name: 'R02_341C',
  firmware: '3.00.06',
  startBattery: 87,
  scanDelayMs: 1500,
  connectDelayMs: 1000,
  commandDelayMs: 300,
  realtimeIntervalMs: 1000,
  realtimeHeartRate: { center: 72, spread: 8, maxStep: 1.5 },
  realtimeSpO2: { min: 95, max: 99, measuringMs: 5000 },
} as const;

export const MOCK_HISTORY = {
  defaultDays: 60,
  heartRateIntervalMinutes: 5,
  stepBucketMinutes: 15,
  caloriesPerStep: 0.04,
  metersPerStep: 0.75,
  minDailySteps: 4000,
  maxDailySteps: 14000,
  missingReadingChance: 0.02,
  chargingDayChance: 4 / 60,
} as const;

// Clock times are minutes after midnight of the wake-up day; negative = the evening before.
export const MOCK_SLEEP = {
  weeknightBedtime: { min: -90, max: 0 }, // 22:30–00:00
  lateBedtime: { min: -15, max: 30 }, // 23:45–00:30, Fri/Sat nights
  weekdayWake: { min: 390, max: 465 }, // 06:30–07:45
  weekendWake: { min: 450, max: 510 }, // 07:30–08:30
  shortNightChance: 1 / 7,
  shortNightHours: { min: 5, max: 6 },
  shortNightBedtime: { min: 0, max: 30 }, // 00:00–00:30
  shortNightWakeUps: { min: 2, max: 4 },
  normalNightWakeUpChance: 0.3,
  wakeUpMinutes: { min: 5, max: 15 },
  // Wake-ups stay this far from falling asleep and getting up.
  wakeUpEdgeMarginMinutes: 30,
  // How much of its time slot a wake-up's start can drift. Kept small so at least
  // one fully asleep 15-minute bucket always separates two wake-ups.
  wakeUpJitterFraction: 0.2,
} as const;

export const MOCK_HEART_RATE = {
  sleepLow: 47, // the lowest point mid-night
  sleepLowNightlySd: 0.8,
  sleepCurveAmplitude: 7, // how far above the low the U-shape rises at both ends
  sleepNoiseSd: 0.6,
  wakeUpBump: { min: 66, max: 76 },
  restCenter: 69,
  restDrift: 6, // slow up/down swing over the day
  restNoiseSd: 1.5,
  rest: { min: 60, max: 78 },
  walk: { min: 95, max: 105 }, // also used for on-feet time
  workout: { min: 130, max: 175 },
  workoutSpreadSd: 6,
  rampMinutes: 5,
  highStrainNightBump: { min: 3, max: 6 },
  restDayNightDrop: { min: 1, max: 3 },
  // A workout this hard and this long makes the next night's heart rate higher.
  highStrainWorkoutBpm: 150,
  highStrainWorkoutMinutes: 45,
} as const;

export const MOCK_ACTIVITY = {
  workoutDayChance: 0.5, // about 3–4 days a week
  workoutMinutes: { min: 45, max: 70 },
  workoutTargetBpm: { min: 143, max: 158 },
  hardWorkoutChance: 0.25, // of workout days
  hardWorkoutMinutes: { min: 60, max: 75 },
  hardWorkoutTargetBpm: { min: 160, max: 170 },
  walkingDayChance: 0.5, // of days without a workout
  morningWorkoutChance: 0.35,
  morningWorkoutDelayMinutes: { min: 45, max: 90 },
  eveningWorkoutStart: { min: 1020, max: 1140 }, // 17:00–19:00
  walksPerDay: { min: 2, max: 3 },
  walksPerWalkingDay: { min: 3, max: 4 },
  // Total time on your feet (walks plus chores and errands), by kind of day.
  activeMinutes: {
    desk: { min: 70, max: 110 },
    walking: { min: 130, max: 220 },
    workout: { min: 80, max: 110 },
  },
  onFeetBlockMinutes: { min: 15, max: 45 },
  walkMinutes: { min: 15, max: 35 },
  walkEarliestAfterWakeMinutes: 30,
  walkLatestBeforeBedMinutes: 90,
  // Steps per 15-minute bucket while at the desk, per minute otherwise.
  deskStepsPerBucket: { min: 15, max: 60 },
  walkStepsPerMinute: { min: 80, max: 110 },
  onFeetStepsPerMinute: { min: 10, max: 25 },
  workoutStepsPerMinute: { min: 40, max: 90 },
  wakeUpStepsPerBucket: { min: 10, max: 40 },
  chargingStart: { min: 780, max: 960 }, // 13:00–16:00
  chargingMinutes: { min: 60, max: 120 },
} as const;
