import type { HeartRateSample } from '@/types/raw';

import { bulkInsert, getDatabase } from './database';

export async function insertHeartRates(samples: HeartRateSample[]): Promise<void> {
  await bulkInsert('heart_rate', ['ts', 'bpm'], samples.map((s) => [s.ts, s.bpm]));
}

export async function getAllHeartRates(): Promise<HeartRateSample[]> {
  const db = await getDatabase();
  return db.getAllAsync<HeartRateSample>('SELECT ts, bpm FROM heart_rate ORDER BY ts');
}

// `start` is included, `end` is not.
export async function getHeartRatesBetween(start: number, end: number): Promise<HeartRateSample[]> {
  const db = await getDatabase();
  return db.getAllAsync<HeartRateSample>(
    'SELECT ts, bpm FROM heart_rate WHERE ts >= ? AND ts < ? ORDER BY ts',
    start,
    end,
  );
}
