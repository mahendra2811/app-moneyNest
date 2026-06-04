import { eq, asc, sql } from 'drizzle-orm';
import { db } from '../client';
import { accounts, type Account, type NewAccount } from '../schema';
import { uuidv7 } from '@/lib/id';
import { now } from '@/lib/date';

export async function getAllAccounts(opts?: { includeArchived?: boolean }): Promise<Account[]> {
  const rows = await db
    .select()
    .from(accounts)
    .where(opts?.includeArchived ? undefined : eq(accounts.isArchived, false))
    .orderBy(asc(accounts.sortOrder), asc(accounts.createdAt));
  return rows;
}

export async function getAccountById(id: string): Promise<Account | null> {
  const rows = await db.select().from(accounts).where(eq(accounts.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getAccountBalance(id: string): Promise<number> {
  const result = await db
    .all<{ balance: number | null }>(sql`
      SELECT
        (SELECT starting_balance_paise FROM accounts WHERE id = ${id})
        + COALESCE((SELECT SUM(amount_paise) FROM transactions
                    WHERE account_id = ${id} AND type = 'income'
                    AND deleted_at IS NULL), 0)
        - COALESCE((SELECT SUM(amount_paise) FROM transactions
                    WHERE account_id = ${id} AND type = 'expense'
                    AND deleted_at IS NULL), 0)
        + COALESCE((SELECT SUM(amount_paise) FROM transactions
                    WHERE to_account_id = ${id} AND type = 'transfer'
                    AND deleted_at IS NULL), 0)
        - COALESCE((SELECT SUM(amount_paise) FROM transactions
                    WHERE account_id = ${id} AND type = 'transfer'
                    AND deleted_at IS NULL), 0)
        AS balance
    `);
  return result[0]?.balance ?? 0;
}

export async function createAccount(input: Omit<NewAccount, 'id' | 'createdAt' | 'updatedAt'>): Promise<Account> {
  const ts = now();
  const row: NewAccount = {
    ...input,
    id: uuidv7(),
    createdAt: ts,
    updatedAt: ts,
  };
  await db.insert(accounts).values(row);
  const inserted = await getAccountById(row.id);
  if (!inserted) throw new Error('insert failed');
  return inserted;
}

export async function updateAccount(
  id: string,
  patch: Partial<Omit<NewAccount, 'id' | 'createdAt'>>,
): Promise<void> {
  await db
    .update(accounts)
    .set({ ...patch, updatedAt: now() })
    .where(eq(accounts.id, id));
}

export async function archiveAccount(id: string): Promise<void> {
  await updateAccount(id, { isArchived: true });
}

export async function unarchiveAccount(id: string): Promise<void> {
  await updateAccount(id, { isArchived: false });
}
