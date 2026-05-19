/**
 * NEW-7 forecast next 30 days, NEW-50 forecast on lock-screen widget data.
 */
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card, Text, GlassCard } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { forecastNext30Days, detectCategoryDrift, type DriftReport } from '@/lib/insights';
import { formatINR } from '@/lib/money';

export default function Forecast() {
  const [n30, setN30] = useState(0);
  const [drift, setDrift] = useState<DriftReport[]>([]);
  useEffect(() => {
    forecastNext30Days().then(setN30);
    detectCategoryDrift().then(setDrift);
  }, []);
  return (
    <AppShell>
      <ScreenHeader title="Forecast" />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['3'] }}>
        <GlassCard intensity="strong" radius="xl">
          <Text variant="caption" tone="muted">PROJECTED NEXT 30 DAYS</Text>
          <Text variant="display" tabular>{formatINR(n30)}</Text>
          <Text variant="caption" tone="muted">Based on the last 90 days of expenses.</Text>
        </GlassCard>
        <Card>
          <Text variant="h3">Categories drifting MoM</Text>
          <View style={{ height: spacing['2'] }} />
          {drift.length === 0 ? (
            <Text variant="small" tone="muted">No category drift over 40% threshold.</Text>
          ) : (
            drift.map((d) => (
              <View key={d.categoryId} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing['2'] }}>
                <Text variant="body">{d.categoryName}</Text>
                <Text variant="bodyMed" tabular tone={d.changePct > 0 ? 'expense' : 'income'}>
                  {(d.changePct * 100).toFixed(0)}%
                </Text>
              </View>
            ))
          )}
        </Card>
      </ScrollView>
    </AppShell>
  );
}
