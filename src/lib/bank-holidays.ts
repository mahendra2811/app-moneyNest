/**
 * India bank holiday awareness — NEW-38.
 *
 * Trimmed list of the most-impactful all-India bank holidays. Used by
 * recurring/bill calendars to nudge due-date to the next working day.
 */
const HOLIDAYS_2026: Set<string> = new Set([
  '2026-01-01', // New Year
  '2026-01-14', // Pongal/Makar Sankranti
  '2026-01-26', // Republic Day
  '2026-03-04', // Holi
  '2026-04-03', // Good Friday
  '2026-04-14', // Ambedkar Jayanti
  '2026-05-01', // May Day
  '2026-08-15', // Independence Day
  '2026-08-26', // Janmashtami
  '2026-10-02', // Gandhi Jayanti
  '2026-10-20', // Diwali (approx)
  '2026-12-25', // Christmas
]);

const HOLIDAYS_2027: Set<string> = new Set([
  '2027-01-01',
  '2027-01-26',
  '2027-03-23', // Holi (approx)
  '2027-08-15',
  '2027-10-02',
  '2027-12-25',
]);

export function isHoliday(iso: string): boolean {
  const day = iso.slice(0, 10);
  return HOLIDAYS_2026.has(day) || HOLIDAYS_2027.has(day);
}

export function nextWorkingDay(iso: string): string {
  let d = new Date(iso);
  // Move forward until not Sat/Sun and not a holiday
  while (d.getUTCDay() === 0 || d.getUTCDay() === 6 || isHoliday(d.toISOString())) {
    d = new Date(d.getTime() + 86400_000);
  }
  return d.toISOString();
}
