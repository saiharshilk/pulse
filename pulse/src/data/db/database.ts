import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'pulse.db';
const SCHEMA_VERSION = '3';
// Rows per INSERT. Sending many rows at once is far faster than one async call per row.
const INSERT_CHUNK_ROWS = 400;

const CREATE_TABLES_SQL = `
  CREATE TABLE IF NOT EXISTS heart_rate (ts INTEGER PRIMARY KEY, bpm INTEGER NOT NULL);
  CREATE TABLE IF NOT EXISTS steps (start INTEGER PRIMARY KEY, steps INTEGER, calories REAL, distance REAL);
  CREATE TABLE IF NOT EXISTS spo2_checks (ts INTEGER PRIMARY KEY, percent INTEGER);
  CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT);
`;

let openPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function openAndPrepare(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  await db.execAsync(CREATE_TABLES_SQL);
  // Migrations check this value and upgrade step by step.
  const stored = await db.getFirstAsync<{ value: string }>("SELECT value FROM kv WHERE key = 'schema_version'");
  if (stored?.value === '1' || stored?.value === '2') {
    // Versions 2 and 3: the mock data changed (day plans, then daily step totals).
    // Clear the old readings so the next sync regenerates them.
    await db.execAsync("DELETE FROM heart_rate; DELETE FROM steps; DELETE FROM kv WHERE key = 'lastSyncTs';");
  }
  await db.runAsync('INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?)', 'schema_version', SCHEMA_VERSION);
  return db;
}

// Opens the database once and shares it. A failed open can be retried.
export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (openPromise === null) {
    openPromise = openAndPrepare().catch((error: unknown) => {
      openPromise = null;
      throw error;
    });
  }
  return openPromise;
}

// Inserts rows with INSERT OR IGNORE, so a row that already exists is skipped.
// `table` and `columns` are always fixed strings from our repositories, never user input.
export async function bulkInsert(table: string, columns: string[], rows: number[][]): Promise<void> {
  if (rows.length === 0) return;
  const db = await getDatabase();
  const rowPlaceholder = `(${columns.map(() => '?').join(',')})`;
  const insertSql = (rowCount: number) =>
    `INSERT OR IGNORE INTO ${table} (${columns.join(',')}) VALUES ${Array(rowCount).fill(rowPlaceholder).join(',')}`;

  const insertAll = async (txn: SQLite.SQLiteDatabase) => {
    const fullChunkCount = Math.floor(rows.length / INSERT_CHUNK_ROWS);
    if (fullChunkCount > 0) {
      const statement = await txn.prepareAsync(insertSql(INSERT_CHUNK_ROWS));
      try {
        for (let chunk = 0; chunk < fullChunkCount; chunk++) {
          const first = chunk * INSERT_CHUNK_ROWS;
          await statement.executeAsync(rows.slice(first, first + INSERT_CHUNK_ROWS).flat());
        }
      } finally {
        await statement.finalizeAsync();
      }
    }
    const leftovers = rows.slice(fullChunkCount * INSERT_CHUNK_ROWS);
    if (leftovers.length > 0) {
      await txn.runAsync(insertSql(leftovers.length), leftovers.flat());
    }
  };

  // Exclusive transactions keep other queries out, but expo-sqlite doesn't support them on web.
  // There a normal transaction is fine: syncService never runs two syncs at once.
  if (process.env.EXPO_OS === 'web') {
    await db.withTransactionAsync(() => insertAll(db));
  } else {
    await db.withExclusiveTransactionAsync(insertAll);
  }
}
