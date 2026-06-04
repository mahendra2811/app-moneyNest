/**
 * Monetization — J1–J4.
 *
 * V1 brief defers RevenueCat wiring. We expose a SubscriptionStatus type
 * and a settings-backed entitlement so screens can gate premium features.
 * When RevenueCat is wired, swap `getEntitlement` with the real call.
 */
import { getSetting, setSetting } from '@/db/queries/settings';

export type Tier = 'free' | 'plus_monthly' | 'plus_yearly' | 'lifetime' | 'family';

export type Entitlement = {
  tier: Tier;
  active: boolean;
  validUntilIso?: string;
};

export async function getEntitlement(): Promise<Entitlement> {
  return (await getSetting<Entitlement>('entitlement')) ?? { tier: 'free', active: false };
}

export async function setEntitlement(e: Entitlement): Promise<void> {
  await setSetting('entitlement', e);
}

export const PREMIUM_FEATURES = [
  'custom_themes',
  'cloud_sync',
  'family_share',
  'itr_export',
  'advanced_reports',
  'unlimited_backups',
] as const;
export type PremiumFeature = (typeof PREMIUM_FEATURES)[number];

export async function isUnlocked(_feature: PremiumFeature): Promise<boolean> {
  const e = await getEntitlement();
  if (!e.active) return false;
  if (e.tier === 'free') return false;
  return true;
}

// J4 donation amounts (used to generate UPI links via buildUpiUri)
export const DONATION_AMOUNTS = [50, 100, 250, 500, 1000] as const;
