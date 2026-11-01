// Everything PULSE derives itself from raw ring data.
import type { HeartRateSample, SpO2SpotCheck } from './raw';

export type Trend = 'up' | 'down' | 'flat';

export type SleepEstimate = {
  bedtime: number;
  wakeTime: number;
  timeInBedMs: number;
  timeAsleepMs: number;
  awakeIntervals: { start: number; end: number }[];
  sleepNeededMs: number;
  needBreakdown: { baselineMs: number; strainMs: number; debtMs: number };
  performance: number; // 0–100
  efficiency: number; // 0–100
  consistency: number | null; // 0–100
  restingHR: number;
  averageSleepingHR: number;
};

export type RecoveryMetrics = {
  score: number | null;
  isCalibrating: boolean;
  nightsCollected: number;
  restingHR: number;
  averageSleepingHR: number;
  sleepPerformance: number;
  restingHRTrend: Trend;
  sleepingHRTrend: Trend;
  baseline: {
    restingHRMean: number;
    restingHRSd: number;
    sleepingHRMean: number;
    sleepingHRSd: number;
  } | null;
};

export type StrainMetrics = {
  score: number;
  averageHR: number;
  maxHR: number;
  zoneMinutes: number[];
  calories: number;
  window: { start: number; end: number };
};

export type DetectedActivity = {
  id: string; // `act-${start}`
  start: number;
  end: number;
  averageHR: number;
  maxHR: number;
  strainAdded: number;
  name: string; // defaults to "Activity"
};

export type HealthMonitorState =
  | { kind: 'calibrating' }
  | { kind: 'withinRange' }
  | { kind: 'outOfRange'; count: number };

export type HealthMonitorStatus = {
  state: HealthMonitorState;
  restingHR: number | null;
  averageSleepingHR: number | null;
  lastSpO2: SpO2SpotCheck | null;
};

export type DailySummary = {
  dayKey: string; // 'yyyy-MM-dd' in local time
  dayStart: number;
  sleep: SleepEstimate | null; // the sleep session that ENDED on this day's morning
  recovery: RecoveryMetrics | null;
  strain: StrainMetrics; // from wake until the next sleep onset (or now)
  steps: number;
  calories: number;
  activities: DetectedActivity[];
  healthMonitor: HealthMonitorStatus;
  latestHeartRate: HeartRateSample | null;
};
