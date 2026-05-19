/**
 * Multi-currency support — C7.
 *
 * Stored as a "currency" string per account (already in schema). FX rates
 * are cached in settings (`fx.rates.<base>`) and refreshed on demand. This
 * module keeps everything pure — UI calls `convertToBase` after fetching.
 *
 * The on-device contract: rates come from a user-selected provider OR a
 * manual entry. We never auto-fetch by default (no servers per brief);
 * the user opts in via Settings.
 */
import { getSetting, setSetting } from '@/db/queries/settings';

export type FxRates = {
  base: string;
  fetchedAt: string;
  rates: Record<string, number>;
};

export async function getFxRates(base = 'INR'): Promise<FxRates | null> {
  return (await getSetting<FxRates>(`fx.rates.${base}`)) ?? null;
}

export async function saveFxRates(rates: FxRates): Promise<void> {
  await setSetting(`fx.rates.${rates.base}`, rates);
}

export function convertToBase(
  amountPaise: number,
  fromCurrency: string,
  rates: FxRates,
): number {
  if (fromCurrency === rates.base) return amountPaise;
  const r = rates.rates[fromCurrency];
  if (!r || r <= 0) return amountPaise;
  return Math.round(amountPaise / r);
}
