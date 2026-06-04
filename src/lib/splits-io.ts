/**
 * Bill-split persistence layer (depends on the DB).
 */
import { getSetting, setSetting } from '@/db/queries/settings';
import type { Split } from './splits';

export async function listSplits(): Promise<Split[]> {
  return (await getSetting<Split[]>('splits.list')) ?? [];
}

export async function upsertSplit(s: Split): Promise<void> {
  const all = await listSplits();
  await setSetting('splits.list', [...all.filter((x) => x.id !== s.id), s]);
}

export async function deleteSplit(id: string): Promise<void> {
  const all = await listSplits();
  await setSetting('splits.list', all.filter((s) => s.id !== id));
}
