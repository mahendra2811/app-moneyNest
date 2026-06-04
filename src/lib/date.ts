import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const TZ = 'Asia/Kolkata';

export function now(): string {
  return dayjs().toISOString();
}

export function toLocal(iso: string) {
  return dayjs(iso).tz(TZ);
}

export function fromLocal(local: dayjs.Dayjs): string {
  return local.utc().toISOString();
}

export function startOfMonthLocal(d?: string): string {
  return dayjs(d ?? now()).tz(TZ).startOf('month').utc().toISOString();
}
export function endOfMonthLocal(d?: string): string {
  return dayjs(d ?? now()).tz(TZ).endOf('month').utc().toISOString();
}
export function startOfDayLocal(d?: string): string {
  return dayjs(d ?? now()).tz(TZ).startOf('day').utc().toISOString();
}
export function endOfDayLocal(d?: string): string {
  return dayjs(d ?? now()).tz(TZ).endOf('day').utc().toISOString();
}

export function addDays(iso: string, n: number): string {
  return dayjs(iso).add(n, 'day').toISOString();
}
export function addMonths(iso: string, n: number): string {
  return dayjs(iso).add(n, 'month').toISOString();
}
export function addYears(iso: string, n: number): string {
  return dayjs(iso).add(n, 'year').toISOString();
}

export function formatDate(iso: string, fmt = 'DD MMM YYYY'): string {
  return dayjs(iso).tz(TZ).format(fmt);
}
export function formatTime(iso: string): string {
  return dayjs(iso).tz(TZ).format('hh:mm A');
}
export function formatRelativeDay(iso: string): string {
  const d = dayjs(iso).tz(TZ).startOf('day');
  const today = dayjs().tz(TZ).startOf('day');
  const diff = d.diff(today, 'day');
  if (diff === 0) return 'Today';
  if (diff === -1) return 'Yesterday';
  if (diff === 1) return 'Tomorrow';
  if (diff > -7 && diff < 0) return d.format('dddd');
  return d.format('DD MMM');
}

export function monthLabel(iso: string): string {
  return dayjs(iso).tz(TZ).format('MMMM YYYY');
}

export function isBefore(a: string, b: string): boolean {
  return dayjs(a).isBefore(b);
}
export function isAfter(a: string, b: string): boolean {
  return dayjs(a).isAfter(b);
}
