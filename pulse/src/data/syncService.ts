import { MS_PER_DAY } from '@/utils/time';

import { insertHeartRates } from './db/heartRatesRepository';
import { getLastSyncTs, setLastSyncTs } from './db/metaRepository';
import { insertSteps } from './db/stepsRepository';
import { getProvider } from './providers';
import { cleanSyncBatch } from './syncFilters';

let runningSync: Promise<void> | null = null;

async function runSync(recomputeSummaries: () => Promise<void>, firstSyncDays: number): Promise<void> {
  const now = Date.now();
  const lastSync = await getLastSyncTs();
  const since = lastSync ?? now - firstSyncDays * MS_PER_DAY;

  const batch = await getProvider().syncHistory(since);
  const { heartRates, steps } = cleanSyncBatch(batch);
  await insertHeartRates(heartRates);
  await insertSteps(steps);
  await setLastSyncTs(now);

  await recomputeSummaries();
}

// Pulls new readings from the ring into SQLite, then refreshes the scores.
// If a sync is already running, callers share it instead of starting a second one.
// `firstSyncDays` is how much history to fetch when nothing has been synced yet.
export function sync(recomputeSummaries: () => Promise<void>, firstSyncDays: number): Promise<void> {
  if (runningSync === null) {
    runningSync = runSync(recomputeSummaries, firstSyncDays).finally(() => {
      runningSync = null;
    });
  }
  return runningSync;
}
