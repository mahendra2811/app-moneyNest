/**
 * ITR helper export — C17.
 * Tax tags + FY toggle — C15, C16.
 */
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card, Text, Button } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { db } from '@/db/client';
import { sql } from 'drizzle-orm';
import { formatINR } from '@/lib/money';
import { TAX_SECTION_LIMITS_PAISE, type TaxSection } from '@/lib/finance-math';
import { filesystemService } from '@/platform/filesystem';
import { useUiStore } from '@/stores/ui';

const SECTIONS: TaxSection[] = ['80C', '80D', 'HRA', '24B', 'NPS', 'OTHER'];

function fyBoundaries(year: number): { start: string; end: string } {
  // Indian FY runs Apr 1 → Mar 31 next year.
  return {
    start: `${year}-04-01T00:00:00.000Z`,
    end: `${year + 1}-03-31T23:59:59.999Z`,
  };
}

function utf8ToBase64(s: string): string {
  try {
    if (typeof btoa === 'function') return btoa(unescape(encodeURIComponent(s)));
  } catch { /* fallthrough */ }
  return Buffer.from(s, 'utf-8').toString('base64');
}

export default function ITRHelperScreen() {
  const showToast = useUiStore((s) => s.showToast);
  const fyStart = new Date();
  const month = fyStart.getMonth();
  const fyYear = month < 3 ? fyStart.getFullYear() - 1 : fyStart.getFullYear();
  const { start, end } = fyBoundaries(fyYear);
  const [byTag, setByTag] = useState<Record<string, number>>({});

  useEffect(() => {
    (async () => {
      const rows = await db.all<{ note: string | null; amountPaise: number }>(sql`
        SELECT note, amount_paise AS amountPaise
        FROM transactions
        WHERE deleted_at IS NULL
          AND occurred_at BETWEEN ${start} AND ${end}
      `);
      const out: Record<string, number> = {};
      for (const r of rows) {
        const note = r.note ?? '';
        const tag = SECTIONS.find((s) => note.toUpperCase().includes(`#${s}`));
        if (tag) out[tag] = (out[tag] ?? 0) + r.amountPaise;
      }
      setByTag(out);
    })();
  }, [start, end]);

  const onExport = async () => {
    const lines: string[] = ['section,deduction_inr,limit_inr,under_limit_inr,over_limit_inr'];
    for (const s of SECTIONS) {
      const used = byTag[s] ?? 0;
      const lim = TAX_SECTION_LIMITS_PAISE[s];
      const under = Math.min(used, lim);
      const over = Math.max(0, used - lim);
      lines.push(`${s},${(used / 100).toFixed(2)},${lim === Number.MAX_SAFE_INTEGER ? 'unlimited' : (lim / 100).toFixed(2)},${(under / 100).toFixed(2)},${(over / 100).toFixed(2)}`);
    }
    const csv = lines.join('\n');
    const base64 = utf8ToBase64(csv);
    await filesystemService.saveFile({
      suggestedName: `moneynest-itr-${fyYear}-${fyYear + 1}.csv`,
      base64,
      mimeType: 'text/csv',
    });
    showToast({ tone: 'success', text: 'Exported ITR summary' });
  };

  return (
    <AppShell>
      <ScreenHeader title={`ITR helper · FY${fyYear}-${(fyYear + 1).toString().slice(2)}`} />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['4'] }}>
        <Card>
          <Text variant="small" tone="muted">
            Add a hashtag like #80C or #HRA in any transaction note. We total them by section
            for your ITR. Limits per current FY:
          </Text>
        </Card>
        {SECTIONS.map((s) => {
          const used = byTag[s] ?? 0;
          const lim = TAX_SECTION_LIMITS_PAISE[s];
          return (
            <Card key={s}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text variant="bodyMed">{s}</Text>
                <Text variant="bodyMed" tabular>{formatINR(used)}</Text>
              </View>
              <Text variant="caption" tone="muted">
                Limit: {lim === Number.MAX_SAFE_INTEGER ? 'unlimited' : formatINR(lim)}
              </Text>
            </Card>
          );
        })}
        <Button label="Export CSV" iconLeft="download" onPress={onExport} fullWidth size="lg" />
      </ScrollView>
    </AppShell>
  );
}
