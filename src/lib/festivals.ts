/**
 * Festival budgeting — NEW-36.
 *
 * Festival pots are short-lived, named, dated buckets:
 *   Diwali pot · ₹10000 · 2026-10-15 → 2026-10-22
 */
import { getSetting, setSetting } from '@/db/queries/settings';
import { uuidv7 } from './id';
import { now } from './date';

export type FestivalPot = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  budgetPaise: number;
  spentPaise: number;
  createdAt: string;
};

export async function listPots(): Promise<FestivalPot[]> {
  return (await getSetting<FestivalPot[]>('festivals.pots')) ?? [];
}

export async function upsertPot(p: Omit<FestivalPot, 'id' | 'createdAt'> & { id?: string }): Promise<FestivalPot> {
  const all = await listPots();
  const id = p.id ?? uuidv7();
  const next: FestivalPot = {
    id,
    name: p.name,
    startDate: p.startDate,
    endDate: p.endDate,
    budgetPaise: p.budgetPaise,
    spentPaise: p.spentPaise,
    createdAt: all.find((x) => x.id === id)?.createdAt ?? now(),
  };
  await setSetting('festivals.pots', [...all.filter((x) => x.id !== id), next]);
  return next;
}

export async function deletePot(id: string): Promise<void> {
  const all = await listPots();
  await setSetting('festivals.pots', all.filter((p) => p.id !== id));
}

// Seed defaults available for the picker
export const FESTIVAL_PRESETS: Array<{ name: string; durationDays: number }> = [
  { name: 'Diwali', durationDays: 7 },
  { name: 'Holi', durationDays: 3 },
  { name: 'Eid', durationDays: 3 },
  { name: 'Christmas', durationDays: 3 },
  { name: 'Pongal', durationDays: 4 },
  { name: 'Onam', durationDays: 10 },
  { name: 'Ganesh Chaturthi', durationDays: 10 },
  { name: 'Navratri / Durga Puja', durationDays: 9 },
  { name: 'Wedding season', durationDays: 30 },
];
