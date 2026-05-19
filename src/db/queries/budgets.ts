import { eq, sql } from 'drizzle-orm';
import { db } from '../client';
import { budgets, categories, type Budget, type NewBudget, type Category } from '../schema';
import { uuidv7 } from '@/lib/id';
import { now, startOfMonthLocal, endOfMonthLocal } from '@/lib/date';

export type BudgetWithCategory = Budget & {
  category: Category | null;
  spentPaise: number;
};

export async function getAllBudgets(): Promise<BudgetWithCategory[]> {
  const rows = await db
    .select({
      budget: budgets,
      category: categories,
    })
    .from(budgets)
    .leftJoin(categories, eq(budgets.categoryId, categories.id))
    .where(eq(budgets.isActive, true));

  const start = startOfMonthLocal();
  const end = endOfMonthLocal();

  const enriched: BudgetWithCategory[] = [];
  for (const r of rows) {
    const spentRows = await db.all<{ s: number | null }>(sql`
      SELECT COALESCE(SUM(amount_paise), 0) AS s
      FROM transactions
      WHERE category_id = ${r.budget.categoryId}
        AND type = 'expense'
        AND deleted_at IS NULL
        AND occurred_at BETWEEN ${start} AND ${end}
    `);
    enriched.push({
      ...r.budget,
      category: r.category ?? null,
      spentPaise: spentRows[0]?.s ?? 0,
    });
  }
  return enriched;
}

export async function getBudgetForCategory(categoryId: string): Promise<Budget | null> {
  const rows = await db
    .select()
    .from(budgets)
    .where(eq(budgets.categoryId, categoryId))
    .limit(1);
  return rows[0] ?? null;
}

export async function upsertBudget(input: {
  categoryId: string;
  amountPaise: number;
  rollover?: boolean;
  alertAt80?: boolean;
  alertAt100?: boolean;
  startDate?: string;
}): Promise<Budget> {
  const existing = await getBudgetForCategory(input.categoryId);
  const ts = now();
  if (existing) {
    await db
      .update(budgets)
      .set({
        amountPaise: input.amountPaise,
        rollover: input.rollover ?? existing.rollover,
        alertAt80: input.alertAt80 ?? existing.alertAt80,
        alertAt100: input.alertAt100 ?? existing.alertAt100,
        isActive: true,
        updatedAt: ts,
      })
      .where(eq(budgets.id, existing.id));
    const updated = await db.select().from(budgets).where(eq(budgets.id, existing.id)).limit(1);
    return updated[0]!;
  }
  const row: NewBudget = {
    id: uuidv7(),
    categoryId: input.categoryId,
    period: 'monthly',
    amountPaise: input.amountPaise,
    rollover: input.rollover ?? false,
    alertAt80: input.alertAt80 ?? true,
    alertAt100: input.alertAt100 ?? true,
    startDate: input.startDate ?? startOfMonthLocal(),
    isActive: true,
    createdAt: ts,
    updatedAt: ts,
  };
  await db.insert(budgets).values(row);
  const inserted = await db.select().from(budgets).where(eq(budgets.id, row.id)).limit(1);
  return inserted[0]!;
}

export async function deleteBudget(id: string): Promise<void> {
  await db.delete(budgets).where(eq(budgets.id, id));
}

export async function getBudgetTotals(): Promise<{ budgetTotal: number; spentTotal: number }> {
  const enriched = await getAllBudgets();
  return enriched.reduce(
    (acc, b) => ({
      budgetTotal: acc.budgetTotal + b.amountPaise,
      spentTotal: acc.spentTotal + b.spentPaise,
    }),
    { budgetTotal: 0, spentTotal: 0 },
  );
}
