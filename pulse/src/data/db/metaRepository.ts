// Small key/value settings stored in the `kv` table.
import { getDatabase } from './database';

const LAST_SYNC_KEY = 'lastSyncTs';

export async function getMeta(key: string): Promise<string | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM kv WHERE key = ?', key);
  return row === null ? null : row.value;
}

export async function setMeta(key: string, value: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?)', key, value);
}

export async function getLastSyncTs(): Promise<number | null> {
  const value = await getMeta(LAST_SYNC_KEY);
  return value === null ? null : Number(value);
}

export async function setLastSyncTs(ts: number): Promise<void> {
  await setMeta(LAST_SYNC_KEY, String(ts));
}
