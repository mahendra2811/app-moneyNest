/**
 * Multi-profile — NEW-39. Personal / business / etc.
 *
 * We don't open multiple SQLite handles. Instead, every screen filters
 * by `profileId` stored in a settings key + on each transaction's note
 * metadata. Cleaner alternative would be one DB file per profile —
 * documented but not implemented to keep migrations small.
 */
import { getSetting, setSetting } from '@/db/queries/settings';
import { uuidv7 } from './id';
import { now } from './date';

export type Profile = {
  id: string;
  name: string;
  kind: 'personal' | 'business' | 'family' | 'other';
  createdAt: string;
};

export async function listProfiles(): Promise<Profile[]> {
  return (await getSetting<Profile[]>('profiles.list')) ?? [];
}

export async function getActiveProfileId(): Promise<string | null> {
  return (await getSetting<string>('profiles.active')) ?? null;
}
export async function setActiveProfileId(id: string): Promise<void> {
  await setSetting('profiles.active', id);
}
export async function upsertProfile(p: Omit<Profile, 'id' | 'createdAt'> & { id?: string }): Promise<Profile> {
  const all = await listProfiles();
  const id = p.id ?? uuidv7();
  const next: Profile = { id, name: p.name, kind: p.kind, createdAt: all.find((x) => x.id === id)?.createdAt ?? now() };
  await setSetting('profiles.list', [...all.filter((x) => x.id !== id), next]);
  return next;
}
export async function deleteProfile(id: string): Promise<void> {
  const all = await listProfiles();
  await setSetting('profiles.list', all.filter((x) => x.id !== id));
}
