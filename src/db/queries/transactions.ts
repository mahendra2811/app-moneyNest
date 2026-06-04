import { and, desc, eq, gte, isNull, lte, lt, like, or, sql, type SQL } from 'drizzle-orm';
import { db } from '../client';
import {
  transactions,
  categories,
  accounts,
  type Transaction,
  type NewTransaction,
  type Category,
  type Account,
} from '../schema';
import { uuidv7 } from '@/lib/id';
import { now, startOfMonthLocal, endOfMonthLocal, startOfDayLocal, endOfDayLocal } from '@/lib/date';

export type TxType = 'expense' | 'income' | 'transfer';

export type TransactionWithJoins = Transaction & {
  category: Category | null;
  account: Account | null;
  toAccount: Account | null;
};

export async function getTransaction(id: string): Promise<Transaction | null> {
  const rows = await db.select().from(transactions).where(eq(transactions.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function createTransaction(
  input: Omit<NewTransaction, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Transaction> {
  const ts = now();
  const row: NewTransaction = {
    ...input,
    id: uuidv7(),
    createdAt: ts,
    updatedAt: ts,
  };
  await db.insert(transactions).values(row);
  const inserted = await getTransaction(row.id);
  if (!inserted) throw new Error('insert failed');
  return inserted;
}

export async function updateTransaction(
  id: string,
  patch: Partial<Omit<NewTransaction, 'id' | 'createdAt'>>,
): Promise<void> {
  await db
    .update(transactions)
    .set({ ...patch, updatedAt: now() })
    .where(eq(transactions.id, id));
}

export async function softDeleteTransaction(id: string): Promise<void> {
  await db
    .update(transactions)
    .set({ deletedAt: now(), updatedAt: now() })
    .where(eq(transactions.id, id));
}

export async function undoSoftDelete(id: string): Promise<void> {
  await db
    .update(transactions)
    .set({ deletedAt: null, updatedAt: now() })
    .where(eq(transactions.id, id));
}

export type ListOpts = {
  cursor?: string;
  limit?: number;
  accountIds?: string[];
  categoryIds?: string[];
  type?: TxType;
  startDate?: string;
  endDate?: string;
  search?: string;
  minAmount?: number;
  maxAmount?: number;
};

export type ListResult = {
  items: TransactionWithJoins[];
  nextCursor: string | null;
};

export async function listTransactions(opts: ListOpts = {}): Promise<ListResult> {
  const limit = opts.limit ?? 50;
  const conds: SQL[] = [isNull(transactions.deletedAt)];

  if (opts.startDate) conds.push(gte(transactions.occurredAt, opts.startDate));
  if (opts.endDate) conds.push(lte(transactions.occurredAt, opts.endDate));
  if (opts.type) conds.push(eq(transactions.type, opts.type));
  if (opts.minAmount !== undefined) conds.push(gte(transactions.amountPaise, opts.minAmount));
  if (opts.maxAmount !== undefined) conds.push(lte(transactions.amountPaise, opts.maxAmount));
  if (opts.cursor) conds.push(lt(transactions.occurredAt, opts.cursor));

  if (opts.accountIds && opts.accountIds.length > 0) {
    conds.push(
      sql`${transactions.accountId} IN (${sql.join(
        opts.accountIds.map((id) => sql`${id}`),
        sql`, `,
      )})`,
    );
  }
  if (opts.categoryIds && opts.categoryIds.length > 0) {
    conds.push(
      sql`${transactions.categoryId} IN (${sql.join(
        opts.categoryIds.map((id) => sql`${id}`),
        sql`, `,
      )})`,
    );
  }
  if (opts.search && opts.search.trim() !== '') {
    const q = `%${opts.search.trim().toLowerCase()}%`;
    const note = like(sql`LOWER(${transactions.note})`, q);
    const payee = like(sql`LOWER(${transactions.payee})`, q);
    const orExpr = or(note, payee);
    if (orExpr) conds.push(orExpr);
  }

  const rows = await db
    .select({
      tx: transactions,
      cat: categories,
      acc: accounts,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .leftJoin(accounts, eq(transactions.accountId, accounts.id))
    .where(and(...conds))
    .orderBy(desc(transactions.occurredAt), desc(transactions.id))
    .limit(limit + 1);

  const items: TransactionWithJoins[] = rows.slice(0, limit).map((r) => ({
    ...r.tx,
    category: r.cat ?? null,
    account: r.acc ?? null,
    toAccount: null,
  }));

  // Hydrate toAccount for transfers (simple second query)
  const toIds = Array.from(
    new Set(items.filter((i) => i.type === 'transfer' && i.toAccountId).map((i) => i.toAccountId!)),
  );
  if (toIds.length > 0) {
    const toRows = await db
      .select()
      .from(accounts)
      .where(
        sql`${accounts.id} IN (${sql.join(
          toIds.map((id) => sql`${id}`),
          sql`, `,
        )})`,
      );
    const byId = new Map(toRows.map((a) => [a.id, a]));
    for (const it of items) {
      if (it.type === 'transfer' && it.toAccountId) {
        it.toAccount = byId.get(it.toAccountId) ?? null;
      }
    }
  }

  const last = items[items.length - 1];
  const nextCursor = rows.length > limit && last ? last.occurredAt : null;
  return { items, nextCursor };
}

export async function getRecentTransactions(limit = 10): Promise<TransactionWithJoins[]> {
  const { items } = await listTransactions({ limit });
  return items;
}

export async function getTransactionsForDateRange(
  startIso: string,
  endIso: string,
): Promise<TransactionWithJoins[]> {
  const { items } = await listTransactions({ startDate: startIso, endDate: endIso, limit: 5000 });
  return items;
}

export type TotalsRow = { spentPaise: number; incomePaise: number };

export async function getMonthTotals(monthRefIso?: string): Promise<TotalsRow> {
  const start = startOfMonthLocal(monthRefIso);
  const end = endOfMonthLocal(monthRefIso);
  const result = await db.all<{ spent: number | null; income: number | null }>(sql`
    SELECT
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount_paise ELSE 0 END), 0) AS spent,
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount_paise ELSE 0 END), 0) AS income
    FROM transactions
    WHERE occurred_at BETWEEN ${start} AND ${end}
      AND deleted_at IS NULL
  `);
  const r = result[0];
  return { spentPaise: r?.spent ?? 0, incomePaise: r?.income ?? 0 };
}

export async function getTodayTotals(): Promise<TotalsRow> {
  const start = startOfDayLocal();
  const end = endOfDayLocal();
  const result = await db.all<{ spent: number | null; income: number | null }>(sql`
    SELECT
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount_paise ELSE 0 END), 0) AS spent,
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount_paise ELSE 0 END), 0) AS income
    FROM transactions
    WHERE occurred_at BETWEEN ${start} AND ${end}
      AND deleted_at IS NULL
  `);
  const r = result[0];
  return { spentPaise: r?.spent ?? 0, incomePaise: r?.income ?? 0 };
}

export type CategorySpendRow = {
  categoryId: string | null;
  categoryName: string | null;
  categoryIcon: string | null;
  categoryColor: string | null;
  totalPaise: number;
  count: number;
};

export async function getMonthSpendByCategory(monthRefIso?: string): Promise<CategorySpendRow[]> {
  const start = startOfMonthLocal(monthRefIso);
  const end = endOfMonthLocal(monthRefIso);
  const rows = await db.all<CategorySpendRow>(sql`
    SELECT
      t.category_id AS categoryId,
      c.name AS categoryName,
      c.icon AS categoryIcon,
      c.color AS categoryColor,
      COALESCE(SUM(t.amount_paise), 0) AS totalPaise,
      COUNT(*) AS count
    FROM transactions t
    LEFT JOIN categories c ON c.id = t.category_id
    WHERE t.type = 'expense'
      AND t.deleted_at IS NULL
      AND t.occurred_at BETWEEN ${start} AND ${end}
    GROUP BY t.category_id
    ORDER BY totalPaise DESC
  `);
  return rows;
}

export async function getDistinctPayees(prefix: string, limit = 10): Promise<string[]> {
  const q = `${prefix.toLowerCase()}%`;
  const rows = await db.all<{ payee: string }>(sql`
    SELECT DISTINCT payee FROM transactions
    WHERE payee IS NOT NULL
      AND LOWER(payee) LIKE ${q}
      AND deleted_at IS NULL
    ORDER BY updated_at DESC
    LIMIT ${limit}
  `);
  return rows.map((r) => r.payee).filter(Boolean);
}
