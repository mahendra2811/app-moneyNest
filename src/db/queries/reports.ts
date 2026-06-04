import { sql } from 'drizzle-orm';
import { db } from '../client';
import { startOfMonthLocal, endOfMonthLocal } from '@/lib/date';

export type DailyPoint = { day: string; spent: number; income: number };

export async function getDailySeries(monthRefIso?: string): Promise<DailyPoint[]> {
  const start = startOfMonthLocal(monthRefIso);
  const end = endOfMonthLocal(monthRefIso);
  const rows = await db.all<{ day: string; spent: number; income: number }>(sql`
    SELECT
      SUBSTR(occurred_at, 1, 10) AS day,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount_paise ELSE 0 END), 0) AS spent,
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount_paise ELSE 0 END), 0) AS income
    FROM transactions
    WHERE deleted_at IS NULL
      AND occurred_at BETWEEN ${start} AND ${end}
    GROUP BY day
    ORDER BY day ASC
  `);
  return rows;
}

export type PayeeRow = { payee: string; totalPaise: number; count: number };

export async function getTopPayees(monthRefIso?: string, limit = 5): Promise<PayeeRow[]> {
  const start = startOfMonthLocal(monthRefIso);
  const end = endOfMonthLocal(monthRefIso);
  const rows = await db.all<PayeeRow>(sql`
    SELECT
      COALESCE(payee, '—') AS payee,
      COALESCE(SUM(amount_paise), 0) AS totalPaise,
      COUNT(*) AS count
    FROM transactions
    WHERE deleted_at IS NULL
      AND type = 'expense'
      AND payee IS NOT NULL
      AND payee != ''
      AND occurred_at BETWEEN ${start} AND ${end}
    GROUP BY payee
    ORDER BY totalPaise DESC
    LIMIT ${limit}
  `);
  return rows;
}

export type MonthlyTotal = { ym: string; spent: number; income: number };

export async function getMonthlyTotalsLastN(months = 6): Promise<MonthlyTotal[]> {
  const rows = await db.all<MonthlyTotal>(sql`
    SELECT
      SUBSTR(occurred_at, 1, 7) AS ym,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount_paise ELSE 0 END), 0) AS spent,
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount_paise ELSE 0 END), 0) AS income
    FROM transactions
    WHERE deleted_at IS NULL
    GROUP BY ym
    ORDER BY ym DESC
    LIMIT ${months}
  `);
  return rows.reverse();
}
