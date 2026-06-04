import { describe, it, expect } from 'vitest';
import {
  now,
  startOfMonthLocal,
  endOfMonthLocal,
  formatRelativeDay,
  addDays,
} from '../date';

describe('date helpers', () => {
  it('now() returns an ISO string', () => {
    const s = now();
    expect(typeof s).toBe('string');
    expect(Number.isFinite(Date.parse(s))).toBe(true);
  });

  it('month boundaries are ISO strings', () => {
    const start = startOfMonthLocal('2026-05-19T08:30:00.000Z');
    const end = endOfMonthLocal('2026-05-19T08:30:00.000Z');
    expect(Date.parse(start)).toBeLessThan(Date.parse(end));
  });

  it('formatRelativeDay produces a label', () => {
    expect(['Today', 'Yesterday', 'Tomorrow']).toContain(
      formatRelativeDay(now()),
    );
  });

  it('addDays moves forward', () => {
    const a = now();
    const b = addDays(a, 1);
    expect(Date.parse(b) - Date.parse(a)).toBeCloseTo(86400000, -3);
  });
});
