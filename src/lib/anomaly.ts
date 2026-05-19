/**
 * Anomaly detection — B16.
 *
 * On every new expense, compare against the rolling stats (mean + stdev)
 * for that payee or category. If amount is > 3 std-devs above the mean
 * (and there are at least 5 samples), emit a warning.
 */
import { db } from '@/db/client';
import { transactions } from '@/db/schema';
import { and, eq, isNull, sql } from 'drizzle-orm';

export type Anomaly = {
  multiple: number;
  mean: number;
  message: string;
};

export async function detectAnomaly(opts: {
  payee?: string | null;
  categoryId?: string | null;
  amountPaise: number;
}): Promise<Anomaly | null> {
  const conds = [isNull(transactions.deletedAt), eq(transactions.type, 'expense' as const)];
  if (opts.payee) conds.push(eq(transactions.payee, opts.payee));
  else if (opts.categoryId) conds.push(eq(transactions.categoryId, opts.categoryId));
  else return null;

  const rows = await db.all<{ avg: number | null; cnt: number; stdev: number | null }>(sql`
    SELECT AVG(amount_paise) AS avg, COUNT(*) AS cnt,
           CASE WHEN COUNT(*) > 1 THEN (
             SELECT (SUM((amount_paise - subavg.a) * (amount_paise - subavg.a)) / (COUNT(*) - 1.0))
             FROM transactions, (SELECT AVG(amount_paise) AS a FROM transactions WHERE ${and(...conds)}) subavg
             WHERE ${and(...conds)}
           ) ELSE 0 END AS stdev
    FROM transactions
    WHERE ${and(...conds)}
  `);
  const r = rows[0];
  if (!r || !r.cnt || r.cnt < 5 || !r.avg) return null;
  const mean = r.avg;
  const stdev = Math.sqrt(Math.max(0, r.stdev ?? 0));
  if (stdev <= 0) return null;
  const z = (opts.amountPaise - mean) / stdev;
  if (z < 3) return null;
  return {
    multiple: opts.amountPaise / mean,
    mean,
    message: `${opts.amountPaise / mean >= 2 ? `${(opts.amountPaise / mean).toFixed(1)}×` : 'Higher than'} your usual.`,
  };
}
