/**
 * Duplicate-warning detection — F18.
 *
 * Looks for a transaction with the same amount + same account + within
 * the last 60 seconds.
 */
import { db } from '@/db/client';
import { transactions } from '@/db/schema';
import { and, eq, gte, isNull } from 'drizzle-orm';
import dayjs from 'dayjs';

export async function findRecentDuplicate(opts: {
  amountPaise: number;
  accountId: string;
}): Promise<{ id: string } | null> {
  const cutoff = dayjs().subtract(60, 'second').toISOString();
  const rows = await db
    .select({ id: transactions.id })
    .from(transactions)
    .where(
      and(
        isNull(transactions.deletedAt),
        eq(transactions.amountPaise, opts.amountPaise),
        eq(transactions.accountId, opts.accountId),
        gte(transactions.createdAt, cutoff),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}
