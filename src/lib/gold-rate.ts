/**
 * Gold/silver rate tracker — C20.
 *
 * We do NOT auto-fetch rates (no servers in V1 brief). The user manually
 * updates the rate; we keep the last value and date in settings. The UI
 * computes "current value" of gold holdings.
 *
 * If the user later opts in to a public rate source, swap `fetchRate`.
 */
import { getSetting, setSetting } from '@/db/queries/settings';

export type CommodityRate = {
  symbol: 'gold24k_g' | 'gold22k_g' | 'silver_g';
  ratePaise: number;
  updatedAt: string;
};

export async function getRate(symbol: CommodityRate['symbol']): Promise<CommodityRate | null> {
  return (await getSetting<CommodityRate>(`commodity.${symbol}`)) ?? null;
}
export async function setRate(symbol: CommodityRate['symbol'], ratePaise: number): Promise<void> {
  await setSetting(`commodity.${symbol}`, {
    symbol,
    ratePaise,
    updatedAt: new Date().toISOString(),
  });
}
