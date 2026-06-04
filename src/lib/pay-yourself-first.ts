/**
 * Pay yourself first — NEW-23.
 *
 * Hook on every income > threshold: auto-create a transfer of N% to the
 * user-chosen savings account.
 */
import { getSetting, setSetting } from '@/db/queries/settings';
import { createTransaction } from '@/db/queries/transactions';
import { now } from './date';

export type PayYourselfFirstConfig = {
  enabled: boolean;
  percent: number;             // 0..100
  savingsAccountId: string | null;
  minIncomePaise: number;
};

export async function getConfig(): Promise<PayYourselfFirstConfig> {
  return (
    (await getSetting<PayYourselfFirstConfig>('pyf.config')) ?? {
      enabled: false,
      percent: 20,
      savingsAccountId: null,
      minIncomePaise: 1_00_00_00, // ₹10,000
    }
  );
}
export async function setConfig(c: PayYourselfFirstConfig): Promise<void> {
  await setSetting('pyf.config', c);
}

export async function maybePayYourselfFirst(opts: {
  incomePaise: number;
  incomeAccountId: string;
}): Promise<{ transferred: number; created: boolean }> {
  const c = await getConfig();
  if (!c.enabled || !c.savingsAccountId || c.savingsAccountId === opts.incomeAccountId) {
    return { transferred: 0, created: false };
  }
  if (opts.incomePaise < c.minIncomePaise) return { transferred: 0, created: false };
  const amount = Math.round((opts.incomePaise * c.percent) / 100);
  if (amount <= 0) return { transferred: 0, created: false };
  await createTransaction({
    amountPaise: amount,
    type: 'transfer',
    accountId: opts.incomeAccountId,
    toAccountId: c.savingsAccountId,
    categoryId: null,
    occurredAt: now(),
    note: `Pay yourself first ${c.percent}%`,
    payee: null,
    source: 'manual',
    deletedAt: null,
    recurringId: null,
  });
  return { transferred: amount, created: true };
}
