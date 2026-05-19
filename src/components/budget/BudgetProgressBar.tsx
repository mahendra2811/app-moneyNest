import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/theme/useTheme';

export type BudgetProgressBarProps = {
  spent: number;
  total: number;
  height?: number;
};

export function BudgetProgressBar({ spent, total, height = 6 }: BudgetProgressBarProps) {
  const t = useTheme();
  const ratio = total > 0 ? spent / total : 0;
  const pct = Math.min(1, Math.max(0, ratio));
  const color = ratio > 1 ? t.expense : ratio >= 0.8 ? t.warning : t.accent;
  return (
    <View
      style={{
        height,
        borderRadius: height,
        backgroundColor: t.surfaceMuted,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          width: `${Math.round(pct * 100)}%`,
          height: '100%',
          backgroundColor: color,
        }}
      />
    </View>
  );
}
