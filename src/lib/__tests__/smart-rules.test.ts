import { describe, it, expect } from 'vitest';
import { matches, applyActions, type SmartRule, type TxLike } from '../smart-rules';

const baseRule: SmartRule = {
  id: 'r1',
  name: 'Small Swiggy → Food',
  enabled: true,
  conditions: [
    { kind: 'payee_contains', value: 'swiggy' },
    { kind: 'amount_lt', value: 50000 },
  ],
  actions: [{ kind: 'set_category', categoryId: 'cat-food' }],
  createdAt: new Date().toISOString(),
};

const tx: TxLike = {
  payee: 'Swiggy',
  note: null,
  amountPaise: 25000,
  type: 'expense',
  accountId: 'acc-1',
};

describe('smart rules', () => {
  it('matches when all conditions hold', () => {
    expect(matches(baseRule, tx)).toBe(true);
  });
  it('rejects when amount too high', () => {
    expect(matches(baseRule, { ...tx, amountPaise: 100000 })).toBe(false);
  });
  it('rejects when payee mismatch', () => {
    expect(matches(baseRule, { ...tx, payee: 'Zomato' })).toBe(false);
  });
  it('applyActions returns the category id', () => {
    expect(applyActions(baseRule).categoryId).toBe('cat-food');
  });
  it('disabled rule never matches', () => {
    expect(matches({ ...baseRule, enabled: false }, tx)).toBe(false);
  });
});
