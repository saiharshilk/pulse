import type { StepSample } from '@/types/raw';

import { bulkInsert, getDatabase } from './database';

export async function insertSteps(buckets: StepSample[]): Promise<void> {
  await bulkInsert(
    'steps',
    ['start', 'steps', 'calories', 'distance'],
    buckets.map((b) => [b.start, b.steps, b.calories, b.distanceMeters]),
  );
}

// `start` is included, `end` is not.
export async function getStepsBetween(start: number, end: number): Promise<StepSample[]> {
  const db = await getDatabase();
  return db.getAllAsync<StepSample>(
    'SELECT start, steps, calories, distance AS distanceMeters FROM steps WHERE start >= ? AND start < ? ORDER BY start',
    start,
    end,
  );
}

export async function getAllSteps(): Promise<StepSample[]> {
  const db = await getDatabase();
  return db.getAllAsync<StepSample>(
    'SELECT start, steps, calories, distance AS distanceMeters FROM steps ORDER BY start',
  );
}
