import { MS_PER_DAY } from '@/utils/time';

import { insertHeartRates } from './db/heartRatesRepository';
import { getLastSyncTs, setLastSyncTs } from './db/metaRepository';
import { insertSteps } from './db/stepsRepository';
import { getProvider } from './providers';
import { cleanSyncBatch } from './syncFilters';

const FIRST_SYNC_DAYS = 60;

let runningSync: Promise<void> | null = null;

async function runSync(recomputeSummaries: () => Promise<void>): Promise<void> {
  const now = Date.now();
  const lastSync = await getLastSyncTs();
  const since = lastSync ?? now - FIRST_SYNC_DAYS * MS_PER_DAY;

  const batch = await getProvider().syncHistory(since);
  const { heartRates, steps } = cleanSyncBatch(batch);
  await insertHeartRates(heartRates);
  await insertSteps(steps);
  await setLastSyncTs(now);

  await recomputeSummaries();
}

// Pulls new readings from the ring into SQLite, then refreshes the scores.
// If a sync is already running, callers share it instead of starting a second one.
export function sync(recomputeSummaries: () => Promise<void>): Promise<void> {
  if (runningSync === null) {
    runningSync = runSync(recomputeSummaries).finally(() => {
      runningSync = null;
    });
  }
  return runningSync;
}
