import { asc, eq } from 'drizzle-orm';
import { db } from '../client';
import { recurring, type Recurring, type NewRecurring } from '../schema';
import { uuidv7 } from '@/lib/id';
import { now } from '@/lib/date';

export async function getAllRecurring(opts?: { includeInactive?: boolean }): Promise<Recurring[]> {
  const where = opts?.includeInactive ? undefined : eq(recurring.isActive, true);
  return db.select().from(recurring).where(where).orderBy(asc(recurring.nextRunAt));
}

export async function getRecurringById(id: string): Promise<Recurring | null> {
  const rows = await db.select().from(recurring).where(eq(recurring.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function createRecurring(input: Omit<NewRecurring, 'id' | 'createdAt' | 'updatedAt'>): Promise<Recurring> {
  const ts = now();
  const row: NewRecurring = { ...input, id: uuidv7(), createdAt: ts, updatedAt: ts };
  await db.insert(recurring).values(row);
  const inserted = await getRecurringById(row.id);
  if (!inserted) throw new Error('insert failed');
  return inserted;
}

export async function updateRecurring(
  id: string,
  patch: Partial<Omit<NewRecurring, 'id' | 'createdAt'>>,
): Promise<void> {
  await db
    .update(recurring)
    .set({ ...patch, updatedAt: now() })
    .where(eq(recurring.id, id));
}

export async function pauseRecurring(id: string): Promise<void> {
  await updateRecurring(id, { isActive: false });
}
export async function resumeRecurring(id: string): Promise<void> {
  await updateRecurring(id, { isActive: true });
}
export async function deleteRecurring(id: string): Promise<void> {
  await db.delete(recurring).where(eq(recurring.id, id));
}
