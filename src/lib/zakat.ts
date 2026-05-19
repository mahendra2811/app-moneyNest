/**
 * Zakat / charity / dharma tracker — NEW-37.
 *
 * Tag transactions with `donation:true` in their meta (or via #zakat hashtag
 * in the note), and compute yearly totals + 2.5% Zakat target on net wealth.
 */
import { db } from '@/db/client';
import { sql } from 'drizzle-orm';
import { startOfMonthLocal } from './date';

export async function donationsSinceIso(sinceIso: string): Promise<number> {
  const rows = await db.all<{ total: number | null }>(sql`
    SELECT COALESCE(SUM(amount_paise), 0) AS total
    FROM transactions
    WHERE type = 'expense'
      AND deleted_at IS NULL
      AND occurred_at >= ${sinceIso}
      AND (LOWER(note) LIKE '%#zakat%' OR LOWER(note) LIKE '%#donation%' OR LOWER(note) LIKE '%#charity%' OR LOWER(note) LIKE '%#dharma%')
  `);
  return rows[0]?.total ?? 0;
}

export function zakatTarget(netWealthPaise: number): number {
  return Math.round(netWealthPaise * 0.025);
}

export async function thisYearDonations(): Promise<number> {
  const start = `${new Date().getUTCFullYear()}-01-01T00:00:00.000Z`;
  return donationsSinceIso(start);
}

export async function thisMonthDonations(): Promise<number> {
  return donationsSinceIso(startOfMonthLocal());
}
