/**
 * Custom voice macros — A10.
 *
 * Persisted in the settings table under key `macros.list` as a JSON array.
 * Schema-free for forward-compat.
 */
import { getSetting, setSetting } from '@/db/queries/settings';

export type Macro = {
  id: string;
  phrase: string;
  amountPaise: number;
  type: 'expense' | 'income' | 'transfer';
  categorySlug?: string | null;
  accountId?: string | null;
  payee?: string | null;
  note?: string | null;
};

export async function listMacros(): Promise<Macro[]> {
  return (await getSetting<Macro[]>('macros.list')) ?? [];
}

export async function saveMacro(m: Macro): Promise<void> {
  const all = await listMacros();
  const next = [...all.filter((x) => x.id !== m.id), m];
  await setSetting('macros.list', next);
}

export async function deleteMacro(id: string): Promise<void> {
  const all = await listMacros();
  await setSetting(
    'macros.list',
    all.filter((m) => m.id !== id),
  );
}

export async function matchMacro(rawText: string): Promise<Macro | null> {
  const all = await listMacros();
  const lower = rawText.trim().toLowerCase();
  for (const m of all) {
    if (lower.includes(m.phrase.toLowerCase())) return m;
  }
  return null;
}
