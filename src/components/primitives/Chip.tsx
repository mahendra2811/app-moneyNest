import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { radius } from '@/brand/radius';
import { spacing } from '@/brand/spacing';
import { Text } from './Text';
import { Icon } from './Icon';

export type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  iconLeft?: string;
  tone?: 'default' | 'accent' | 'expense' | 'income' | 'warning';
};

export function Chip({ label, selected = false, onPress, iconLeft, tone = 'default' }: ChipProps) {
  const t = useTheme();
  const toneColor =
    tone === 'accent' ? t.accent :
    tone === 'expense' ? t.expense :
    tone === 'income' ? t.income :
    tone === 'warning' ? t.warning :
    t.text;
  const bg = selected ? (tone === 'default' ? t.accentSoft : t.surface) : t.surfaceMuted;
  const fg = selected ? toneColor : t.textMuted;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: bg,
        borderRadius: radius.full,
        paddingHorizontal: spacing['4'],
        paddingVertical: spacing['2'],
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing['2'],
        borderWidth: 1,
        borderColor: selected ? toneColor : t.border,
        opacity: pressed ? 0.7 : 1,
        minHeight: 36,
      })}
    >
      {iconLeft ? (
        <View accessible={false}>
          <Icon name={iconLeft} size={16} color={fg} />
        </View>
      ) : null}
      <Text variant="smallMed" style={{ color: fg }}>
        {label}
      </Text>
    </Pressable>
  );
}
