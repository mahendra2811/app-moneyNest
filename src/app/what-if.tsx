/**
 * NEW-24 — what-if calculator.
 */
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card, Text, Input, Chip } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { whatIf } from '@/lib/what-if';
import { useMonthSpendByCategory } from '@/hooks/use-transactions';
import { formatINR, formatINRShort } from '@/lib/money';
import { useTheme } from '@/theme';

export default function WhatIf() {
  const t = useTheme();
  const { data: cats } = useMonthSpendByCategory();
  const [cutPct, setCutPct] = useState('10');
  const [months, setMonths] = useState('12');
  const [selectedCat, setSelectedCat] = useState<string | null>(null);

  useEffect(() => {
    if (cats && cats.length > 0 && !selectedCat) {
      setSelectedCat(cats[0]?.categoryId ?? null);
    }
  }, [cats, selectedCat]);

  const monthly = cats?.find((c) => c.categoryId === selectedCat)?.totalPaise ?? 0;
  const result = whatIf({
    monthlyAvgPaise: monthly,
    cutPercent: Math.max(0, Math.min(100, Number(cutPct) || 0)),
    monthsAhead: Math.max(1, Number(months) || 12),
  });

  return (
    <AppShell>
      <ScreenHeader title="What-if" />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['4'] }}>
        <Card>
          <Text variant="small" tone="muted">If I cut this category by X%, how much do I save?</Text>
          <View style={{ height: spacing['3'] }} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['2'] }}>
            {(cats ?? []).map((c) => (
              <Chip
                key={c.categoryId ?? 'none'}
                label={c.categoryName ?? '—'}
                selected={c.categoryId === selectedCat}
                onPress={() => setSelectedCat(c.categoryId)}
              />
            ))}
          </View>
          <View style={{ height: spacing['3'] }} />
          <Input label="Cut by (%)" value={cutPct} onChangeText={setCutPct} keyboardType="number-pad" />
          <View style={{ height: spacing['2'] }} />
          <Input label="Over (months)" value={months} onChangeText={setMonths} keyboardType="number-pad" />
        </Card>
        <Card>
          <Text variant="caption" tone="muted">CURRENT MONTHLY</Text>
          <Text variant="h2" tabular>{formatINR(monthly)}</Text>
          <View style={{ height: spacing['3'] }} />
          <Text variant="caption" tone="muted">NEW MONTHLY</Text>
          <Text variant="h2" tabular style={{ color: t.accent }}>{formatINR(result.newMonthlyPaise)}</Text>
          <View style={{ height: spacing['3'] }} />
          <Text variant="caption" tone="muted">SAVINGS OVER PERIOD</Text>
          <Text variant="display" tabular style={{ color: t.income }}>{formatINRShort(result.savingsPaise)}</Text>
        </Card>
      </ScrollView>
    </AppShell>
  );
}
