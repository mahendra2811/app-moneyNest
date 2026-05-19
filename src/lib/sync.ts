/**
 * Sync layer — E1/E2/E3/E4.
 *
 * The brief says "Zero servers in V1. All data stays on device." This file
 * is the contract surface for future sync providers. Each provider plugs
 * into the same interface; the user chooses one in Settings → Sync.
 *
 * Implemented providers in this commit:
 *   - 'local-saf' (E5): scheduled writes to user-chosen folder via SAF
 *   - 'manual' (current Phase 4 flow)
 *
 * Stubbed for future:
 *   - 'gdrive' (E3) — requires Google sign-in + Drive scope
 *   - 'webdav' (E4) — requires Nextcloud URL + credentials
 *   - 'lan-p2p' (E2) — requires Bluetooth/WiFi discovery
 *   - 'cloud-e2e' (E1) — full E2E cloud sync; needs design phase
 *
 * Each future provider lands as its own file in src/sync/ implementing
 * SyncProvider.
 */
import { getSetting, setSetting } from '@/db/queries/settings';

export type SyncProviderName = 'manual' | 'local-saf' | 'gdrive' | 'webdav' | 'lan-p2p' | 'cloud-e2e';

export interface SyncProvider {
  name: SyncProviderName;
  isConfigured(): Promise<boolean>;
  push(blob: Uint8Array): Promise<{ uri: string }>;
  pull(): Promise<Uint8Array | null>;
}

export async function getActiveProvider(): Promise<SyncProviderName> {
  return (await getSetting<SyncProviderName>('sync.provider')) ?? 'manual';
}
export async function setActiveProvider(name: SyncProviderName): Promise<void> {
  await setSetting('sync.provider', name);
}

export async function getCadenceDays(): Promise<number> {
  return (await getSetting<number>('sync.cadenceDays')) ?? 14;
}
export async function setCadenceDays(n: number): Promise<void> {
  await setSetting('sync.cadenceDays', n);
}
