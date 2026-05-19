/**
 * Family pocket money — NEW-42. A simple per-person allowance tracker.
 * Issuing money is logged as a normal transaction; per-person totals come
 * from filtering by `payee = name`.
 */
import { getSetting, setSetting } from '@/db/queries/settings';
import { uuidv7 } from './id';
import { now } from './date';

export type FamilyMember = {
  id: string;
  name: string;
  relation: 'child' | 'partner' | 'parent' | 'sibling' | 'other';
  monthlyAllowancePaise: number;
  createdAt: string;
};

export async function listMembers(): Promise<FamilyMember[]> {
  return (await getSetting<FamilyMember[]>('family.members')) ?? [];
}

export async function upsertMember(m: Omit<FamilyMember, 'id' | 'createdAt'> & { id?: string }): Promise<FamilyMember> {
  const all = await listMembers();
  const id = m.id ?? uuidv7();
  const next: FamilyMember = {
    id,
    name: m.name,
    relation: m.relation,
    monthlyAllowancePaise: m.monthlyAllowancePaise,
    createdAt: all.find((x) => x.id === id)?.createdAt ?? now(),
  };
  await setSetting('family.members', [...all.filter((x) => x.id !== id), next]);
  return next;
}
export async function deleteMember(id: string): Promise<void> {
  const all = await listMembers();
  await setSetting('family.members', all.filter((x) => x.id !== id));
}
