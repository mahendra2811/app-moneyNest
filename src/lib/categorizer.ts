/**
 * Local frequency-based categorizer — A11.
 *
 * For a given payee/note, find the most common category in the user's
 * own history. This is a "trained on your data" model that needs no ML.
 */
import { db } from '@/db/client';
import { transactions, categories, type Category } from '@/db/schema';
import { eq, isNull, and, sql } from 'drizzle-orm';

export async function suggestCategory(opts: {
  payee?: string | null;
  note?: string | null;
}): Promise<Category | null> {
  const payee = opts.payee?.trim().toLowerCase();
  const note = opts.note?.trim().toLowerCase();
  if (!payee && !note) return null;

  const whereParts = [isNull(transactions.deletedAt)];
  if (payee) {
    whereParts.push(sql`LOWER(${transactions.payee}) = ${payee}`);
  } else if (note) {
    whereParts.push(sql`LOWER(${transactions.note}) LIKE ${`%${note}%`}`);
  }

  const rows = await db
    .select({
      categoryId: transactions.categoryId,
      count: sql<number>`COUNT(*)`,
    })
    .from(transactions)
    .where(and(...whereParts))
    .groupBy(transactions.categoryId)
    .orderBy(sql`COUNT(*) DESC`)
    .limit(1);

  const top = rows[0];
  if (!top || !top.categoryId) return null;

  const cat = await db
    .select()
    .from(categories)
    .where(eq(categories.id, top.categoryId))
    .limit(1);
  return cat[0] ?? null;
}
