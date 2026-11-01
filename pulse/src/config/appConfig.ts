// Central app settings. Rename the app or switch data sources from here.

export type DataSource = 'mock' | 'ring';

export const APP_NAME = 'PULSE';

// Same seed + same "now" always produces the same mock history.
export const MOCK_SEED = 20261101;

export const DATA_SOURCE: DataSource = 'mock';
