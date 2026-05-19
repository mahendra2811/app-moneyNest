import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { GlassCard, Text, Card, Skeleton } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { yearlyRecap, type YearlyRecap } from '@/lib/digest';
import { formatINR, formatINRShort } from '@/lib/money';

export default function RecapScreen() {
  const { year } = useLocalSearchParams<{ year: string }>();
  const [data, setData] = useState<YearlyRecap | null>(null);
  useEffect(() => {
    yearlyRecap(typeof year === 'string' ? year : undefined).then(setData);
  }, [year]);

  return (
    <AppShell>
      <ScreenHeader title={`Recap · ${typeof year === 'string' ? year : new Date().getUTCFullYear()}`} />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['4'] }}>
        {!data ? (
          <Skeleton height={120} />
        ) : (
          <>
            <GlassCard intensity="strong" radius="xl">
              <Text variant="caption" tone="muted">TOTAL SPENT</Text>
              <Text variant="display" tabular>{formatINRShort(data.totalSpent)}</Text>
              <View style={{ height: spacing['2'] }} />
              <Text variant="caption" tone="muted">TOTAL INCOME</Text>
              <Text variant="h2" tabular tone="income">{formatINRShort(data.totalIncome)}</Text>
              <View style={{ height: spacing['2'] }} />
              <Text variant="small" tone="muted">
                {data.transactionCount} transactions
              </Text>
            </GlassCard>

            {data.busiestMonth ? (
              <Card>
                <Text variant="h3">Busiest month</Text>
                <View style={{ height: spacing['2'] }} />
                <Text variant="body">{data.busiestMonth.ym} — {formatINR(data.busiestMonth.spent)}</Text>
              </Card>
            ) : null}

            <Card>
              <Text variant="h3">Top categories</Text>
              <View style={{ height: spacing['2'] }} />
              {data.topCategories.map((c) => (
                <View key={c.name} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing['2'] }}>
                  <Text variant="body">{c.name}</Text>
                  <Text variant="bodyMed" tabular>{formatINRShort(c.total)}</Text>
                </View>
              ))}
            </Card>

            <Card>
              <Text variant="h3">Top payees</Text>
              <View style={{ height: spacing['2'] }} />
              {data.topPayees.map((p) => (
                <View key={p.payee} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing['2'] }}>
                  <Text variant="body">{p.payee}</Text>
                  <Text variant="bodyMed" tabular>{formatINRShort(p.total)}</Text>
                </View>
              ))}
            </Card>
          </>
        )}
      </ScrollView>
    </AppShell>
  );
}
