import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import { appConfig } from '@/config/app';
import * as schema from './schema';
import { INIT_SQL } from './migrations/inline';

const sqlite = openDatabaseSync(appConfig.dbName, {
  enableChangeListener: false,
});

export const db = drizzle(sqlite, { schema });

/**
 * Apply pending migrations idempotently. Each migration is a string of
 * SQL statements separated by semicolons. The expo-sqlite `execAsync`
 * runs them all in a single batch.
 */
export async function runMigrations(): Promise<void> {
  await sqlite.execAsync(INIT_SQL);
}

export { schema };
