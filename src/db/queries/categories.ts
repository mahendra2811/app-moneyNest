import { and, asc, eq } from 'drizzle-orm';
import { db } from '../client';
import { categories, type Category, type NewCategory } from '../schema';
import { uuidv7 } from '@/lib/id';
import { now } from '@/lib/date';

export type CategoryType = 'expense' | 'income';

export async function getAllCategories(opts?: {
  type?: CategoryType;
  includeArchived?: boolean;
}): Promise<Category[]> {
  const conditions = [
    opts?.type ? eq(categories.type, opts.type) : undefined,
    opts?.includeArchived ? undefined : eq(categories.isArchived, false),
  ].filter(Boolean) as Parameters<typeof and>;
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  return db
    .select()
    .from(categories)
    .where(where)
    .orderBy(asc(categories.sortOrder), asc(categories.createdAt));
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const rows = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const rows = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function createCategory(
  input: Omit<NewCategory, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Category> {
  const ts = now();
  const row: NewCategory = {
    ...input,
    id: uuidv7(),
    createdAt: ts,
    updatedAt: ts,
  };
  await db.insert(categories).values(row);
  const inserted = await getCategoryById(row.id);
  if (!inserted) throw new Error('insert failed');
  return inserted;
}

export async function updateCategory(
  id: string,
  patch: Partial<Omit<NewCategory, 'id' | 'createdAt'>>,
): Promise<void> {
  await db
    .update(categories)
    .set({ ...patch, updatedAt: now() })
    .where(eq(categories.id, id));
}

export async function archiveCategory(id: string): Promise<void> {
  await updateCategory(id, { isArchived: true });
}
