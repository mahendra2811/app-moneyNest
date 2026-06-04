/**
 * NEW-52 — per-screen privacy blur. Toggle that masks amounts as "₹•••".
 */
import { getSetting, setSetting } from '@/db/queries/settings';

export async function isBlurred(): Promise<boolean> {
  return (await getSetting<boolean>('privacy.blur')) ?? false;
}
export async function setBlurred(v: boolean): Promise<void> {
  await setSetting('privacy.blur', v);
}

export function maskAmount(formatted: string, blurred: boolean): string {
  if (!blurred) return formatted;
  return formatted.replace(/[0-9.,]/g, '•');
}
