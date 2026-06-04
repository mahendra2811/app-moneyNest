/**
 * NEW-26 — monthly close ritual.
 */
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card, Text, Button, GlassCard } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { useMonthTotals, useMonthSpendByCategory } from '@/hooks/use-transactions';
import { formatINR, formatINRShort } from '@/lib/money';
import { addMonths, monthLabel } from '@/lib/date';
import { takeSnapshot } from '@/db/queries/snapshots';
export default function MonthlyClose() {
  const router = useRouter();
  const lastRef = addMonths(new Date().toISOString(), -1);
  const totals = useMonthTotals(lastRef);
  const cats = useMonthSpendByCategory(lastRef);
  const [step, setStep] = useState<'review' | 'snapshot' | 'done'>('review');

  useEffect(() => {
    if (step === 'snapshot') {
      takeSnapshot().then(() => setStep('done'));
    }
  }, [step]);

  return (
    <AppShell>
      <ScreenHeader title={`Close ${monthLabel(lastRef)}`} />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['4'] }}>
        <GlassCard intensity="strong" radius="xl">
          <Text variant="caption" tone="muted">LAST MONTH</Text>
          <Text variant="display" tabular>{formatINRShort(totals.data?.spentPaise ?? 0)}</Text>
          <View style={{ height: spacing['2'] }} />
          <Text variant="caption" tone="muted">
            Income {formatINRShort(totals.data?.incomePaise ?? 0)} · Net {formatINRShort((totals.data?.incomePaise ?? 0) - (totals.data?.spentPaise ?? 0))}
          </Text>
        </GlassCard>

        <Card>
          <Text variant="h3">Top categories</Text>
          <View style={{ height: spacing['2'] }} />
          {(cats.data ?? []).slice(0, 5).map((c) => (
            <View key={c.categoryId ?? 'none'} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing['2'] }}>
              <Text variant="body">{c.categoryName ?? '—'}</Text>
              <Text variant="bodyMed" tabular>{formatINR(c.totalPaise)}</Text>
            </View>
          ))}
        </Card>

        {step === 'review' ? (
          <Button label="Snapshot net worth & close" iconLeft="check" onPress={() => setStep('snapshot')} fullWidth size="lg" />
        ) : step === 'snapshot' ? (
          <Card>
            <Text variant="body">Taking snapshot…</Text>
          </Card>
        ) : (
          <Card>
            <Text variant="h3">Done</Text>
            <Text variant="small" tone="muted">Snapshot saved. Open budgets to plan the new month.</Text>
            <View style={{ height: spacing['3'] }} />
            <Button label="Go to budgets" onPress={() => router.replace('/budgets' as never)} />
          </Card>
        )}
      </ScrollView>
    </AppShell>
  );
}
