/**
 * Saved filter presets — B3. Persisted under settings key `filters.saved`.
 */
import { getSetting, setSetting } from '@/db/queries/settings';
import type { ListOpts } from '@/db/queries/transactions';

export type SavedFilter = { id: string; name: string; opts: ListOpts };

export async function listSavedFilters(): Promise<SavedFilter[]> {
  return (await getSetting<SavedFilter[]>('filters.saved')) ?? [];
}
export async function saveFilter(f: SavedFilter): Promise<void> {
  const all = await listSavedFilters();
  await setSetting('filters.saved', [...all.filter((x) => x.id !== f.id), f]);
}
export async function deleteSavedFilter(id: string): Promise<void> {
  const all = await listSavedFilters();
  await setSetting('filters.saved', all.filter((f) => f.id !== id));
}
