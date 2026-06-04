import { describe, it, expect } from 'vitest';
import { parseSms } from '../sms-parser';

describe('parseSms', () => {
  it('parses HDFC debit', () => {
    const r = parseSms(
      'Spent Rs.250.00 On HDFC Bank Card xx1234 At SWIGGY On 19-05-26. Avl bal Rs.18,200.',
    );
    expect(r).not.toBeNull();
    expect(r!.amountPaise).toBe(25000);
    expect(r!.type).toBe('expense');
    expect(r!.payee).toMatch(/SWIGGY/i);
    expect(r!.bankHint).toMatch(/HDFC/i);
  });

  it('parses PhonePe paid', () => {
    const r = parseSms('Paid Rs 1200 to Zomato from HDFC Bank using PhonePe. UPI Ref 22011a.');
    expect(r).not.toBeNull();
    expect(r!.amountPaise).toBe(120000);
    expect(r!.type).toBe('expense');
    expect(r!.payee).toMatch(/Zomato/i);
  });

  it('parses SBI credit (salary)', () => {
    const r = parseSms('Dear SBI User, your A/c xx1234 is credited by Rs.50000.00 on 01May26. Avl bal Rs.51,000.');
    expect(r).not.toBeNull();
    expect(r!.amountPaise).toBe(5000000);
    expect(r!.type).toBe('income');
  });

  it('rejects empty', () => {
    expect(parseSms('')).toBeNull();
  });

  it('rejects message with no amount', () => {
    expect(parseSms('Hello, this is not a bank message.')).toBeNull();
  });
});
