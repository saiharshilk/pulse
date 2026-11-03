import { getDatabase } from './database';

export type ActivityNames = Record<string, string>; // activity id (`act-${start}`) → name

export async function getActivityNames(): Promise<ActivityNames> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ id: string; name: string }>('SELECT id, name FROM activity_names');
  return Object.fromEntries(rows.map((row) => [row.id, row.name]));
}

export async function saveActivityName(id: string, name: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('INSERT OR REPLACE INTO activity_names (id, name) VALUES (?, ?)', id, name);
}
