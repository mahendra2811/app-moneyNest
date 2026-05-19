import React from 'react';
import { View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { useTheme } from '@/theme/useTheme';
import { spacing } from '@/brand/spacing';
import { Text } from '@/components/primitives';
import { formatINRShort } from '@/lib/money';
import type { CategorySpendRow } from '@/db/queries/transactions';

export type CategoryDonutProps = {
  data: CategorySpendRow[];
};

export function CategoryDonut({ data }: CategoryDonutProps) {
  const t = useTheme();
  const sorted = [...data].sort((a, b) => b.totalPaise - a.totalPaise);
  const top = sorted.slice(0, 5);
  const others = sorted.slice(5);
  const otherTotal = others.reduce((acc, r) => acc + r.totalPaise, 0);
  const slices = top
    .map((r) => ({
      value: r.totalPaise,
      color: r.categoryColor ?? t.accent,
      text: r.categoryName ?? '—',
    }))
    .concat(
      otherTotal > 0
        ? [{ value: otherTotal, color: t.textFaint, text: 'Other' }]
        : [],
    );
  const total = slices.reduce((acc, s) => acc + s.value, 0);
  if (slices.length === 0 || total === 0) {
    return (
      <Text variant="small" tone="muted" style={{ textAlign: 'center' }}>
        No expenses this month.
      </Text>
    );
  }
  return (
    <View style={{ alignItems: 'center', gap: spacing['3'] }}>
      <PieChart
        data={slices}
        donut
        innerRadius={56}
        radius={84}
        innerCircleColor={t.surface}
        centerLabelComponent={() => (
          <View style={{ alignItems: 'center' }}>
            <Text variant="caption" tone="muted">
              TOTAL
            </Text>
            <Text variant="bodyMed" tabular>
              {formatINRShort(total)}
            </Text>
          </View>
        )}
      />
      <View style={{ width: '100%', gap: spacing['2'] }}>
        {slices.map((s) => (
          <View key={s.text} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['3'] }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: s.color }} />
            <Text variant="small" style={{ flex: 1 }}>
              {s.text}
            </Text>
            <Text variant="small" tabular tone="muted">
              {formatINRShort(s.value)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
