import React from 'react';
import { View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { useTheme } from '@/theme/useTheme';
import { Text } from '@/components/primitives';
import type { DailyPoint } from '@/db/queries/reports';

export type DailyBarsProps = {
  series: DailyPoint[];
};

export function DailyBars({ series }: DailyBarsProps) {
  const t = useTheme();
  const data = series.map((p) => ({
    value: Math.round(p.spent / 100),
    label: p.day.slice(8, 10),
    frontColor: t.accent,
  }));
  if (data.length === 0) {
    return (
      <Text variant="small" tone="muted" style={{ textAlign: 'center' }}>
        No data
      </Text>
    );
  }
  return (
    <View>
      <BarChart
        data={data}
        height={140}
        barWidth={10}
        spacing={6}
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
