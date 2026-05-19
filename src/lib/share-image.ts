/**
 * Shareable report image — D4.
 *
 * Renders a static HTML "card" that the OS share sheet can convert to a
 * PNG/PDF and post to Instagram, WhatsApp, etc.
 */
import { formatINR, formatINRShort } from './money';

export type ShareableReport = {
  title: string;
  subtitle?: string;
  totalSpent: number;
  totalIncome: number;
  topCategory?: { name: string; total: number } | null;
};

export function renderShareableReport(r: ShareableReport): string {
  return `<!doctype html><html><head><meta charset="utf-8"/>
<style>
  body { margin: 0; padding: 0; background: linear-gradient(135deg, #DBEAFE, #EDE9FE, #FCE7F3); font: 14px/1.4 system-ui, sans-serif; }
  .card { width: 1080px; height: 1080px; box-sizing: border-box; padding: 80px; display: flex; flex-direction: column; justify-content: space-between; }
  .brand { font-size: 24px; color: #475569; }
  .title { font-size: 56px; font-weight: 800; color: #0F172A; }
  .subtitle { font-size: 22px; color: #475569; margin-top: 8px; }
  .big { font-size: 120px; font-weight: 900; color: #0F172A; }
  .meta { font-size: 28px; color: #475569; }
  .pill { display: inline-block; padding: 12px 24px; border-radius: 999px; background: rgba(255,255,255,0.6); }
</style></head><body>
<div class="card">
  <div>
    <div class="brand">moneyNest</div>
    <div class="title">${escapeHtml(r.title)}</div>
    ${r.subtitle ? `<div class="subtitle">${escapeHtml(r.subtitle)}</div>` : ''}
  </div>
  <div>
    <div class="meta">Spent</div>
    <div class="big">${formatINRShort(r.totalSpent)}</div>
    <div class="meta">Income · ${formatINRShort(r.totalIncome)}</div>
    ${r.topCategory ? `<div class="pill">Top: ${escapeHtml(r.topCategory.name)} ${formatINR(r.topCategory.total)}</div>` : ''}
  </div>
</div>
</body></html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
