/**
 * AES-256-GCM + PBKDF2-SHA256 helpers, backed by Web Crypto.
 *
 * Both platforms expose the same SubtleCrypto API on `globalThis.crypto`:
 *   - Node 19+ has webcrypto natively → Vitest "just works"
 *   - React Native via `react-native-quick-crypto` install() polyfills it
 *
 * The app calls `installCryptoPolyfill()` once at startup
 * (see src/app/_layout.tsx). After that, every helper here uses the
 * standard WebCrypto API — no platform conditionals, no static
 * `node:crypto` imports for Metro to choke on.
 */

const PBKDF2_ITERATIONS = 250_000;
const SALT_BYTES = 16;
const IV_BYTES = 12;
const KEY_BYTES = 32;

type CryptoLike = {
  getRandomValues<T extends ArrayBufferView>(view: T): T;
  subtle: SubtleCrypto;
};

function getCrypto(): CryptoLike {
  const c = (globalThis as { crypto?: CryptoLike }).crypto;
  if (!c || !c.subtle) {
    throw new Error(
      'WebCrypto unavailable. Call installCryptoPolyfill() at startup on React Native, or ensure Node 19+ for tests.',
    );
  }
  return c;
}

export async function randomBytes(n: number): Promise<Uint8Array> {
  const out = new Uint8Array(n);
  getCrypto().getRandomValues(out);
  return out;
}

export async function deriveKey(
  passphrase: string,
  salt: Uint8Array,
): Promise<Uint8Array> {
  const subtle = getCrypto().subtle;
  const enc = new TextEncoder().encode(passphrase);
  const base = await subtle.importKey('raw', enc, 'PBKDF2', false, ['deriveBits']);
  const derived = await subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: salt.buffer as ArrayBuffer,
      iterations: PBKDF2_ITERATIONS,
    },
    base,
    KEY_BYTES * 8,
  );
  return new Uint8Array(derived);
}

export async function encryptAesGcm(
  key: Uint8Array,
  plaintext: Uint8Array,
): Promise<{ ciphertext: Uint8Array; iv: Uint8Array; tag: Uint8Array }> {
  const subtle = getCrypto().subtle;
  const iv = await randomBytes(IV_BYTES);
  const cryptoKey = await subtle.importKey('raw', key, 'AES-GCM', false, ['encrypt']);
  const sealed = await subtle.encrypt(
    { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer, tagLength: 128 },
    cryptoKey,
    plaintext.buffer as ArrayBuffer,
  );
  const full = new Uint8Array(sealed);
  const tag = full.slice(full.length - 16);
  const ciphertext = full.slice(0, full.length - 16);
  return { ciphertext, iv, tag };
}

export async function decryptAesGcm(
  key: Uint8Array,
  ciphertext: Uint8Array,
  iv: Uint8Array,
  tag: Uint8Array,
): Promise<Uint8Array> {
  const subtle = getCrypto().subtle;
  const cryptoKey = await subtle.importKey('raw', key, 'AES-GCM', false, ['decrypt']);
  const full = new Uint8Array(ciphertext.length + tag.length);
  full.set(ciphertext, 0);
  full.set(tag, ciphertext.length);
  const plain = await subtle.decrypt(
    { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer, tagLength: 128 },
    cryptoKey,
    full.buffer as ArrayBuffer,
  );
  return new Uint8Array(plain);
}

export const cryptoConsts = {
  PBKDF2_ITERATIONS,
  SALT_BYTES,
  IV_BYTES,
  KEY_BYTES,
};
