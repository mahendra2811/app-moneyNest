/**
 * Manual review queue — NEW-46. Holds low-confidence imports until the
 * user triages them.
 */
import { db } from '../client';
import { reviewQueue, type ReviewItem } from '../schema';
import { eq, asc } from 'drizzle-orm';
import { uuidv7 } from '@/lib/id';
import { now } from '@/lib/date';

export type ReviewPayload = {
  amountPaise: number;
  type: 'expense' | 'income' | 'transfer';
  accountId?: string;
  categoryId?: string | null;
  occurredAt: string;
  payee?: string | null;
  note?: string | null;
  rawText?: string;
};

export async function enqueue(opts: { source: 'sms' | 'csv' | 'ocr' | 'aa'; payload: ReviewPayload; confidence: number }): Promise<void> {
  await db.insert(reviewQueue).values({
    id: uuidv7(),
    createdAt: now(),
    source: opts.source,
    payloadJson: JSON.stringify(opts.payload),
    confidence: Math.round(opts.confidence * 100),
    status: 'pending',
  });
}

export async function listPending(): Promise<Array<ReviewItem & { payload: ReviewPayload }>> {
  const rows = await db
    .select()
    .from(reviewQueue)
    .where(eq(reviewQueue.status, 'pending'))
    .orderBy(asc(reviewQueue.createdAt));
  return rows.map((r) => ({ ...r, payload: JSON.parse(r.payloadJson) as ReviewPayload }));
}

export async function approve(id: string): Promise<void> {
  await db.update(reviewQueue).set({ status: 'approved' }).where(eq(reviewQueue.id, id));
}

export async function reject(id: string): Promise<void> {
  await db.update(reviewQueue).set({ status: 'rejected' }).where(eq(reviewQueue.id, id));
}
