import { z } from 'zod';

export const isoDateString = z.string().refine(
  (s) => !Number.isNaN(Date.parse(s)),
  { message: 'Invalid ISO date' },
);

export const uuidString = z
  .string()
  .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, {
    message: 'Invalid UUID',
  });

export const positiveInt = z.number().int().positive();
export const nonNegativeInt = z.number().int().nonnegative();

export const hexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/);
