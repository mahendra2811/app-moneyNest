import React from 'react';
import { View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useTheme } from '@/theme/useTheme';
import { Text } from '@/components/primitives';
import type { DailyPoint } from '@/db/queries/reports';

/**
 * Cashflow line — B12. Two lines per day: in vs out.
 */
export function CashflowLine({ series }: { series: DailyPoint[] }) {
  const t = useTheme();
  if (series.length === 0) {
    return (
      <Text variant="small" tone="muted" style={{ textAlign: 'center' }}>
        No flow data
      </Text>
    );
  }
  const inSeries = series.map((p) => ({
    value: Math.round(p.income / 100),
    label: p.day.slice(8, 10),
  }));
  const outSeries = series.map((p) => ({
    value: Math.round(p.spent / 100),
  }));
  return (
    <View>
      <LineChart
        data={inSeries}
        data2={outSeries}
        color1={t.income}
        color2={t.expense}
        height={140}
        yAxisColor={t.border}
        xAxisColor={t.border}
        yAxisTextStyle={{ color: t.textFaint, fontSize: 10 }}
        xAxisLabelTextStyle={{ color: t.textFaint, fontSize: 10 }}
        hideRules
        thickness={2}
        curved
      />
    </View>
  );
}
