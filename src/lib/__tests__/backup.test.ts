import { describe, it, expect } from 'vitest';
import { exportToEncryptedBlob, readEncryptedBlob, type BackupFile } from '../backup';

const sample = (): BackupFile => ({
  version: 1,
  appVersion: '1.0.0',
  schemaVersion: 1,
  createdAt: new Date().toISOString(),
  deviceLabel: 'test',
  data: {
    accounts: [],
    categories: [],
    transactions: [],
    budgets: [],
    recurring: [],
    settings: [],
  },
});

describe('backup', () => {
  it('round-trips an empty snapshot', async () => {
    const blob = await exportToEncryptedBlob('passphrase-1', sample());
    const back = await readEncryptedBlob('passphrase-1', blob);
    expect(back.version).toBe(1);
    expect(back.data.accounts.length).toBe(0);
  });

  it('rejects wrong passphrase', async () => {
    const blob = await exportToEncryptedBlob('right', sample());
    await expect(readEncryptedBlob('wrong', blob)).rejects.toThrow(/wrong passphrase|corrupted/i);
  });

  it('rejects truncated file', async () => {
    const blob = await exportToEncryptedBlob('p', sample());
    await expect(readEncryptedBlob('p', blob.slice(0, 10))).rejects.toThrow();
  });

  it('rejects file with wrong magic', async () => {
    const blob = await exportToEncryptedBlob('p', sample());
    const tampered = new Uint8Array(blob);
    tampered[0] = 0x00;
    await expect(readEncryptedBlob('p', tampered)).rejects.toThrow(/moneynest backup/i);
  });
});
