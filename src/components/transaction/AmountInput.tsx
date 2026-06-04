import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { spacing } from '@/brand/spacing';
import { radius } from '@/brand/radius';
import { Text } from '@/components/primitives';
import { formatINR } from '@/lib/money';

export type AmountInputProps = {
  paise: number;
  onPress?: () => void;
  tone?: 'expense' | 'income' | 'transfer';
};

export function AmountInput({ paise, onPress, tone = 'expense' }: AmountInputProps) {
  const t = useTheme();
  const accent = tone === 'expense' ? t.expense : tone === 'income' ? t.income : t.transfer;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Tap to edit amount"
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: t.surfaceMuted,
        borderRadius: radius.lg,
        padding: spacing['6'],
        alignItems: 'center',
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text variant="caption" tone="muted">
        AMOUNT
      </Text>
      <View style={{ height: spacing['1'] }} />
      <Text variant="display" style={{ color: accent }} tabular>
        {formatINR(paise)}
      </Text>
    </Pressable>
  );
}
