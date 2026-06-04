/**
 * UUID v7: time-sortable, 128-bit identifier.
 * Format: xxxxxxxx-xxxx-7xxx-yxxx-xxxxxxxxxxxx (y = 8..b)
 *
 * Implementation is dependency-free and node/RN-safe.
 */

function randomBytes(n: number): Uint8Array {
  const bytes = new Uint8Array(n);
  const g = globalThis as { crypto?: { getRandomValues?: (a: Uint8Array) => Uint8Array } };
  if (g.crypto && typeof g.crypto.getRandomValues === 'function') {
    g.crypto.getRandomValues(bytes);
    return bytes;
  }
  // Fallback (last resort) — not cryptographically strong but acceptable for IDs.
  for (let i = 0; i < n; i++) bytes[i] = Math.floor(Math.random() * 256);
  return bytes;
}

function toHex(b: Uint8Array): string {
  let s = '';
  for (let i = 0; i < b.length; i++) {
    s += (b[i]! < 16 ? '0' : '') + b[i]!.toString(16);
  }
  return s;
}

export function uuidv7(): string {
  const now = Date.now();
  const tsHex = now.toString(16).padStart(12, '0'); // 48 bits
  const rand = randomBytes(10);

  // version: 7, set high nibble of byte 6 to 0x7
  rand[0] = ((rand[0] ?? 0) & 0x0f) | 0x70;
  // variant: 10xx, set high two bits of byte 8
  rand[2] = ((rand[2] ?? 0) & 0x3f) | 0x80;

  const randHex = toHex(rand);
  return (
    tsHex.slice(0, 8) +
    '-' +
    tsHex.slice(8, 12) +
    '-' +
    randHex.slice(0, 4) +
    '-' +
    randHex.slice(4, 8) +
    '-' +
    randHex.slice(8, 20)
  );
}
