/**
 * Custom dashboard cards — NEW-49.
 *
 * Pick which cards appear on home, in what order. Defaults give the
 * existing layout.
 */
import { getSetting, setSetting } from '@/db/queries/settings';

export type DashCard =
  | 'hero_month'
  | 'today_section'
  | 'recent_section'
  | 'budget_pulse'
  | 'spending_velocity'    // NEW-21
  | 'subscriptions'
  | 'goals_progress'
  | 'anomaly_feed'
  | 'forecast'
  | 'top_categories';

const DEFAULT_CARDS: DashCard[] = ['hero_month', 'today_section', 'recent_section'];

export async function getDashCards(): Promise<DashCard[]> {
  return (await getSetting<DashCard[]>('dashboard.cards')) ?? DEFAULT_CARDS;
}
export async function setDashCards(cards: DashCard[]): Promise<void> {
  await setSetting('dashboard.cards', cards);
}

export const ALL_CARDS: { id: DashCard; label: string }[] = [
  { id: 'hero_month', label: 'This month hero' },
  { id: 'today_section', label: "Today's transactions" },
  { id: 'recent_section', label: 'Recent transactions' },
  { id: 'budget_pulse', label: 'Budget pulse' },
  { id: 'spending_velocity', label: 'Spending velocity' },
  { id: 'subscriptions', label: 'Subscription burn' },
  { id: 'goals_progress', label: 'Goals progress' },
  { id: 'anomaly_feed', label: 'Anomalies' },
  { id: 'forecast', label: '30-day forecast' },
  { id: 'top_categories', label: 'Top categories' },
];
