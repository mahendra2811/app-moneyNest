/**
 * Loan amortization + tax helpers — C4 + C16 + C17.
 */

export type AmortizationRow = {
  month: number;
  emiPaise: number;
  principalPaise: number;
  interestPaise: number;
  outstandingPaise: number;
};

/**
 * Standard EMI amortization schedule.
 *   p = principal (paise), r = monthly rate (apr/12/100), n = months
 */
export function amortize(principalPaise: number, apr: number, months: number): AmortizationRow[] {
  if (principalPaise <= 0 || months <= 0) return [];
  const r = apr / 12 / 100;
  const emi = r === 0
    ? principalPaise / months
    : (principalPaise * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  const out: AmortizationRow[] = [];
  let outstanding = principalPaise;
  for (let m = 1; m <= months; m++) {
    const interest = Math.round(outstanding * r);
    const principal = Math.round(emi - interest);
    outstanding = Math.max(0, outstanding - principal);
    out.push({
      month: m,
      emiPaise: Math.round(emi),
      principalPaise: principal,
      interestPaise: interest,
      outstandingPaise: outstanding,
    });
  }
  return out;
}

export type TaxSection = '80C' | '80D' | 'HRA' | '24B' | 'NPS' | 'OTHER';

export const TAX_SECTION_LIMITS_PAISE: Record<TaxSection, number> = {
  '80C': 1_50_000_00,
  '80D': 25_000_00,
  HRA: Number.MAX_SAFE_INTEGER,
  '24B': 2_00_000_00,
  NPS: 50_000_00,
  OTHER: Number.MAX_SAFE_INTEGER,
};
