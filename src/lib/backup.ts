/**
 * Pure backup format helpers. No DB imports here — `src/lib/backup-io.ts`
 * wraps these with snapshot/restore against the live SQLite database.
 */
import { deriveKey, encryptAesGcm, decryptAesGcm, randomBytes, cryptoConsts } from './crypto';
import { z } from 'zod';

const MAGIC = new Uint8Array([0x4d, 0x4e, 0x53, 0x54]); // "MNST"
const FORMAT_VERSION = 1;
const SchemaVersion = 1;

export const BACKUP_SCHEMA_VERSION = SchemaVersion;
export const BACKUP_FORMAT_VERSION = FORMAT_VERSION;

const BackupSchema = z.object({
  version: z.literal(1),
  appVersion: z.string(),
  schemaVersion: z.number(),
  createdAt: z.string(),
  deviceLabel: z.string(),
  data: z.object({
    accounts: z.array(z.any()),
    categories: z.array(z.any()),
    transactions: z.array(z.any()),
    budgets: z.array(z.any()),
    recurring: z.array(z.any()),
    settings: z.array(z.any()),
  }),
});

export type BackupFile = z.infer<typeof BackupSchema>;

function concat(...parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((a, p) => a + p.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const p of parts) {
    out.set(p, off);
    off += p.length;
  }
  return out;
}

export async function exportToEncryptedBlob(
  passphrase: string,
  snapshot: BackupFile,
): Promise<Uint8Array> {
  const json = JSON.stringify(snapshot);
  const plaintext = new TextEncoder().encode(json);
  const salt = await randomBytes(cryptoConsts.SALT_BYTES);
  const key = await deriveKey(passphrase, salt);
  const { ciphertext, iv, tag } = await encryptAesGcm(key, plaintext);
  const header = new Uint8Array([...MAGIC, FORMAT_VERSION]);
  return concat(header, salt, iv, tag, ciphertext);
}

export async function readEncryptedBlob(
  passphrase: string,
  blob: Uint8Array,
): Promise<BackupFile> {
  const headerLen = MAGIC.length + 1;
  if (blob.length < headerLen + cryptoConsts.SALT_BYTES + cryptoConsts.IV_BYTES + 16) {
    throw new Error('Backup file is too small');
  }
  for (let i = 0; i < MAGIC.length; i++) {
    if (blob[i] !== MAGIC[i]) throw new Error('Not a moneyNest backup file');
  }
  const version = blob[MAGIC.length];
  if (version !== FORMAT_VERSION) throw new Error(`Unsupported backup format: ${version}`);
  let off = headerLen;
  const salt = blob.slice(off, off + cryptoConsts.SALT_BYTES);
  off += cryptoConsts.SALT_BYTES;
  const iv = blob.slice(off, off + cryptoConsts.IV_BYTES);
  off += cryptoConsts.IV_BYTES;
  const tag = blob.slice(off, off + 16);
  off += 16;
  const ciphertext = blob.slice(off);

  const key = await deriveKey(passphrase, salt);
  let plaintext: Uint8Array;
  try {
    plaintext = await decryptAesGcm(key, ciphertext, iv, tag);
  } catch {
    throw new Error('Wrong passphrase or corrupted file');
  }
  const json = new TextDecoder().decode(plaintext);
  const parsed = BackupSchema.parse(JSON.parse(json));
  if (parsed.schemaVersion !== SchemaVersion) {
    throw new Error(`Backup schema version ${parsed.schemaVersion} not supported by this app (${SchemaVersion})`);
  }
  return parsed;
}
