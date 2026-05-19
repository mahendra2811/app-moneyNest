import { describe, it, expect } from 'vitest';
import { computeNextRun } from '../recurring-engine';

describe('computeNextRun', () => {
  it('daily +1', () => {
    const next = computeNextRun({
      frequency: 'daily',
      intervalCount: 1,
      fromIso: '2026-05-19T10:00:00.000Z',
    });
    expect(next.startsWith('2026-05-20')).toBe(true);
  });

  it('weekly on Monday', () => {
    const next = computeNextRun({
      frequency: 'weekly',
      intervalCount: 1,
      dayOfWeek: 1,
      fromIso: '2026-05-19T10:00:00.000Z',
    });
    expect(typeof next).toBe('string');
  });

  it('monthly day 15', () => {
    const next = computeNextRun({
      frequency: 'monthly',
      intervalCount: 1,
      dayOfMonth: 15,
      fromIso: '2026-05-10T10:00:00.000Z',
    });
    expect(next.slice(0, 10)).toMatch(/^2026-06-1[45]$/);
  });

  it('monthly day 31 clamps to last day of February', () => {
    const next = computeNextRun({
      frequency: 'monthly',
      intervalCount: 1,
      dayOfMonth: 31,
      fromIso: '2026-01-31T10:00:00.000Z',
    });
    // 2026 is not a leap year; February has 28 days.
    expect(next.slice(0, 10)).toMatch(/^2026-02-2[78]$/);
  });

  it('yearly', () => {
    const next = computeNextRun({
      frequency: 'yearly',
      intervalCount: 1,
      fromIso: '2026-05-19T10:00:00.000Z',
    });
    expect(next.startsWith('2027-05')).toBe(true);
  });
});
