/**
 * Document vault — NEW-43, NEW-44, NEW-45.
 *
 * Encrypted file references stored as JSON. The bytes live in app-private
 * file system (Expo FileSystem documentDirectory) wrapped with the user's
 * backup passphrase.
 */
import * as FileSystem from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';
import { getSetting, setSetting } from '@/db/queries/settings';
import { uuidv7 } from './id';
import { now } from './date';
import { deriveKey, encryptAesGcm, decryptAesGcm, randomBytes, cryptoConsts } from './crypto';

export type DocCategory = 'rent' | 'insurance' | 'warranty' | 'nominee' | 'tax' | 'other';

export type VaultDoc = {
  id: string;
  category: DocCategory;
  name: string;
  fileRelativePath: string;     // relative to documentDirectory
  sizeBytes: number;
  expiresAt?: string;           // for warranties / insurance
  createdAt: string;
  note?: string;
};

const VAULT_DIR = `${FileSystem.documentDirectory}vault/`;

async function ensureDir(): Promise<void> {
  const info = await FileSystem.getInfoAsync(VAULT_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(VAULT_DIR, { intermediates: true });
  }
}

export async function listDocs(): Promise<VaultDoc[]> {
  return (await getSetting<VaultDoc[]>('vault.docs')) ?? [];
}

export async function saveDoc(opts: {
  category: DocCategory;
  name: string;
  base64: string;
  passphrase: string;
  expiresAt?: string;
  note?: string;
}): Promise<VaultDoc> {
  await ensureDir();
  const salt = await randomBytes(cryptoConsts.SALT_BYTES);
  const key = await deriveKey(opts.passphrase, salt);
  const bytes = Uint8Array.from(atob(opts.base64), (c) => c.charCodeAt(0));
  const { ciphertext, iv, tag } = await encryptAesGcm(key, bytes);
  const id = uuidv7();
  const rel = `vault/${id}.bin`;
  const fullPath = `${FileSystem.documentDirectory}${rel}`;
  // Pack: salt | iv | tag | ciphertext
  const packed = new Uint8Array(salt.length + iv.length + tag.length + ciphertext.length);
  let off = 0;
  packed.set(salt, off); off += salt.length;
  packed.set(iv, off); off += iv.length;
  packed.set(tag, off); off += tag.length;
  packed.set(ciphertext, off);
  let bin = '';
  for (const b of packed) bin += String.fromCharCode(b);
  const b64 = typeof btoa === 'function' ? btoa(bin) : Buffer.from(bin, 'binary').toString('base64');
  await FileSystem.writeAsStringAsync(fullPath, b64, { encoding: FileSystem.EncodingType.Base64 });
  const doc: VaultDoc = {
    id,
    category: opts.category,
    name: opts.name,
    fileRelativePath: rel,
    sizeBytes: bytes.length,
    createdAt: now(),
    ...(opts.expiresAt ? { expiresAt: opts.expiresAt } : {}),
    ...(opts.note ? { note: opts.note } : {}),
  };
  const all = await listDocs();
  await setSetting('vault.docs', [...all, doc]);
  return doc;
}

export async function deleteDoc(id: string): Promise<void> {
  const all = await listDocs();
  const found = all.find((d) => d.id === id);
  if (!found) return;
  const fullPath = `${FileSystem.documentDirectory}${found.fileRelativePath}`;
  try {
    await FileSystem.deleteAsync(fullPath, { idempotent: true });
  } catch { /* ignore */ }
  await setSetting('vault.docs', all.filter((d) => d.id !== id));
}

export async function readDoc(doc: VaultDoc, passphrase: string): Promise<Uint8Array | null> {
  try {
    const fullPath = `${FileSystem.documentDirectory}${doc.fileRelativePath}`;
    const b64 = await FileSystem.readAsStringAsync(fullPath, { encoding: FileSystem.EncodingType.Base64 });
    const bin = typeof atob === 'function' ? atob(b64) : Buffer.from(b64, 'base64').toString('binary');
    const packed = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) packed[i] = bin.charCodeAt(i);
    let off = 0;
    const salt = packed.slice(off, off + cryptoConsts.SALT_BYTES); off += cryptoConsts.SALT_BYTES;
    const iv = packed.slice(off, off + cryptoConsts.IV_BYTES); off += cryptoConsts.IV_BYTES;
    const tag = packed.slice(off, off + 16); off += 16;
    const ciphertext = packed.slice(off);
    const key = await deriveKey(passphrase, salt);
    return await decryptAesGcm(key, ciphertext, iv, tag);
  } catch {
    return null;
  }
}

export async function getCachedPassphrase(): Promise<string | null> {
  return SecureStore.getItemAsync('backup.passphrase.cached');
}
