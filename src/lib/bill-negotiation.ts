/**
 * Bill negotiation tracker — NEW-34.
 *
 * Per-payee: the user records the "before" and "after" amount and we
 * compute lifetime savings. Useful for utility/internet renegotiations.
 */
import { getSetting, setSetting } from '@/db/queries/settings';
import { uuidv7 } from './id';
import { now } from './date';

export type Negotiation = {
  id: string;
  payee: string;
  beforePaise: number;
  afterPaise: number;
  frequency: 'monthly' | 'yearly' | 'one-off';
  startedAt: string;
};

export async function listNegotiations(): Promise<Negotiation[]> {
  return (await getSetting<Negotiation[]>('negotiations.list')) ?? [];
}
export async function upsertNegotiation(n: Omit<Negotiation, 'id' | 'startedAt'> & { id?: string }): Promise<Negotiation> {
  const all = await listNegotiations();
  const id = n.id ?? uuidv7();
  const next: Negotiation = { id, ...n, startedAt: all.find((x) => x.id === id)?.startedAt ?? now() };
  await setSetting('negotiations.list', [...all.filter((x) => x.id !== id), next]);
  return next;
}
export async function deleteNegotiation(id: string): Promise<void> {
  const all = await listNegotiations();
  await setSetting('negotiations.list', all.filter((x) => x.id !== id));
}
export async function lifetimeSavingsPaise(): Promise<number> {
  const all = await listNegotiations();
  let total = 0;
  const now = new Date();
  for (const n of all) {
    const months = Math.max(1, (now.getFullYear() - new Date(n.startedAt).getFullYear()) * 12 + (now.getMonth() - new Date(n.startedAt).getMonth()));
    const monthlyDelta = n.beforePaise - n.afterPaise;
    if (n.frequency === 'monthly') total += monthlyDelta * months;
    else if (n.frequency === 'yearly') total += Math.round((monthlyDelta * months) / 12);
    else total += monthlyDelta;
  }
  return total;
}
