/**
 * Subscription cancellation deep links — NEW-13.
 *
 * Per provider, a deep link or steps URL. UI consults this when showing
 * a subscription row.
 */
export const CANCELLATION_URLS: Record<string, { url: string; how: string }> = {
  netflix:   { url: 'https://www.netflix.com/cancelplan', how: 'Netflix → Account → Cancel membership' },
  spotify:   { url: 'https://www.spotify.com/account/subscription/', how: 'Spotify → Subscription → Cancel premium' },
  prime:     { url: 'https://www.amazon.in/amazonprime', how: 'Amazon Prime → Manage membership → End membership' },
  hotstar:   { url: 'https://www.hotstar.com/in/subscribe/myaccount', how: 'Hotstar → My account → Cancel' },
  jiocinema: { url: 'https://www.jiocinema.com', how: 'JioCinema → Profile → Subscription → Cancel' },
  youtube:   { url: 'https://www.youtube.com/paid_memberships', how: 'YouTube → Memberships → Cancel' },
  apple:     { url: 'https://apps.apple.com/account/subscriptions', how: 'App Store → Profile → Subscriptions' },
  google:    { url: 'https://play.google.com/store/account/subscriptions', how: 'Play Store → Subscriptions' },
  dropbox:   { url: 'https://www.dropbox.com/account/billing', how: 'Dropbox → Account → Cancel plan' },
  notion:    { url: 'https://www.notion.so/my-account', how: 'Notion → Settings → Billing → Cancel' },
  swiggy:    { url: 'https://www.swiggy.com/one', how: 'Swiggy One → Manage → Cancel' },
  zomato:    { url: 'https://www.zomato.com/gold', how: 'Zomato Gold → Manage → Cancel' },
};

export function lookupCancellation(payee: string | null): { url: string; how: string } | null {
  if (!payee) return null;
  const key = payee.toLowerCase();
  for (const [needle, info] of Object.entries(CANCELLATION_URLS)) {
    if (key.includes(needle)) return info;
  }
  return null;
}
