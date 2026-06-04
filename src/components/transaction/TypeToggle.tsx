import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { radius } from '@/brand/radius';
import { spacing } from '@/brand/spacing';
import { Text } from '@/components/primitives';
import { t as copy } from '@/copy';

export type TxType = 'expense' | 'income' | 'transfer';

export type TypeToggleProps = {
  value: TxType;
  onChange: (next: TxType) => void;
};

const OPTIONS: { key: TxType; label: string }[] = [
  { key: 'expense', label: copy('transactions.expense') },
  { key: 'income', label: copy('transactions.income') },
  { key: 'transfer', label: copy('transactions.transfer') },
];

export function TypeToggle({ value, onChange }: TypeToggleProps) {
  const t = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: t.surfaceMuted,
        borderRadius: radius.lg,
        padding: 4,
        gap: 4,
      }}
    >
      {OPTIONS.map((opt) => {
        const active = opt.key === value;
        const accent =
          opt.key === 'expense' ? t.expense : opt.key === 'income' ? t.income : t.transfer;
        return (
          <Pressable
            key={opt.key}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(opt.key)}
            style={({ pressed }) => ({
              flex: 1,
              paddingVertical: spacing['2'],
              borderRadius: radius.md,
              backgroundColor: active ? t.surface : 'transparent',
              alignItems: 'center',
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text variant="smallMed" style={{ color: active ? accent : t.textMuted }}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
