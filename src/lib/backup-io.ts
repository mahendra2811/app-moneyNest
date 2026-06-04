import { db } from '@/db/client';
import {
  accounts as accountsTbl,
  categories as categoriesTbl,
  transactions as txTbl,
  budgets as budgetsTbl,
  recurring as recurringTbl,
  settings as settingsTbl,
} from '@/db/schema';
import { exportToEncryptedBlob, readEncryptedBlob, type BackupFile, BACKUP_SCHEMA_VERSION } from './backup';
import { now } from './date';

export async function snapshotDatabase(deviceLabel = 'device', appVersion = '1.0.0'): Promise<BackupFile> {
  const [a, c, t, b, r, s] = await Promise.all([
    db.select().from(accountsTbl),
    db.select().from(categoriesTbl),
    db.select().from(txTbl),
    db.select().from(budgetsTbl),
    db.select().from(recurringTbl),
    db.select().from(settingsTbl),
  ]);
  return {
    version: 1,
    appVersion,
    schemaVersion: BACKUP_SCHEMA_VERSION,
    createdAt: now(),
    deviceLabel,
    data: {
      accounts: a,
      categories: c,
      transactions: t,
      budgets: b,
      recurring: r,
      settings: s,
    },
  };
}

export async function restoreFromBackup(file: BackupFile, mode: 'replace' | 'merge'): Promise<void> {
  if (mode === 'replace') {
    await db.delete(txTbl);
    await db.delete(budgetsTbl);
    await db.delete(recurringTbl);
    await db.delete(categoriesTbl);
    await db.delete(accountsTbl);
    await db.delete(settingsTbl);
  }
  for (const row of file.data.accounts) {
    try { await db.insert(accountsTbl).values(row).onConflictDoNothing(); } catch { /* ignore */ }
  }
  for (const row of file.data.categories) {
    try { await db.insert(categoriesTbl).values(row).onConflictDoNothing(); } catch { /* ignore */ }
  }
  for (const row of file.data.transactions) {
    try { await db.insert(txTbl).values(row).onConflictDoNothing(); } catch { /* ignore */ }
  }
  for (const row of file.data.budgets) {
    try { await db.insert(budgetsTbl).values(row).onConflictDoNothing(); } catch { /* ignore */ }
  }
  for (const row of file.data.recurring) {
    try { await db.insert(recurringTbl).values(row).onConflictDoNothing(); } catch { /* ignore */ }
  }
  for (const row of file.data.settings) {
    try { await db.insert(settingsTbl).values(row).onConflictDoNothing(); } catch { /* ignore */ }
  }
}

export { exportToEncryptedBlob, readEncryptedBlob };
export type { BackupFile };
