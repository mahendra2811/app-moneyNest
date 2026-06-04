import React, { useMemo, useState } from 'react';
import { ScrollView, View, Pressable } from 'react-native';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { GlassCard, Text, Card, Button, Skeleton, EmptyState } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { CategoryDonut } from '@/components/charts/CategoryDonut';
import { DailyBars } from '@/components/charts/DailyBars';
import { MonthComparison } from '@/components/charts/MonthComparison';
import { useMonthTotals, useMonthSpendByCategory } from '@/hooks/use-transactions';
import { useDailySeries, useTopPayees, useMonthlyTotalsLastN } from '@/hooks/use-reports';
import { addMonths, monthLabel } from '@/lib/date';
import { formatINR, formatINRShort } from '@/lib/money';
import { t } from '@/copy';
import { useTheme } from '@/theme';
import { listTransactions } from '@/db/queries/transactions';
import { transactionsToCsv } from '@/lib/csv-export';
import { filesystemService } from '@/platform/filesystem';
import { useUiStore } from '@/stores/ui';

function utf8ToBase64(input: string): string {
  // RN-compatible base64 of a UTF-8 string. Uses btoa (available in Hermes
  // 0.13+); falls back to manual encoding otherwise.
  try {
    const bytes = new TextEncoder().encode(input);
    let bin = '';
    for (const b of bytes) bin += String.fromCharCode(b);
    return typeof btoa === 'function' ? btoa(bin) : Buffer.from(input, 'utf-8').toString('base64');
  } catch {
    return Buffer.from(input, 'utf-8').toString('base64');
  }
}

export default function ReportsScreen() {
  const t_ = useTheme();
  const showToast = useUiStore((s) => s.showToast);
  const [monthRef, setMonthRef] = useState<string>(() => new Date().toISOString());

  const monthQ = useMonthTotals(monthRef);
  const catQ = useMonthSpendByCategory(monthRef);
  const dailyQ = useDailySeries(monthRef);
  const payeesQ = useTopPayees(monthRef);
  const momQ = useMonthlyTotalsLastN(6);

  const hasData = useMemo(
    () => (monthQ.data?.spentPaise ?? 0) + (monthQ.data?.incomePaise ?? 0) > 0,
    [monthQ.data],
  );

  const exportCsv = async () => {
    const { items } = await listTransactions({ limit: 5000 });
    const csv = transactionsToCsv(items);
    const base64 = utf8ToBase64(csv);
    const ts = new Date().toISOString().slice(0, 10);
    const res = await filesystemService.saveFile({
      suggestedName: `moneynest-${ts}.csv`,
      base64,
      mimeType: 'text/csv',
    });
    if (res) showToast({ tone: 'success', text: 'CSV exported' });
    else showToast({ tone: 'error', text: 'Export failed' });
  };

  return (
    <AppShell>
      <ScreenHeader title={t('reports.title')} showBack={false} />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['4'], paddingBottom: 96 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Pressable
            onPress={() => setMonthRef(addMonths(monthRef, -1))}
            accessibilityLabel="Previous month"
          >
            <Text variant="bodyMed" tone="accent">‹ Prev</Text>
          </Pressable>
          <Text variant="h3">{monthLabel(monthRef)}</Text>
          <Pressable
            onPress={() => setMonthRef(addMonths(monthRef, 1))}
            accessibilityLabel="Next month"
          >
            <Text variant="bodyMed" tone="accent">Next ›</Text>
          </Pressable>
        </View>

        <GlassCard intensity="strong" radius="xl">
          {monthQ.loading ? (
            <Skeleton height={80} />
          ) : (
            <View style={{ flexDirection: 'row', gap: spacing['4'] }}>
              <Section label={t('reports.totalSpent')} value={monthQ.data?.spentPaise ?? 0} tone="expense" />
              <Section label={t('reports.totalIncome')} value={monthQ.data?.incomePaise ?? 0} tone="income" />
              <Section
                label={t('reports.net')}
                value={(monthQ.data?.incomePaise ?? 0) - (monthQ.data?.spentPaise ?? 0)}
                tone="default"
              />
            </View>
          )}
        </GlassCard>

        {!hasData ? (
          <EmptyState icon="pie-chart" title={t('emptyStates.reportsTitle')} body={t('emptyStates.reportsBody')} />
        ) : (
          <>
            <Card>
              <Text variant="h3">{t('reports.byCategory')}</Text>
              <View style={{ height: spacing['3'] }} />
              {catQ.loading ? <Skeleton height={180} /> : <CategoryDonut data={catQ.data ?? []} />}
            </Card>

            <Card>
              <Text variant="h3">{t('reports.dailySpend')}</Text>
              <View style={{ height: spacing['3'] }} />
              {dailyQ.loading ? <Skeleton height={140} /> : <DailyBars series={dailyQ.data ?? []} />}
            </Card>

            <Card>
              <Text variant="h3">{t('reports.monthOverMonth')}</Text>
              <View style={{ height: spacing['3'] }} />
              {momQ.loading ? <Skeleton height={140} /> : <MonthComparison series={momQ.data ?? []} />}
            </Card>

            <Card>
              <Text variant="h3">{t('reports.topPayees')}</Text>
              <View style={{ height: spacing['3'] }} />
              {(payeesQ.data ?? []).length === 0 ? (
                <Text variant="small" tone="muted">
                  No payees logged.
                </Text>
              ) : (
                (payeesQ.data ?? []).map((p) => (
                  <View
                    key={p.payee}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      paddingVertical: spacing['2'],
                      borderBottomColor: t_.border,
                      borderBottomWidth: 1,
                    }}
                  >
                    <Text variant="body">{p.payee}</Text>
                    <Text variant="bodyMed" tabular>
                      {formatINRShort(p.totalPaise)}
                    </Text>
                  </View>
                ))
              )}
            </Card>

            <Button label={t('reports.export')} iconLeft="download" variant="secondary" fullWidth onPress={exportCsv} />
          </>
        )}
      </ScrollView>
    </AppShell>
  );
}

function Section({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'expense' | 'income' | 'default';
}) {
  return (
    <View style={{ flex: 1 }}>
      <Text variant="caption" tone="muted">
        {label}
      </Text>
      <Text variant="bodyMed" tabular tone={tone === 'default' ? 'default' : tone}>
        {formatINR(value)}
      </Text>
    </View>
  );
}
