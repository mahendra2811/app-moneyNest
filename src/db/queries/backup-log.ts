/**
 * Backup history view — E6. Insert per-export, list for the UI.
 */
import { db } from '../client';
import { backupLog, type BackupLogEntry } from '../schema';
import { desc } from 'drizzle-orm';
import { uuidv7 } from '@/lib/id';
import { now } from '@/lib/date';

export async function logBackup(opts: {
  filePath: string;
  sizeBytes: number;
  isEncrypted: boolean;
  txnCount: number;
}): Promise<void> {
  await db.insert(backupLog).values({
    id: uuidv7(),
    filePath: opts.filePath,
    sizeBytes: opts.sizeBytes,
    isEncrypted: opts.isEncrypted,
    txnCount: opts.txnCount,
    createdAt: now(),
  });
}

export async function listBackupLogs(): Promise<BackupLogEntry[]> {
  return db.select().from(backupLog).orderBy(desc(backupLog.createdAt));
}
