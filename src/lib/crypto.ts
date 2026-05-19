/**
 * AES-256-GCM + PBKDF2-SHA256 helpers backed by react-native-quick-crypto.
 * Node-compatible test path: when run under Vitest (no native module),
 * falls back to the WebCrypto SubtleCrypto APIs.
 */

const PBKDF2_ITERATIONS = 250_000;
const SALT_BYTES = 16;
const IV_BYTES = 12;
const KEY_BYTES = 32;

type CryptoBackend = {
  randomBytes: (n: number) => Uint8Array;
  deriveKey: (passphrase: string, salt: Uint8Array) => Promise<Uint8Array>;
  encryptGcm: (
    key: Uint8Array,
    iv: Uint8Array,
    plaintext: Uint8Array,
  ) => Promise<{ ciphertext: Uint8Array; tag: Uint8Array }>;
  decryptGcm: (
    key: Uint8Array,
    iv: Uint8Array,
    ciphertext: Uint8Array,
    tag: Uint8Array,
  ) => Promise<Uint8Array>;
};

function isReactNative(): boolean {
  return typeof (globalThis as { HermesInternal?: unknown }).HermesInternal !== 'undefined';
}

let backend: CryptoBackend | null = null;

async function getBackend(): Promise<CryptoBackend> {
  if (backend) return backend;
  if (isReactNative()) {
    type QC = {
      randomBytes: (n: number) => Uint8Array;
      pbkdf2: (
        pass: string,
        salt: Buffer,
        iters: number,
        keylen: number,
        digest: string,
        cb: (err: Error | null, derived: Buffer | null) => void,
      ) => void;
      createCipheriv: (
        algo: string,
        key: Buffer,
        iv: Buffer,
      ) => {
        update: (data: Buffer) => Buffer;
        final: () => Buffer;
        getAuthTag: () => Buffer;
      };
      createDecipheriv: (
        algo: string,
        key: Buffer,
        iv: Buffer,
      ) => {
        update: (data: Buffer) => Buffer;
        final: () => Buffer;
        setAuthTag: (tag: Buffer) => void;
      };
    };
    const qc = require('react-native-quick-crypto') as unknown as QC;
    backend = {
      randomBytes: (n) => new Uint8Array(qc.randomBytes(n)),
      deriveKey: async (passphrase, salt) =>
        new Promise<Uint8Array>((resolve, reject) => {
          qc.pbkdf2(
            passphrase,
            Buffer.from(salt),
            PBKDF2_ITERATIONS,
            KEY_BYTES,
            'sha256',
            (err, derived) => {
              if (err || !derived) return reject(err ?? new Error('pbkdf2 failed'));
              resolve(new Uint8Array(derived));
            },
          );
        }),
      encryptGcm: async (key, iv, plaintext) => {
        const cipher = qc.createCipheriv('aes-256-gcm', Buffer.from(key), Buffer.from(iv));
        const ct = Buffer.concat([cipher.update(Buffer.from(plaintext)), cipher.final()]);
        return { ciphertext: new Uint8Array(ct), tag: new Uint8Array(cipher.getAuthTag()) };
      },
      decryptGcm: async (key, iv, ciphertext, tag) => {
        const decipher = qc.createDecipheriv('aes-256-gcm', Buffer.from(key), Buffer.from(iv));
        decipher.setAuthTag(Buffer.from(tag));
        const pt = Buffer.concat([decipher.update(Buffer.from(ciphertext)), decipher.final()]);
        return new Uint8Array(pt);
      },
    };
  } else {
    // Node / Vitest backend
    const { webcrypto } = await import('node:crypto');
    const subtle = webcrypto.subtle;
    backend = {
      randomBytes: (n) => {
        const out = new Uint8Array(n);
        webcrypto.getRandomValues(out);
        return out;
      },
      deriveKey: async (passphrase, salt) => {
        const enc = new TextEncoder().encode(passphrase);
        const base = await subtle.importKey('raw', enc, 'PBKDF2', false, ['deriveBits']);
        const derived = await subtle.deriveBits(
          { name: 'PBKDF2', hash: 'SHA-256', salt: salt.buffer as ArrayBuffer, iterations: PBKDF2_ITERATIONS },
          base,
          KEY_BYTES * 8,
        );
        return new Uint8Array(derived);
      },
      encryptGcm: async (key, iv, plaintext) => {
        const cryptoKey = await subtle.importKey('raw', key, 'AES-GCM', false, ['encrypt']);
        const out = await subtle.encrypt({ name: 'AES-GCM', iv: iv.buffer as ArrayBuffer, tagLength: 128 }, cryptoKey, plaintext.buffer as ArrayBuffer);
        const full = new Uint8Array(out);
        const tag = full.slice(full.length - 16);
        const ct = full.slice(0, full.length - 16);
        return { ciphertext: ct, tag };
      },
      decryptGcm: async (key, iv, ciphertext, tag) => {
        const cryptoKey = await subtle.importKey('raw', key, 'AES-GCM', false, ['decrypt']);
        const full = new Uint8Array(ciphertext.length + tag.length);
        full.set(ciphertext, 0);
        full.set(tag, ciphertext.length);
        const out = await subtle.decrypt({ name: 'AES-GCM', iv: iv.buffer as ArrayBuffer, tagLength: 128 }, cryptoKey, full.buffer as ArrayBuffer);
        return new Uint8Array(out);
      },
    };
  }
  return backend;
}

export async function randomBytes(n: number): Promise<Uint8Array> {
  const be = await getBackend();
  return be.randomBytes(n);
}

export async function deriveKey(passphrase: string, salt: Uint8Array): Promise<Uint8Array> {
  const be = await getBackend();
  return be.deriveKey(passphrase, salt);
}

export async function encryptAesGcm(
  key: Uint8Array,
  plaintext: Uint8Array,
): Promise<{ ciphertext: Uint8Array; iv: Uint8Array; tag: Uint8Array }> {
  const be = await getBackend();
  const iv = be.randomBytes(IV_BYTES);
  const { ciphertext, tag } = await be.encryptGcm(key, iv, plaintext);
  return { ciphertext, iv, tag };
}

export async function decryptAesGcm(
  key: Uint8Array,
  ciphertext: Uint8Array,
  iv: Uint8Array,
  tag: Uint8Array,
): Promise<Uint8Array> {
  const be = await getBackend();
  return be.decryptGcm(key, iv, ciphertext, tag);
}

export const cryptoConsts = {
  PBKDF2_ITERATIONS,
  SALT_BYTES,
  IV_BYTES,
  KEY_BYTES,
};
