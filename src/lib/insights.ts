/**
 * Aggregate insight helpers — B7, B8, B17.
 */
import { db } from '@/db/client';
import { sql } from 'drizzle-orm';
import { startOfMonthLocal, endOfMonthLocal, addMonths, now } from './date';

export type DriftReport = {
  categoryId: string;
  categoryName: string;
  thisMonth: number;
  lastMonth: number;
  changePct: number;
};

export async function detectCategoryDrift(): Promise<DriftReport[]> {
  const thisStart = startOfMonthLocal();
  const thisEnd = endOfMonthLocal();
  const lastRef = addMonths(now(), -1);
  const lastStart = startOfMonthLocal(lastRef);
  const lastEnd = endOfMonthLocal(lastRef);
  const rows = await db.all<{
    categoryId: string | null;
    categoryName: string | null;
    thisMonth: number;
    lastMonth: number;
  }>(sql`
    SELECT
      t.category_id AS categoryId,
      c.name AS categoryName,
      COALESCE(SUM(CASE WHEN t.occurred_at BETWEEN ${thisStart} AND ${thisEnd} THEN t.amount_paise ELSE 0 END), 0) AS thisMonth,
      COALESCE(SUM(CASE WHEN t.occurred_at BETWEEN ${lastStart} AND ${lastEnd} THEN t.amount_paise ELSE 0 END), 0) AS lastMonth
    FROM transactions t
    LEFT JOIN categories c ON c.id = t.category_id
    WHERE t.type = 'expense' AND t.deleted_at IS NULL
    GROUP BY t.category_id
  `);
  const out: DriftReport[] = [];
  for (const r of rows) {
    if (!r.categoryId || !r.categoryName) continue;
    if (r.lastMonth <= 0) continue;
    const changePct = (r.thisMonth - r.lastMonth) / r.lastMonth;
    if (Math.abs(changePct) < 0.4) continue;
    out.push({
      categoryId: r.categoryId,
      categoryName: r.categoryName,
      thisMonth: r.thisMonth,
      lastMonth: r.lastMonth,
      changePct,
    });
  }
  return out.sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct));
}

/**
 * Forecast next 30 days based on the last 90 days of expense data.
 */
export async function forecastNext30Days(): Promise<number> {
  const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const rows = await db.all<{ total: number | null }>(sql`
    SELECT COALESCE(SUM(amount_paise), 0) AS total
    FROM transactions
    WHERE type = 'expense'
      AND deleted_at IS NULL
      AND occurred_at >= ${since}
  `);
  const total = rows[0]?.total ?? 0;
  return Math.round((total / 90) * 30);
}

/**
 * Detect payees that look like a recurring subscription:
 * same payee appearing on similar dates across 3+ consecutive months.
 */
export type RecurringSuggestion = {
  payee: string;
  count: number;
  averagePaise: number;
};

export async function detectRecurringCandidates(): Promise<RecurringSuggestion[]> {
  const rows = await db.all<RecurringSuggestion>(sql`
    SELECT payee AS payee, COUNT(DISTINCT SUBSTR(occurred_at, 1, 7)) AS count,
           CAST(AVG(amount_paise) AS INTEGER) AS averagePaise
    FROM transactions
    WHERE type = 'expense'
      AND deleted_at IS NULL
      AND payee IS NOT NULL
      AND payee != ''
      AND recurring_id IS NULL
    GROUP BY payee
    HAVING count >= 3
    ORDER BY count DESC, averagePaise DESC
    LIMIT 10
  `);
  return rows;
}
