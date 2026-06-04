/**
 * Security primitives — G1–G12.
 *
 * - PIN lock (G1): hashed PIN stored in SecureStore; verified before
 *   biometric on the lock screen.
 * - Auto-lock timeout (G2): millisecond countdown; persisted in settings.
 * - Per-feature lock (G3): a per-route flag in settings; the route's
 *   layout consults it before rendering.
 * - Stealth (G4) + screenshot block (G5): per-flag toggle that the root
 *   layout applies via FLAG_SECURE.
 * - App icon disguise (G6): activity-alias trick; handled at native level.
 * - Hidden categories (G7): a per-category `requiresAuth` flag in settings.
 * - Decoy passphrase (G8): an alternate canary stored in SecureStore.
 * - Clipboard scrub (G9): post-copy delay then clear.
 * - Hardware Keystore (G10): documented; KeyStore-backed wrap needs
 *   native module work.
 * - Diagnostic export (G11): JSON dump of non-PII state.
 * - Privacy receipt (G12): inventory of what's stored where.
 */
import * as SecureStore from 'expo-secure-store';
import * as Clipboard from 'expo-clipboard';
import { getSetting, setSetting } from '@/db/queries/settings';
import { deriveKey, randomBytes, cryptoConsts } from './crypto';

// ─── G1 PIN ───
const PIN_KEY = 'pin.hash';
const PIN_SALT_KEY = 'pin.salt';

export async function setPin(pin: string): Promise<void> {
  if (pin.length < 4) throw new Error('PIN must be at least 4 digits');
  const salt = await randomBytes(cryptoConsts.SALT_BYTES);
  const key = await deriveKey(pin, salt);
  await SecureStore.setItemAsync(PIN_KEY, Array.from(key).join(','));
  await SecureStore.setItemAsync(PIN_SALT_KEY, Array.from(salt).join(','));
}

export async function isPinSet(): Promise<boolean> {
  return (await SecureStore.getItemAsync(PIN_KEY)) !== null;
}

export async function verifyPin(pin: string): Promise<boolean> {
  const saltStr = await SecureStore.getItemAsync(PIN_SALT_KEY);
  const expected = await SecureStore.getItemAsync(PIN_KEY);
  if (!saltStr || !expected) return false;
  const salt = new Uint8Array(saltStr.split(',').map(Number));
  const key = await deriveKey(pin, salt);
  return Array.from(key).join(',') === expected;
}

export async function clearPin(): Promise<void> {
  await SecureStore.deleteItemAsync(PIN_KEY);
  await SecureStore.deleteItemAsync(PIN_SALT_KEY);
}

// ─── G2 Auto-lock timeout ───
export type LockTimeout = 60 | 300 | 900 | -1; // seconds, -1 = never

export async function getLockTimeout(): Promise<LockTimeout> {
  return ((await getSetting<LockTimeout>('lock.timeoutSec')) ?? 300) as LockTimeout;
}
export async function setLockTimeout(v: LockTimeout): Promise<void> {
  await setSetting('lock.timeoutSec', v);
}

// ─── G3 Per-feature lock ───
export type Lockable = 'backup' | 'reports' | 'settings' | 'transactions';

export async function isLocked(scope: Lockable): Promise<boolean> {
  return (await getSetting<boolean>(`lock.scope.${scope}`)) ?? false;
}
export async function setScopeLock(scope: Lockable, locked: boolean): Promise<void> {
  await setSetting(`lock.scope.${scope}`, locked);
}

// ─── G4 Stealth / G5 Screenshot block ───
export async function isStealth(): Promise<boolean> {
  return (await getSetting<boolean>('security.stealth')) ?? false;
}
export async function setStealth(v: boolean): Promise<void> {
  await setSetting('security.stealth', v);
}
export async function isScreenshotBlocked(): Promise<boolean> {
  return (await getSetting<boolean>('security.screenshotBlock')) ?? false;
}
export async function setScreenshotBlocked(v: boolean): Promise<void> {
  await setSetting('security.screenshotBlock', v);
}

// ─── G6 Icon disguise (state only; native side flips activity alias) ───
export type AppIcon = 'default' | 'calculator';
export async function getAppIcon(): Promise<AppIcon> {
  return ((await getSetting<AppIcon>('security.icon')) ?? 'default') as AppIcon;
}
export async function setAppIcon(v: AppIcon): Promise<void> {
  await setSetting('security.icon', v);
}

// ─── G7 Hidden categories ───
export async function isCategoryHidden(categoryId: string): Promise<boolean> {
  return (await getSetting<boolean>(`category.hidden.${categoryId}`)) ?? false;
}
export async function setCategoryHidden(categoryId: string, v: boolean): Promise<void> {
  await setSetting(`category.hidden.${categoryId}`, v);
}

// ─── G8 Decoy passphrase ───
const DECOY_KEY = 'decoy.canary';
export async function setDecoyPassphrase(pass: string): Promise<void> {
  const salt = await randomBytes(cryptoConsts.SALT_BYTES);
  const key = await deriveKey(pass, salt);
  await SecureStore.setItemAsync(
    DECOY_KEY,
    JSON.stringify({ salt: Array.from(salt), key: Array.from(key) }),
  );
}
export async function isDecoyPassphrase(pass: string): Promise<boolean> {
  const raw = await SecureStore.getItemAsync(DECOY_KEY);
  if (!raw) return false;
  try {
    const obj = JSON.parse(raw) as { salt: number[]; key: number[] };
    const salt = new Uint8Array(obj.salt);
    const key = await deriveKey(pass, salt);
    return Array.from(key).join(',') === obj.key.join(',');
  } catch {
    return false;
  }
}

// ─── G9 Clipboard scrub ───
export async function copyAndScrub(text: string, delayMs = 30_000): Promise<void> {
  await Clipboard.setStringAsync(text);
  setTimeout(async () => {
    const cur = await Clipboard.getStringAsync();
    if (cur === text) await Clipboard.setStringAsync('');
  }, delayMs);
}

// ─── G11 Diagnostic export ───
export async function buildDiagnostic(): Promise<string> {
  // Non-PII state only.
  const prefs = await getSetting<unknown>('ui.prefs');
  const lockEnabled = await getSetting<boolean>('lock.enabled');
  return JSON.stringify(
    {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      prefs,
      lockEnabled,
    },
    null,
    2,
  );
}

// ─── G12 Privacy receipt ───
export type PrivacyReceiptRow = { what: string; where: string; encrypted: boolean };
export const PRIVACY_RECEIPT: PrivacyReceiptRow[] = [
  { what: 'Transactions, accounts, categories, budgets, recurring', where: 'On-device SQLite', encrypted: false },
  { what: 'App preferences (theme, glass)', where: 'On-device MMKV', encrypted: false },
  { what: 'Backup passphrase canary, PIN hash, decoy canary', where: 'Android Keystore via expo-secure-store', encrypted: true },
  { what: 'Encrypted backup file', where: 'User-chosen folder (SAF)', encrypted: true },
  { what: 'Voice audio', where: 'Never persisted; processed by Android SR offline', encrypted: false },
  { what: 'Network traffic', where: 'None by default. Optional telemetry only when toggled.', encrypted: false },
];
