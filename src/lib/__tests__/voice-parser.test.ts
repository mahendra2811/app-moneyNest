import { describe, it, expect } from 'vitest';
import { parseUtterance } from '../voice-parser';
import { parseAmountToPaise } from '../voice-parser-numbers';

describe('parseAmountToPaise', () => {
  it('parses bare digit', () => {
    expect(parseAmountToPaise('250')).toBe(25000);
  });
  it('parses decimal', () => {
    expect(parseAmountToPaise('250.50')).toBe(25050);
  });
  it('ignores ₹ and commas', () => {
    expect(parseAmountToPaise('₹1,200')).toBe(120000);
  });
  it('parses ek sau = 100', () => {
    expect(parseAmountToPaise('ek sau')).toBe(10000);
  });
  it('parses do sau = 200', () => {
    expect(parseAmountToPaise('do sau')).toBe(20000);
  });
  it('parses paanch sau = 500', () => {
    expect(parseAmountToPaise('paanch sau')).toBe(50000);
  });
  it('parses ek hazaar = 1000', () => {
    expect(parseAmountToPaise('ek hazaar')).toBe(100000);
  });
  it('parses das hazaar = 10000', () => {
    expect(parseAmountToPaise('das hazaar')).toBe(1000000);
  });
  it('parses ek lakh', () => {
    expect(parseAmountToPaise('ek lakh')).toBe(10000000);
  });
  it('parses 5 hazaar = 5000', () => {
    expect(parseAmountToPaise('5 hazaar')).toBe(500000);
  });
  it('rejects empty', () => {
    expect(parseAmountToPaise('')).toBeNull();
  });
  it('rejects gibberish', () => {
    expect(parseAmountToPaise('hello world')).toBeNull();
  });
});

describe('parseUtterance — pattern 1 (amount + category)', () => {
  it('"250 chai"', () => {
    const r = parseUtterance('250 chai');
    expect(r.amountPaise).toBe(25000);
    expect(r.categorySlug).toBe('food');
    expect(r.type).toBe('expense');
    expect(r.confidence).toBeGreaterThanOrEqual(0.6);
  });
  it('"450 petrol"', () => {
    const r = parseUtterance('450 petrol');
    expect(r.amountPaise).toBe(45000);
    expect(r.categorySlug).toBe('fuel');
  });
  it('"1200 grocery"', () => {
    const r = parseUtterance('1200 grocery');
    expect(r.amountPaise).toBe(120000);
    expect(r.categorySlug).toBe('groceries');
  });
  it('"500 movie"', () => {
    const r = parseUtterance('500 movie');
    expect(r.categorySlug).toBe('entertainment');
  });
  it('"250 ka chai"', () => {
    const r = parseUtterance('250 ka chai');
    expect(r.amountPaise).toBe(25000);
    expect(r.categorySlug).toBe('food');
  });
  it('"300 ki coffee"', () => {
    const r = parseUtterance('300 ki coffee');
    expect(r.amountPaise).toBe(30000);
    expect(r.categorySlug).toBe('food');
  });
  it('"700 me rent"', () => {
    const r = parseUtterance('700 me rent');
    expect(r.amountPaise).toBe(70000);
    expect(r.categorySlug).toBe('rent');
  });
});

describe('parseUtterance — pattern 2 (action + amount)', () => {
  it('"spent 1200 at swiggy"', () => {
    const r = parseUtterance('spent 1200 at swiggy');
    expect(r.amountPaise).toBe(120000);
    expect(r.type).toBe('expense');
    expect(r.payee).toBe('Swiggy');
    expect(r.categorySlug).toBe('food');
  });
  it('"paid 5000 for rent"', () => {
    const r = parseUtterance('paid 5000 for rent');
    expect(r.amountPaise).toBe(500000);
    expect(r.categorySlug).toBe('rent');
  });
  it('"bought groceries 1500"', () => {
    const r = parseUtterance('bought groceries 1500');
    expect(r.amountPaise).toBe(150000);
    expect(r.categorySlug).toBe('groceries');
  });
});

describe('parseUtterance — pattern 3 (income)', () => {
  it('"got 50000 salary"', () => {
    const r = parseUtterance('got 50000 salary');
    expect(r.amountPaise).toBe(5000000);
    expect(r.type).toBe('income');
    expect(r.categorySlug).toBe('salary');
  });
  it('"received 5000 freelance"', () => {
    const r = parseUtterance('received 5000 freelance');
    expect(r.type).toBe('income');
    expect(r.categorySlug).toBe('freelance');
  });
  it('"salary aayi 60000"', () => {
    const r = parseUtterance('salary aayi 60000');
    expect(r.type).toBe('income');
    expect(r.amountPaise).toBe(6000000);
  });
  it('"refund mila 350"', () => {
    const r = parseUtterance('refund mila 350');
    expect(r.type).toBe('income');
    expect(r.categorySlug).toBe('refund');
  });
});

describe('parseUtterance — pattern 4 (transfer)', () => {
  it('"transfer 5000 hdfc to paytm"', () => {
    const r = parseUtterance('transfer 5000 hdfc to paytm');
    expect(r.type).toBe('transfer');
    expect(r.amountPaise).toBe(500000);
    expect(r.accountHint).toBe('Hdfc');
    expect(r.toAccountHint).toBe('Paytm');
  });
  it('"moved 2000 from cash to upi"', () => {
    const r = parseUtterance('moved 2000 from cash to upi');
    expect(r.type).toBe('transfer');
    expect(r.amountPaise).toBe(200000);
  });
});

describe('parseUtterance — pattern 5 (date)', () => {
  it('"yesterday 250 chai"', () => {
    const r = parseUtterance('yesterday 250 chai');
    expect(r.dateHint).toBe('yesterday');
  });
  it('"kal 500 petrol"', () => {
    const r = parseUtterance('kal 500 petrol');
    expect(r.dateHint).toBe('yesterday');
  });
  it('"aaj 300 lunch"', () => {
    const r = parseUtterance('aaj 300 lunch');
    expect(r.dateHint).toBe('today');
  });
  it('"parso 1500 groceries"', () => {
    const r = parseUtterance('parso 1500 groceries');
    expect(r.dateHint).toBe('parso');
  });
});

describe('parseUtterance — pattern 6 (Hinglish numbers)', () => {
  it('"do sau rupaye chai"', () => {
    const r = parseUtterance('do sau rupaye chai');
    expect(r.amountPaise).toBe(20000);
    expect(r.categorySlug).toBe('food');
  });
  it('"paanch sau ka petrol"', () => {
    const r = parseUtterance('paanch sau ka petrol');
    expect(r.amountPaise).toBe(50000);
    expect(r.categorySlug).toBe('fuel');
  });
  it('"ek hazaar groceries"', () => {
    const r = parseUtterance('ek hazaar groceries');
    expect(r.amountPaise).toBe(100000);
    expect(r.categorySlug).toBe('groceries');
  });
  it('"das hazaar rent"', () => {
    const r = parseUtterance('das hazaar rent');
    expect(r.amountPaise).toBe(1000000);
    expect(r.categorySlug).toBe('rent');
  });
  it('"ek lakh salary mila"', () => {
    const r = parseUtterance('ek lakh salary mila');
    expect(r.amountPaise).toBe(10000000);
    expect(r.type).toBe('income');
  });
});

describe('parseUtterance — pattern 7 (edge cases)', () => {
  it('empty returns confidence 0', () => {
    expect(parseUtterance('').confidence).toBe(0);
  });
  it('"hello" returns 0 confidence (no amount)', () => {
    const r = parseUtterance('hello');
    expect(r.confidence).toBeLessThanOrEqual(0.1);
  });
  it('"250" parses amount but low confidence (no category)', () => {
    const r = parseUtterance('250');
    expect(r.amountPaise).toBe(25000);
    expect(r.confidence).toBeLessThan(0.7);
  });
  it('"chai" without amount falls back', () => {
    const r = parseUtterance('chai');
    expect(r.amountPaise).toBeNull();
    expect(r.confidence).toBeLessThanOrEqual(0.1);
  });
  it('forgiving: "abcd 250 efgh chai"', () => {
    const r = parseUtterance('abcd 250 efgh chai');
    expect(r.amountPaise).toBe(25000);
    expect(r.categorySlug).toBe('food');
  });
});

describe('parseUtterance — confidence thresholds', () => {
  it('high confidence: amount + intent + category + payee + date', () => {
    const r = parseUtterance('spent 250 at swiggy yesterday');
    expect(r.confidence).toBeGreaterThanOrEqual(0.7);
  });
  it('medium confidence: amount + category only', () => {
    const r = parseUtterance('250 chai');
    expect(r.confidence).toBeGreaterThanOrEqual(0.4);
    expect(r.confidence).toBeLessThan(0.9);
  });
  it('low confidence: just amount', () => {
    const r = parseUtterance('250');
    expect(r.confidence).toBeLessThan(0.7);
  });
});
