import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'pulse.db';
const SCHEMA_VERSION = '1';
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
  // Future migrations check this value and upgrade step by step.
  await db.runAsync('INSERT OR IGNORE INTO kv (key, value) VALUES (?, ?)', 'schema_version', SCHEMA_VERSION);
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

  await db.withExclusiveTransactionAsync(async (txn) => {
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
  });
}
