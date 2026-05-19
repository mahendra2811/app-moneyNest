import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import { appConfig } from '@/config/app';
import * as schema from './schema';

const sqlite = openDatabaseSync(appConfig.dbName, {
  enableChangeListener: false,
});

export const db = drizzle(sqlite, { schema });

/**
 * Phase 0 — empty migrations list. Phase 1 wires drizzle-kit output.
 * Until then, this runner is a no-op that confirms the DB opens.
 */
export async function runMigrations(): Promise<void> {
  // Placeholder. Drizzle-kit generated SQL will be applied here in Phase 1.
}

export { schema };
