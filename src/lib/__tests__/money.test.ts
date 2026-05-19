import { describe, it, expect } from 'vitest';
import { formatINR, formatINRShort, parseToPaise } from '../money';

describe('parseToPaise', () => {
  it('parses integer rupees', () => {
    expect(parseToPaise('250')).toBe(25000);
  });
  it('parses decimal rupees', () => {
    expect(parseToPaise('250.50')).toBe(25050);
    expect(parseToPaise('1.99')).toBe(199);
  });
  it('handles ₹ and commas', () => {
    expect(parseToPaise('₹1,200')).toBe(120000);
  });
  it('rejects negatives and junk', () => {
    expect(parseToPaise('-10')).toBeNull();
    expect(parseToPaise('abc')).toBeNull();
    expect(parseToPaise('')).toBeNull();
    expect(parseToPaise('1.234')).toBeNull();
  });
  it('accepts number input', () => {
    expect(parseToPaise(99.5)).toBe(9950);
  });
});

describe('formatINR', () => {
  it('formats with en-IN grouping', () => {
    expect(formatINR(25050)).toBe('₹250.50');
    expect(formatINR(120000)).toBe('₹1,200.00');
    expect(formatINR(10000000)).toBe('₹1,00,000.00');
  });
  it('handles zero and negatives', () => {
    expect(formatINR(0)).toBe('₹0.00');
    expect(formatINR(-25050)).toBe('-₹250.50');
  });
});

describe('formatINRShort', () => {
  it('uses lakh', () => {
    expect(formatINRShort(1_20_000 * 100)).toBe('₹1.2L');
  });
  it('uses crore', () => {
    expect(formatINRShort(3_40_00_000 * 100)).toBe('₹3.4Cr');
  });
  it('uses K', () => {
    expect(formatINRShort(2_500 * 100)).toBe('₹2.5K');
  });
  it('uses standard format below 1K', () => {
    expect(formatINRShort(99900)).toBe('₹999.00');
  });
});
