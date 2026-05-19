import { describe, it, expect } from 'vitest';
import { allocatePrepay } from '../emi-prepay';
import type { Loan } from '@/db/queries/goals';

describe('emi-prepay', () => {
  it('allocates to highest APR first (avalanche)', () => {
    const loans: Loan[] = [
      { id: 'a', name: 'Personal', principalPaise: 5_00_000_00, outstandingPaise: 3_00_000_00, apr: 14, monthlyEmiPaise: 12000_00, startDate: '2024-01-01', termMonths: 24 },
      { id: 'b', name: 'Home', principalPaise: 30_00_000_00, outstandingPaise: 25_00_000_00, apr: 8.5, monthlyEmiPaise: 25000_00, startDate: '2023-01-01', termMonths: 240 },
    ];
    const out = allocatePrepay(loans, 1_00_000_00);
    expect(out[0]!.loanId).toBe('a');
    expect(out[0]!.prepayPaise).toBe(1_00_000_00);
    expect(out[0]!.interestSavedPaise).toBeGreaterThan(0);
  });
  it('rolls over to next loan when first is fully paid', () => {
    const loans: Loan[] = [
      { id: 'a', name: 'Personal', principalPaise: 5_00_000_00, outstandingPaise: 50_000_00, apr: 14, monthlyEmiPaise: 12000_00, startDate: '2024-01-01', termMonths: 6 },
      { id: 'b', name: 'Home', principalPaise: 30_00_000_00, outstandingPaise: 25_00_000_00, apr: 8.5, monthlyEmiPaise: 25000_00, startDate: '2023-01-01', termMonths: 240 },
    ];
    const out = allocatePrepay(loans, 2_00_000_00);
    expect(out[0]!.prepayPaise).toBe(50_000_00);
    expect(out[1]!.loanId).toBe('b');
    expect(out[1]!.prepayPaise).toBe(1_50_000_00);
  });
});
