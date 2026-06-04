import { describe, it, expect } from 'vitest';
import { newSplit, computeBalances } from '../splits';

describe('splits', () => {
  it('one person paid, balance ledger reflects net', () => {
    const s = newSplit('Trip', [
      { id: 'a', name: 'A' },
      { id: 'b', name: 'B' },
      { id: 'c', name: 'C' },
    ]);
    s.charges.push({
      id: 'c1',
      paidById: 'a',
      amountPaise: 30000,
      splitWith: ['a', 'b', 'c'],
      occurredAt: new Date().toISOString(),
    });
    const bal = computeBalances(s);
    // A paid 300, split 100 each. Net: A = +300 -100 = +200, B = -100, C = -100.
    expect(bal.a).toBe(20000);
    expect(bal.b).toBe(-10000);
    expect(bal.c).toBe(-10000);
  });
});
