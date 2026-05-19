import { db } from '@/db/client';
import { recurring as recurringTbl } from '@/db/schema';
import { eq, and, lte } from 'drizzle-orm';
import { createTransaction } from '@/db/queries/transactions';
import { updateRecurring } from '@/db/queries/recurring';
import { computeNextRun, type Frequency } from './recurring-engine';
import { now } from './date';
import { z } from 'zod';

const TemplateSchema = z.object({
  amountPaise: z.number().int().positive(),
  type: z.enum(['expense', 'income', 'transfer']),
  accountId: z.string(),
  toAccountId: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  payee: z.string().nullable().optional(),
});

export type MaterializeResult = {
  created: number;
  errors: string[];
};

export async function materializeDueRecurring(refIso?: string): Promise<MaterializeResult> {
  const at = refIso ?? now();
  const due = await db
    .select()
    .from(recurringTbl)
    .where(and(eq(recurringTbl.isActive, true), lte(recurringTbl.nextRunAt, at)));

  let created = 0;
  const errors: string[] = [];

  for (const r of due) {
    try {
      const parsed = TemplateSchema.parse(JSON.parse(r.templateJson));
      let cursor = r.nextRunAt;
      // Catch up: if multiple intervals have passed, materialize each one.
      // Safety cap: don't create more than 12 catch-ups per run.
      for (let i = 0; i < 12 && cursor <= at; i++) {
        await createTransaction({
          amountPaise: parsed.amountPaise,
          type: parsed.type,
          accountId: parsed.accountId,
          toAccountId: parsed.toAccountId ?? null,
          categoryId: parsed.type === 'transfer' ? null : parsed.categoryId ?? null,
          note: parsed.note ?? null,
          payee: parsed.payee ?? null,
          occurredAt: cursor,
          source: 'recurring',
          recurringId: r.id,
          deletedAt: null,
        });
        created++;
        const next = computeNextRun({
          frequency: r.frequency as Frequency,
          intervalCount: r.intervalCount,
          dayOfMonth: r.dayOfMonth ?? null,
          dayOfWeek: r.dayOfWeek ?? null,
          fromIso: cursor,
        });
        cursor = next;
        if (r.endDate && cursor > r.endDate) break;
      }
      await updateRecurring(r.id, { lastRunAt: at, nextRunAt: cursor });
    } catch (e) {
      errors.push(`${r.id}: ${(e as Error).message}`);
    }
  }
  return { created, errors };
}
