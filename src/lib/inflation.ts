/**
 * Inflation-adjusted view — NEW-25.
 *
 * Static CPI table for India (rebased to 2020 = 100). Update yearly.
 * The point is "buying power", not real-time CPI fetch.
 */
const CPI_2020_BASE: Record<string, number> = {
  '2018': 89.1,
  '2019': 92.3,
  '2020': 100,
  '2021': 105.5,
  '2022': 112.7,
  '2023': 119.8,
  '2024': 125.3,
  '2025': 130.5,
  '2026': 135.4,
};

export function adjustToCurrent(amountPaise: number, fromYear: string, toYear = String(new Date().getUTCFullYear())): number {
  const from = CPI_2020_BASE[fromYear];
  const to = CPI_2020_BASE[toYear];
  if (!from || !to) return amountPaise;
  return Math.round(amountPaise * (to / from));
}
