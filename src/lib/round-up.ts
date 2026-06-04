/**
 * Round-up auto-savings — A13.
 *
 * After every saved expense, optionally log a "savings" transfer for the
 * difference between the spent amount and the next round number.
 *
 *   ₹247 spent, round to ₹250 → ₹3 transfer to savings
 *   round-up unit defaults to ₹10
 */
import { createTransaction } from '@/db/queries/transactions';
import { getSetting } from '@/db/queries/settings';
import { now } from './date';

export async function maybeRoundUp(opts: {
  expenseAmountPaise: number;
  sourceAccountId: string;
}): Promise<{ created: boolean; roundUpPaise: number }> {
  const enabled = (await getSetting<boolean>('roundup.enabled')) ?? false;
  if (!enabled) return { created: false, roundUpPaise: 0 };
  const unit = ((await getSetting<number>('roundup.unitRupees')) ?? 10) * 100;
  const savingsAccountId = await getSetting<string>('roundup.savingsAccountId');
  if (!savingsAccountId) return { created: false, roundUpPaise: 0 };

  const remainder = opts.expenseAmountPaise % unit;
  if (remainder === 0) return { created: false, roundUpPaise: 0 };
  const roundUp = unit - remainder;

  await createTransaction({
    amountPaise: roundUp,
    type: 'transfer',
    accountId: opts.sourceAccountId,
    toAccountId: savingsAccountId,
    categoryId: null,
    note: 'Round-up auto-savings',
    payee: null,
    occurredAt: now(),
    source: 'manual',
    deletedAt: null,
    recurringId: null,
  });

  return { created: true, roundUpPaise: roundUp };
}
