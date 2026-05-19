/**
 * Trash / recently-deleted view — F13.
 *
 * Lists soft-deleted transactions with restore action. Permanent delete
 * is admin-only (Settings → Danger zone).
 */
import { db } from '../client';
import { transactions, type Transaction } from '../schema';
import { desc, isNotNull, eq } from 'drizzle-orm';
import { now } from '@/lib/date';

export async function listTrash(): Promise<Transaction[]> {
  return db
    .select()
    .from(transactions)
    .where(isNotNull(transactions.deletedAt))
    .orderBy(desc(transactions.deletedAt));
}

export async function restoreFromTrash(id: string): Promise<void> {
  await db.update(transactions).set({ deletedAt: null, updatedAt: now() }).where(eq(transactions.id, id));
}

export async function purgeTrash(): Promise<number> {
  const rows = await listTrash();
  for (const r of rows) {
    await db.delete(transactions).where(eq(transactions.id, r.id));
  }
  return rows.length;
}
