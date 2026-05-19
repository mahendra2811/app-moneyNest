import { describe, it, expect } from 'vitest';
import { interpret } from '../nl-filter';

describe('nl-filter', () => {
  it('"food > 500 last month"', () => {
    const r = interpret('food > 500 last month');
    expect(r.search).toBe('food');
    expect(r.minAmount).toBe(50000);
    expect(r.startDate).toBeDefined();
    expect(r.endDate).toBeDefined();
  });
  it('"swiggy this year"', () => {
    const r = interpret('swiggy this year');
    expect(r.search).toBe('swiggy');
    expect(r.startDate).toBeDefined();
  });
  it('"transfers"', () => {
    expect(interpret('transfers').type).toBe('transfer');
  });
  it('"income last 30 days"', () => {
    const r = interpret('income last 30 days');
    expect(r.type).toBe('income');
    expect(r.startDate).toBeDefined();
  });
  it('"under ek hazaar"', () => {
    const r = interpret('under ek hazaar');
    expect(r.maxAmount).toBe(100000);
  });
});
