// Pure clean-up of raw ring data before it is stored. Kept apart from syncService
// so tests can run it without a database.
import type { HeartRateReading, RingSyncBatch } from '@/types/provider';
import type { HeartRateSample, StepSample } from '@/types/raw';

// The ring logs 0 bpm when it has no reading (off finger, charging). 0 always means missing.
export function dropMissingHeartRates(readings: HeartRateReading[]): HeartRateSample[] {
  return readings.filter((reading) => reading.bpm !== 0);
}

function uniqueBy<T>(items: T[], getKey: (item: T) => number): T[] {
  const seen = new Set<number>();
  return items.filter((item) => {
    const key = getKey(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function cleanSyncBatch(batch: RingSyncBatch): {
  heartRates: HeartRateSample[];
  steps: StepSample[];
} {
  return {
    heartRates: uniqueBy(dropMissingHeartRates(batch.heartRates), (sample) => sample.ts),
    steps: uniqueBy(batch.steps, (bucket) => bucket.start),
  };
}
