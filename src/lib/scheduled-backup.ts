/**
 * Scheduled SAF auto-backup — E5.
 *
 * On every cold start, check `backup.lastAt` vs `sync.cadenceDays`. If
 * stale, snapshot the DB, encrypt with the user's passphrase (read from
 * SecureStore), write to the cached "auto-backup folder" via SAF.
 *
 * If no passphrase is set, skip silently and rely on the in-app reminder.
 */
import * as SecureStore from 'expo-secure-store';
import { snapshotDatabase, exportToEncryptedBlob } from './backup-io';
import { filesystemService } from '@/platform/filesystem';
import { getSetting, setSetting } from '@/db/queries/settings';
import dayjs from 'dayjs';

function bytesToBase64(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  try {
    if (typeof btoa === 'function') return btoa(bin);
  } catch { /* fallthrough */ }
  return Buffer.from(bin, 'binary').toString('base64');
}

export async function maybeRunScheduledBackup(): Promise<{ skipped: boolean; reason?: string }> {
  const cadence = (await getSetting<number>('sync.cadenceDays')) ?? 0;
  if (!cadence || cadence <= 0) return { skipped: true, reason: 'cadence off' };
  const lastAt = await getSetting<string>('backup.lastAt');
  if (lastAt && dayjs().diff(dayjs(lastAt), 'day') < cadence) {
    return { skipped: true, reason: 'recent enough' };
  }
  const canary = await SecureStore.getItemAsync('passphrase.canary');
  const pass = await SecureStore.getItemAsync('backup.passphrase.cached');
  if (!canary || !pass) return { skipped: true, reason: 'no cached passphrase' };

  const snap = await snapshotDatabase();
  const blob = await exportToEncryptedBlob(pass, snap);
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const res = await filesystemService.saveFile({
    suggestedName: `moneynest-auto-${ts}.mnbk`,
    base64: bytesToBase64(blob),
    mimeType: 'application/octet-stream',
  });
  if (res) await setSetting('backup.lastAt', new Date().toISOString());
  return { skipped: false };
}
