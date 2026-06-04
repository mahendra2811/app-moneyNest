import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = 'Asia/Kolkata';

export type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export type ComputeNextRunInput = {
  frequency: Frequency;
  intervalCount: number;
  dayOfMonth?: number | null;
  dayOfWeek?: number | null;
  fromIso: string;
  // If true, the result must be strictly after fromIso. Default true.
  strictlyAfter?: boolean;
};

/**
 * Pure: compute the next run-at timestamp for a recurring template.
 * Day-of-month clamps to last day of shorter months (e.g. Feb 30 → Feb 28/29).
 */
export function computeNextRun(opts: ComputeNextRunInput): string {
  const step = Math.max(1, opts.intervalCount);
  const after = opts.strictlyAfter ?? true;
  let cursor = dayjs(opts.fromIso).tz(TZ);

  switch (opts.frequency) {
    case 'daily': {
      cursor = cursor.add(step, 'day');
      return cursor.utc().toISOString();
    }
    case 'weekly': {
      const targetDow = (opts.dayOfWeek ?? cursor.day()) % 7;
      let next = cursor.add(step, 'week').day(targetDow);
      if (after && !next.isAfter(cursor)) next = next.add(7, 'day');
      return next.utc().toISOString();
    }
    case 'monthly': {
      const day = opts.dayOfMonth ?? cursor.date();
      let next = cursor.add(step, 'month');
      const lastDay = next.daysInMonth();
      next = next.date(Math.min(day, lastDay));
      if (after && !next.isAfter(cursor)) {
        next = next.add(1, 'month');
        next = next.date(Math.min(day, next.daysInMonth()));
      }
      return next.utc().toISOString();
    }
    case 'yearly': {
      const next = cursor.add(step, 'year');
      return next.utc().toISOString();
    }
  }
}
