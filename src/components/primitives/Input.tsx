import React from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { radius } from '@/brand/radius';
import { spacing } from '@/brand/spacing';
import { typography } from '@/brand/typography';
import { Text } from './Text';

export type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  hint?: string;
};

export function Input({ label, error, hint, style, ...rest }: InputProps) {
  const t = useTheme();
  return (
    <View style={{ gap: spacing['1'] }}>
      {label ? (
        <Text variant="small" tone="muted">
          {label}
        </Text>
      ) : null}
      <TextInput
        placeholderTextColor={t.textFaint}
        style={[
          {
            backgroundColor: t.surface,
            borderColor: error ? t.expense : t.border,
            borderWidth: 1,
            borderRadius: radius.md,
            paddingHorizontal: spacing['4'],
            paddingVertical: spacing['3'],
            fontSize: typography.scale.body.size,
            color: t.text,
            fontFamily: typography.family.sans,
            minHeight: 48,
          },
          style,
        ]}
        {...rest}
      />
      {error ? (
        <Text variant="caption" tone="expense">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" tone="faint">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}
