/**
 * Bulk / merge operations — F14, F15, F16, F17.
 */
import { db } from '../client';
import { transactions, categories } from '../schema';
import { eq, sql, isNull, and } from 'drizzle-orm';
import { uuidv7 } from '@/lib/id';
import { now } from '@/lib/date';
import { getSetting, setSetting } from './settings';

export async function duplicateTransaction(id: string): Promise<string | null> {
  const rows = await db.select().from(transactions).where(eq(transactions.id, id)).limit(1);
  const tx = rows[0];
  if (!tx) return null;
  const newId = uuidv7();
  const ts = now();
  await db.insert(transactions).values({
    ...tx,
    id: newId,
    createdAt: ts,
    updatedAt: ts,
    occurredAt: ts,
    deletedAt: null,
  });
  return newId;
}

export async function bulkSoftDelete(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  await db
    .update(transactions)
    .set({ deletedAt: now(), updatedAt: now() })
    .where(sql`${transactions.id} IN (${sql.join(ids.map((i) => sql`${i}`), sql`, `)})`);
}

export async function bulkRecategorize(ids: string[], categoryId: string): Promise<void> {
  if (ids.length === 0) return;
  await db
    .update(transactions)
    .set({ categoryId, updatedAt: now() })
    .where(sql`${transactions.id} IN (${sql.join(ids.map((i) => sql`${i}`), sql`, `)})`);
}

export async function mergeCategories(fromId: string, intoId: string): Promise<void> {
  await db
    .update(transactions)
    .set({ categoryId: intoId, updatedAt: now() })
    .where(and(eq(transactions.categoryId, fromId), isNull(transactions.deletedAt)));
  await db.delete(categories).where(eq(categories.id, fromId));
}

export async function mergePayees(fromName: string, intoName: string): Promise<number> {
  const ts = now();
  const result = await db.run(sql`
    UPDATE transactions
    SET payee = ${intoName}, updated_at = ${ts}
    WHERE payee = ${fromName} AND deleted_at IS NULL
  `);
  return result.changes ?? 0;
}

// F17 — payee aliases. Stored as a JSON map.
export type PayeeAlias = { from: string; to: string };

export async function listPayeeAliases(): Promise<PayeeAlias[]> {
  return (await getSetting<PayeeAlias[]>('payees.aliases')) ?? [];
}
export async function setPayeeAlias(a: PayeeAlias): Promise<void> {
  const all = await listPayeeAliases();
  await setSetting('payees.aliases', [...all.filter((x) => x.from !== a.from), a]);
}
export async function applyPayeeAliases(): Promise<number> {
  const all = await listPayeeAliases();
  let touched = 0;
  for (const a of all) {
    touched += await mergePayees(a.from, a.to);
  }
  return touched;
}
