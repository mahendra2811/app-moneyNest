/**
 * Calendar integration — I6.
 *
 * For each active recurring transaction, generate ICS event entries the
 * user can subscribe to. We export an ICS file rather than write to the
 * system calendar directly (no calendar permission needed, more portable).
 */
import { getAllRecurring } from '@/db/queries/recurring';
import dayjs from 'dayjs';

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function icsTimestamp(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
}

export async function buildRecurringIcs(): Promise<string> {
  const rows = await getAllRecurring();
  const lines: string[] = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//moneyNest//Recurring//EN'];
  for (const r of rows) {
    let tpl: { payee?: string; amountPaise?: number; note?: string };
    try {
      tpl = JSON.parse(r.templateJson);
    } catch {
      continue;
    }
    const start = dayjs(r.nextRunAt);
    const end = start.add(15, 'minute');
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${r.id}@moneynest`);
    lines.push(`DTSTAMP:${icsTimestamp(new Date().toISOString())}`);
    lines.push(`DTSTART:${icsTimestamp(start.toISOString())}`);
    lines.push(`DTEND:${icsTimestamp(end.toISOString())}`);
    lines.push(`SUMMARY:${tpl.payee ?? 'Recurring'} ${tpl.amountPaise ? `₹${tpl.amountPaise / 100}` : ''}`.trim());
    if (tpl.note) lines.push(`DESCRIPTION:${tpl.note}`);
    // Recurrence rule
    if (r.frequency === 'monthly') {
      lines.push(`RRULE:FREQ=MONTHLY;INTERVAL=${r.intervalCount}`);
    } else if (r.frequency === 'weekly') {
      lines.push(`RRULE:FREQ=WEEKLY;INTERVAL=${r.intervalCount}`);
    } else if (r.frequency === 'daily') {
      lines.push(`RRULE:FREQ=DAILY;INTERVAL=${r.intervalCount}`);
    } else {
      lines.push(`RRULE:FREQ=YEARLY;INTERVAL=${r.intervalCount}`);
    }
    lines.push('END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}
