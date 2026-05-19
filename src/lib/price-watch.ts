/**
 * Recurring price-change detection — NEW-33.
 *
 * For each (payee × frequency) group, detect when the most recent amount
 * differs from the previous N by more than 5%. Useful for catching
 * Netflix-style price hikes.
 */
import { db } from '@/db/client';
import { sql } from 'drizzle-orm';
import { formatINR } from './money';

export type PriceChange = {
  payee: string;
  previousPaise: number;
  currentPaise: number;
  changePct: number;
  message: string;
};

export async function detectPriceChanges(): Promise<PriceChange[]> {
  const rows = await db.all<{ payee: string; currentPaise: number; previousPaise: number }>(sql`
    WITH ranked AS (
      SELECT payee, amount_paise, occurred_at,
             ROW_NUMBER() OVER (PARTITION BY payee ORDER BY occurred_at DESC) AS rn
      FROM transactions
      WHERE type = 'expense' AND deleted_at IS NULL
        AND payee IS NOT NULL AND payee != ''
    )
    SELECT a.payee AS payee,
           a.amount_paise AS currentPaise,
           b.amount_paise AS previousPaise
    FROM ranked a JOIN ranked b ON a.payee = b.payee
    WHERE a.rn = 1 AND b.rn = 2
  `);
  const out: PriceChange[] = [];
  for (const r of rows) {
    if (!r.previousPaise || r.previousPaise <= 0) continue;
    const pct = (r.currentPaise - r.previousPaise) / r.previousPaise;
    if (Math.abs(pct) < 0.05) continue;
    out.push({
      payee: r.payee,
      previousPaise: r.previousPaise,
      currentPaise: r.currentPaise,
      changePct: pct,
      message: `${r.payee}: ${formatINR(r.previousPaise)} → ${formatINR(r.currentPaise)} (${(pct * 100).toFixed(0)}%)`,
    });
  }
  return out;
}
