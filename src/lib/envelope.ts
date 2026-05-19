/**
 * Envelope budgeting + per-payee + per-account caps + weekly/yearly budgets.
 *   C8, C9, C10, C11, C12 (UI for rollover toggle).
 *
 * The schema already has a budgets table keyed by categoryId. Envelope and
 * per-payee/per-account caps live in settings to keep migrations small.
 */
import { getSetting, setSetting } from '@/db/queries/settings';

export type EnvelopeCap = {
  id: string;
  scope: 'payee' | 'account';
  scopeValue: string;          // payee name or accountId
  periodMs: number;            // 1 week = 604_800_000, 30 days, 1 year, etc.
  capPaise: number;
};

export type ExtendedBudget = {
  id: string;
  categoryId: string;
  period: 'monthly' | 'weekly' | 'yearly';
  amountPaise: number;
};

export async function listEnvelopeCaps(): Promise<EnvelopeCap[]> {
  return (await getSetting<EnvelopeCap[]>('envelope.caps')) ?? [];
}
export async function upsertEnvelopeCap(c: EnvelopeCap): Promise<void> {
  const all = await listEnvelopeCaps();
  await setSetting('envelope.caps', [...all.filter((x) => x.id !== c.id), c]);
}
export async function deleteEnvelopeCap(id: string): Promise<void> {
  const all = await listEnvelopeCaps();
  await setSetting('envelope.caps', all.filter((x) => x.id !== id));
}

export async function listExtendedBudgets(): Promise<ExtendedBudget[]> {
  return (await getSetting<ExtendedBudget[]>('budgets.extended')) ?? [];
}
export async function upsertExtendedBudget(b: ExtendedBudget): Promise<void> {
  const all = await listExtendedBudgets();
  await setSetting('budgets.extended', [...all.filter((x) => x.id !== b.id), b]);
}
