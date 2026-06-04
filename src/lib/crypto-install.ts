/**
 * One-time WebCrypto polyfill for React Native. Imports
 * react-native-quick-crypto and calls its install() so that
 * globalThis.crypto.subtle exists. Must run before any crypto.ts call.
 *
 * Safe on Node — quick-crypto's install() is RN-only; we guard with a
 * native check (HermesInternal exists only in RN's Hermes engine).
 */
export function installCryptoPolyfill(): void {
  const g = globalThis as { HermesInternal?: unknown; crypto?: { subtle?: unknown } };
  // Already provisioned (Node test path or previous call)
  if (g.crypto && g.crypto.subtle) return;
  if (typeof g.HermesInternal === 'undefined') return;
  try {
    const qc = require('react-native-quick-crypto') as { install?: () => void };
    qc.install?.();
  } catch (e) {
    if (__DEV__) console.warn('[crypto] polyfill install failed', e);
  }
}
