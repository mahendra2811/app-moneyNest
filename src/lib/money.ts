/**
 * Money math — operates exclusively on integer paise.
 * Never floats, never strings beyond formatting boundaries.
 */

const PAISE_PER_RUPEE = 100;
const MAX_PAISE = 100_00_00_00_00_000; // 1,000 crore in paise — sanity cap

export function paiseToRupees(paise: number): number {
  return paise / PAISE_PER_RUPEE;
}

export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * PAISE_PER_RUPEE);
}

/** Format integer paise as "₹X.YZ" using en-IN grouping. */
export function formatINR(paise: number, opts?: { withSymbol?: boolean }): string {
  const withSymbol = opts?.withSymbol ?? true;
  const rupees = paiseToRupees(Math.abs(paise));
  const sign = paise < 0 ? '-' : '';
  const fmt = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const body = fmt.format(rupees);
  return `${sign}${withSymbol ? '₹' : ''}${body}`;
}

/** Format integer paise as compact "₹1.2L", "₹3.4Cr" when ≥ 1 lakh. */
export function formatINRShort(paise: number): string {
  const sign = paise < 0 ? '-' : '';
  const abs = Math.abs(paise);
  const rupees = paiseToRupees(abs);
  if (rupees >= 1_00_00_000) {
    const cr = rupees / 1_00_00_000;
    return `${sign}₹${trimZero(cr.toFixed(2))}Cr`;
  }
  if (rupees >= 1_00_000) {
    const lakh = rupees / 1_00_000;
    return `${sign}₹${trimZero(lakh.toFixed(2))}L`;
  }
  if (rupees >= 1_000) {
    const k = rupees / 1_000;
    return `${sign}₹${trimZero(k.toFixed(1))}K`;
  }
  return formatINR(paise);
}

function trimZero(s: string): string {
  return s.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
}

/**
 * Parse a string like "250", "250.50", "1,200" into integer paise.
 * Returns null on failure. Caps at MAX_PAISE.
 */
export function parseToPaise(input: string | number): number | null {
  if (typeof input === 'number') {
    if (!Number.isFinite(input) || input < 0) return null;
    return clamp(Math.round(input * PAISE_PER_RUPEE));
  }
  const cleaned = input.trim().replace(/[₹,\s]/g, '');
  if (cleaned === '') return null;
  if (!/^\d+(\.\d{0,2})?$/.test(cleaned)) return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n < 0) return null;
  return clamp(Math.round(n * PAISE_PER_RUPEE));
}

function clamp(paise: number): number | null {
  if (paise <= 0 || paise > MAX_PAISE) return null;
  return paise;
}

export function addPaise(a: number, b: number): number {
  return a + b;
}
export function subtractPaise(a: number, b: number): number {
  return a - b;
}
export function pctOf(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return numerator / denominator;
}
