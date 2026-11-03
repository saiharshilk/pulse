import { DATA_SOURCE, MOCK_SEED, type DataSource } from '@/config/appConfig';

export type Units = 'metric' | 'imperial';

export const HEART_RATE_LOG_INTERVALS = [5, 10, 15, 30, 60] as const;
export type HeartRateLogInterval = (typeof HEART_RATE_LOG_INTERVALS)[number];

export const MOCK_HISTORY_DAY_OPTIONS = [30, 60, 90] as const;
export type MockHistoryDays = (typeof MOCK_HISTORY_DAY_OPTIONS)[number];

// App settings, saved as one JSON value in the kv table. Measurements are always stored metric.
export type AppSettings = {
  units: Units;
  heartRateLog: { enabled: boolean; intervalMinutes: HeartRateLogInterval };
  dataSource: DataSource;
  mockHistoryDays: MockHistoryDays;
  mockSeed: number;
};

export const DEFAULT_SETTINGS: AppSettings = {
  units: 'metric',
  heartRateLog: { enabled: true, intervalMinutes: 5 },
  dataSource: DATA_SOURCE,
  mockHistoryDays: 60,
  mockSeed: MOCK_SEED,
};
