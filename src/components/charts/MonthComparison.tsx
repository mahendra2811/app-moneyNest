import React from 'react';
import { View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { useTheme } from '@/theme/useTheme';
import { Text } from '@/components/primitives';
import type { MonthlyTotal } from '@/db/queries/reports';

export type MonthComparisonProps = {
  series: MonthlyTotal[];
};

export function MonthComparison({ series }: MonthComparisonProps) {
  const t = useTheme();
  const data = series.flatMap((m) => [
    {
      value: Math.round(m.spent / 100),
      label: m.ym.slice(5),
      frontColor: t.expense,
      spacing: 2,
    },
    {
      value: Math.round(m.income / 100),
      frontColor: t.income,
    },
  ]);
  if (data.length === 0) {
    return (
      <Text variant="small" tone="muted" style={{ textAlign: 'center' }}>
        Not enough data
      </Text>
    );
  }
  return (
    <View>
      <BarChart
        data={data}
        height={140}
        barWidth={14}
        spacing={20}
        initialSpacing={6}
        noOfSections={3}
        yAxisColor={t.border}
        xAxisColor={t.border}
        yAxisTextStyle={{ color: t.textFaint, fontSize: 10 }}
        xAxisLabelTextStyle={{ color: t.textFaint, fontSize: 10 }}
        hideRules
      />
    </View>
  );
}
