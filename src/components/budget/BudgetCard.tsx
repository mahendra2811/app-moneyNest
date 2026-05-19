import React from 'react';
import { View, Pressable } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { spacing } from '@/brand/spacing';
import { radius } from '@/brand/radius';
import { Text, Icon } from '@/components/primitives';
import { formatINR } from '@/lib/money';
import { BudgetProgressBar } from './BudgetProgressBar';
import type { BudgetWithCategory } from '@/db/queries/budgets';

export type BudgetCardProps = {
  budget: BudgetWithCategory;
  onPress?: () => void;
};

export function BudgetCard({ budget, onPress }: BudgetCardProps) {
  const t = useTheme();
  const remaining = budget.amountPaise - budget.spentPaise;
  const ratio = budget.amountPaise > 0 ? budget.spentPaise / budget.amountPaise : 0;
  const accent = ratio > 1 ? t.expense : ratio >= 0.8 ? t.warning : t.accent;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${budget.category?.name ?? 'Budget'}, ${formatINR(budget.spentPaise)} of ${formatINR(budget.amountPaise)}`}
      style={({ pressed }) => ({
        backgroundColor: t.surface,
        borderColor: t.border,
        borderWidth: 1,
        borderRadius: radius.lg,
        padding: spacing['4'],
        gap: spacing['3'],
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['3'] }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: t.surfaceMuted,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name={budget.category?.icon ?? 'tag'} size="sm" color={budget.category?.color ?? accent} />
        </View>
        <Text variant="bodyMed" style={{ flex: 1 }}>
          {budget.category?.name ?? 'Untitled'}
        </Text>
        <Text variant="bodyMed" tabular style={{ color: accent }}>
          {Math.round(ratio * 100)}%
        </Text>
      </View>
      <BudgetProgressBar spent={budget.spentPaise} total={budget.amountPaise} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text variant="caption" tone="muted">
          {formatINR(budget.spentPaise)} of {formatINR(budget.amountPaise)}
        </Text>
        <Text variant="caption" tone={remaining < 0 ? 'expense' : 'muted'}>
          {remaining < 0 ? `${formatINR(-remaining)} over` : `${formatINR(remaining)} left`}
        </Text>
      </View>
    </Pressable>
  );
}
