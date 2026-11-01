import type { SpO2SpotCheck } from '@/types/raw';

import { bulkInsert, getDatabase } from './database';

export async function insertSpO2Check(check: SpO2SpotCheck): Promise<void> {
  await bulkInsert('spo2_checks', ['ts', 'percent'], [[check.ts, check.percent]]);
}

export async function getAllSpO2Checks(): Promise<SpO2SpotCheck[]> {
  const db = await getDatabase();
  return db.getAllAsync<SpO2SpotCheck>('SELECT ts, percent FROM spo2_checks ORDER BY ts');
}
