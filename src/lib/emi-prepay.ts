/**
 * EMI prepayment optimizer — NEW-35.
 *
 * Pure: given multiple loans + a lump sum, return the optimal prepayment
 * allocation. Strategy = avalanche (highest APR first).
 */
import type { Loan } from '@/db/queries/goals';
import { amortize } from './finance-math';

export type PrepayAllocation = {
  loanId: string;
  loanName: string;
  prepayPaise: number;
  interestSavedPaise: number;
  monthsShortened: number;
};

export function allocatePrepay(loans: Loan[], lumpSumPaise: number): PrepayAllocation[] {
  const ranked = [...loans].sort((a, b) => b.apr - a.apr);
  let remaining = lumpSumPaise;
  const out: PrepayAllocation[] = [];

  for (const loan of ranked) {
    if (remaining <= 0) break;
    const prepay = Math.min(remaining, loan.outstandingPaise);
    if (prepay <= 0) continue;

    const beforeRows = amortize(loan.outstandingPaise, loan.apr, loan.termMonths);
    const beforeInterest = beforeRows.reduce((s, r) => s + r.interestPaise, 0);
    const beforeMonths = beforeRows.length;

    const afterPrincipal = loan.outstandingPaise - prepay;
    const afterRows = amortize(afterPrincipal, loan.apr, loan.termMonths);
    const afterInterest = afterRows.reduce((s, r) => s + r.interestPaise, 0);
    const afterMonths = afterRows.filter((r) => r.emiPaise > 0).length;

    out.push({
      loanId: loan.id,
      loanName: loan.name,
      prepayPaise: prepay,
      interestSavedPaise: Math.max(0, beforeInterest - afterInterest),
      monthsShortened: Math.max(0, beforeMonths - afterMonths),
    });
    remaining -= prepay;
  }
  return out;
}
