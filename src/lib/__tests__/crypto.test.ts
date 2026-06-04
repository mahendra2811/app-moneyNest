import { describe, it, expect } from 'vitest';
import { deriveKey, encryptAesGcm, decryptAesGcm, randomBytes } from '../crypto';

describe('crypto', () => {
  it('encrypt/decrypt round-trips', async () => {
    const passphrase = 'a-long-test-passphrase';
    const salt = await randomBytes(16);
    const key = await deriveKey(passphrase, salt);
    const plaintext = new TextEncoder().encode('hello moneynest');
    const { ciphertext, iv, tag } = await encryptAesGcm(key, plaintext);
    const out = await decryptAesGcm(key, ciphertext, iv, tag);
    expect(new TextDecoder().decode(out)).toBe('hello moneynest');
  });

  it('wrong passphrase fails', async () => {
    const salt = await randomBytes(16);
    const keyA = await deriveKey('correct-passphrase', salt);
    const keyB = await deriveKey('wrong-passphrase', salt);
    const plaintext = new TextEncoder().encode('payload');
    const { ciphertext, iv, tag } = await encryptAesGcm(keyA, plaintext);
    await expect(decryptAesGcm(keyB, ciphertext, iv, tag)).rejects.toThrow();
  });

  it('same passphrase + salt yields same key', async () => {
    const salt = new Uint8Array(16).fill(7);
    const a = await deriveKey('p', salt);
    const b = await deriveKey('p', salt);
    expect(Array.from(a)).toEqual(Array.from(b));
  });

  it('different salts yield different keys', async () => {
    const a = await deriveKey('p', new Uint8Array(16).fill(1));
    const b = await deriveKey('p', new Uint8Array(16).fill(2));
    expect(Array.from(a)).not.toEqual(Array.from(b));
  });
});
