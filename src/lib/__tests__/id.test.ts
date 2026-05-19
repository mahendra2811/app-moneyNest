import { describe, it, expect } from 'vitest';
import { uuidv7 } from '../id';

describe('uuidv7', () => {
  it('returns a v7 UUID', () => {
    const id = uuidv7();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });
  it('is time-sortable', async () => {
    const a = uuidv7();
    await new Promise((r) => setTimeout(r, 5));
    const b = uuidv7();
    expect(a < b).toBe(true);
  });
});
