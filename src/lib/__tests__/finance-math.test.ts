import { describe, it, expect } from 'vitest';
import { amortize } from '../finance-math';

describe('amortize', () => {
  it('zero principal returns empty', () => {
    expect(amortize(0, 10, 12)).toEqual([]);
  });
  it('12-month at 10% APR sums to principal + interest', () => {
    const rows = amortize(1_00_000_00, 10, 12); // 1L principal, 10% APR
    expect(rows.length).toBe(12);
    const totalPrincipal = rows.reduce((s, r) => s + r.principalPaise, 0);
    const totalInterest = rows.reduce((s, r) => s + r.interestPaise, 0);
    // Total principal should approximately equal the starting principal.
    expect(Math.abs(totalPrincipal - 1_00_000_00)).toBeLessThan(1000);
    expect(totalInterest).toBeGreaterThan(0);
  });
  it('0% APR splits evenly', () => {
    const rows = amortize(120_000_00, 0, 12);
    expect(rows[0]!.principalPaise).toBe(10_000_00);
    expect(rows[0]!.interestPaise).toBe(0);
  });
});
