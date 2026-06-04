/**
 * Weekly digest — B9.
 * Yearly recap — B10 (returns the data; the screen renders it).
 */
import { db } from '@/db/client';
import { sql } from 'drizzle-orm';
import { notificationsService } from '@/platform/notifications';
import { getSetting, setSetting } from '@/db/queries/settings';
import { formatINRShort } from './money';
import dayjs from 'dayjs';

export async function weeklyDigest(): Promise<{
  spent: number;
  income: number;
  topCategory: string | null;
} | null> {
  const since = dayjs().subtract(7, 'day').toISOString();
  const rows = await db.all<{ spent: number | null; income: number | null }>(sql`
    SELECT
      COALESCE(SUM(CASE WHEN type='expense' THEN amount_paise ELSE 0 END),0) AS spent,
      COALESCE(SUM(CASE WHEN type='income' THEN amount_paise ELSE 0 END),0) AS income
    FROM transactions
    WHERE deleted_at IS NULL
      AND occurred_at >= ${since}
  `);
  const top = await db.all<{ name: string | null }>(sql`
    SELECT c.name AS name
    FROM transactions t LEFT JOIN categories c ON c.id = t.category_id
    WHERE t.type = 'expense' AND t.deleted_at IS NULL AND t.occurred_at >= ${since}
    GROUP BY t.category_id ORDER BY SUM(t.amount_paise) DESC LIMIT 1
  `);
  return {
    spent: rows[0]?.spent ?? 0,
    income: rows[0]?.income ?? 0,
    topCategory: top[0]?.name ?? null,
  };
}

/** Fire a weekly notification if not fired this calendar week. */
export async function maybeFireWeeklyDigest(): Promise<void> {
  const isoWeek = dayjs().format('YYYY-WW');
  const lastFired = await getSetting<string>('digest.lastWeek');
  if (lastFired === isoWeek) return;
  const d = await weeklyDigest();
  if (!d) return;
  await notificationsService.scheduleLocal({
    title: 'Last 7 days',
    body: `Spent ${formatINRShort(d.spent)}, income ${formatINRShort(d.income)}${d.topCategory ? ` · top: ${d.topCategory}` : ''}`,
  });
  await setSetting('digest.lastWeek', isoWeek);
}

export type YearlyRecap = {
  year: string;
  totalSpent: number;
  totalIncome: number;
  topCategories: { name: string; total: number }[];
  topPayees: { payee: string; total: number }[];
  busiestMonth: { ym: string; spent: number } | null;
  transactionCount: number;
};

export async function yearlyRecap(year?: string): Promise<YearlyRecap> {
  const y = year ?? String(new Date().getUTCFullYear());
  const start = `${y}-01-01T00:00:00.000Z`;
  const end = `${y}-12-31T23:59:59.999Z`;
  const totals = await db.all<{ spent: number | null; income: number | null; cnt: number }>(sql`
    SELECT
      COALESCE(SUM(CASE WHEN type='expense' THEN amount_paise ELSE 0 END),0) AS spent,
      COALESCE(SUM(CASE WHEN type='income' THEN amount_paise ELSE 0 END),0) AS income,
      COUNT(*) AS cnt
    FROM transactions WHERE deleted_at IS NULL AND occurred_at BETWEEN ${start} AND ${end}
  `);
  const cats = await db.all<{ name: string; total: number }>(sql`
    SELECT c.name AS name, SUM(t.amount_paise) AS total
    FROM transactions t JOIN categories c ON c.id = t.category_id
    WHERE t.type = 'expense' AND t.deleted_at IS NULL
      AND t.occurred_at BETWEEN ${start} AND ${end}
    GROUP BY c.id ORDER BY total DESC LIMIT 5
  `);
  const payees = await db.all<{ payee: string; total: number }>(sql`
    SELECT payee, SUM(amount_paise) AS total
    FROM transactions
    WHERE type='expense' AND deleted_at IS NULL AND payee IS NOT NULL AND payee != ''
      AND occurred_at BETWEEN ${start} AND ${end}
    GROUP BY payee ORDER BY total DESC LIMIT 5
  `);
  const busiest = await db.all<{ ym: string; spent: number }>(sql`
    SELECT SUBSTR(occurred_at,1,7) AS ym, SUM(amount_paise) AS spent
    FROM transactions WHERE type='expense' AND deleted_at IS NULL
      AND occurred_at BETWEEN ${start} AND ${end}
    GROUP BY ym ORDER BY spent DESC LIMIT 1
  `);
  return {
    year: y,
    totalSpent: totals[0]?.spent ?? 0,
    totalIncome: totals[0]?.income ?? 0,
    topCategories: cats,
    topPayees: payees,
    busiestMonth: busiest[0] ?? null,
    transactionCount: totals[0]?.cnt ?? 0,
  };
}
