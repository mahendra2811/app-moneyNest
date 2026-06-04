import React from 'react';
import { ScrollView, View } from 'react-native';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card, Text, Button } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { useMonthTotals, useMonthSpendByCategory } from '@/hooks/use-transactions';
import { renderShareableReport } from '@/lib/share-image';
import { filesystemService } from '@/platform/filesystem';
import { useUiStore } from '@/stores/ui';
import { monthLabel } from '@/lib/date';
import { formatINRShort } from '@/lib/money';

function toBase64(s: string): string {
  try {
    if (typeof btoa === 'function') return btoa(unescape(encodeURIComponent(s)));
  } catch { /* fallthrough */ }
  return Buffer.from(s, 'utf-8').toString('base64');
}

export default function ShareReport() {
  const showToast = useUiStore((s) => s.showToast);
  const monthQ = useMonthTotals();
  const catQ = useMonthSpendByCategory();
  const month = monthLabel(new Date().toISOString());

  const onShare = async () => {
    const top = (catQ.data ?? [])[0];
    const html = renderShareableReport({
      title: month,
      subtitle: 'on moneyNest',
      totalSpent: monthQ.data?.spentPaise ?? 0,
      totalIncome: monthQ.data?.incomePaise ?? 0,
      topCategory: top?.categoryName ? { name: top.categoryName, total: top.totalPaise } : null,
    });
    await filesystemService.saveFile({
      suggestedName: `moneynest-${month.replace(/\s+/g, '-')}.html`,
      base64: toBase64(html),
      mimeType: 'text/html',
    });
    showToast({ tone: 'success', text: 'Report saved · share to convert to PNG/PDF' });
  };

  return (
    <AppShell>
      <ScreenHeader title="Share report" />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['4'] }}>
        <Card>
          <Text variant="h3">{month}</Text>
          <View style={{ height: spacing['2'] }} />
          <Text variant="bodyMed" tone="muted">
            Spent {formatINRShort(monthQ.data?.spentPaise ?? 0)}, income{' '}
            {formatINRShort(monthQ.data?.incomePaise ?? 0)}.
          </Text>
        </Card>
        <Button label="Save shareable card" iconLeft="share-2" onPress={onShare} fullWidth size="lg" />
      </ScrollView>
    </AppShell>
  );
}
