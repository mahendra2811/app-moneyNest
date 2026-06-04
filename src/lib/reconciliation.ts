/**
 * Bank-statement reconciliation — E7.
 *
 * Given an imported CSV row set, match each against existing transactions
 * by (date ± 3 days, amount within ₹1, same type). Return matches +
 * unmatched-on-both-sides for the user to triage.
 */
import { db } from '@/db/client';
import { transactions, type Transaction } from '@/db/schema';
import { and, between, isNull } from 'drizzle-orm';
import type { ImportedRow } from './csv-import';
import dayjs from 'dayjs';

export type ReconciliationResult = {
  matched: Array<{ row: ImportedRow; tx: Transaction }>;
  importOnly: ImportedRow[];
  appOnly: Transaction[];
};

export async function reconcile(rows: ImportedRow[]): Promise<ReconciliationResult> {
  if (rows.length === 0) return { matched: [], importOnly: [], appOnly: [] };
  const earliest = rows.reduce((a, r) => (r.occurredAt < a ? r.occurredAt : a), rows[0]!.occurredAt);
  const latest = rows.reduce((a, r) => (r.occurredAt > a ? r.occurredAt : a), rows[0]!.occurredAt);
  const winStart = dayjs(earliest).subtract(3, 'day').toISOString();
  const winEnd = dayjs(latest).add(3, 'day').toISOString();
  const txns = await db
    .select()
    .from(transactions)
    .where(and(isNull(transactions.deletedAt), between(transactions.occurredAt, winStart, winEnd)));

  const matched: ReconciliationResult['matched'] = [];
  const importOnly: ImportedRow[] = [];
  const usedTxIds = new Set<string>();

  for (const row of rows) {
    const candidate = txns.find(
      (t) =>
        !usedTxIds.has(t.id) &&
        t.type === row.type &&
        Math.abs(t.amountPaise - row.amountPaise) <= 100 &&
        Math.abs(dayjs(t.occurredAt).diff(dayjs(row.occurredAt), 'day')) <= 3,
    );
    if (candidate) {
      matched.push({ row, tx: candidate });
      usedTxIds.add(candidate.id);
    } else {
      importOnly.push(row);
    }
  }
  const appOnly = txns.filter((t) => !usedTxIds.has(t.id));
  return { matched, importOnly, appOnly };
}
