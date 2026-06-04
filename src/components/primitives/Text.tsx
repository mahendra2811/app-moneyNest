import React from 'react';
import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';
import { typography, type TypographyVariant } from '@/brand/typography';
import { useTheme } from '@/theme/useTheme';

type Weight = '400' | '500' | '600' | '700';

export type TextProps = RNTextProps & {
  variant?: TypographyVariant;
  tone?: 'default' | 'muted' | 'faint' | 'accent' | 'expense' | 'income' | 'warning';
  weight?: keyof typeof typography.weight;
  tabular?: boolean;
};

const toneToToken = {
  default: 'text',
  muted: 'textMuted',
  faint: 'textFaint',
  accent: 'accent',
  expense: 'expense',
  income: 'income',
  warning: 'warning',
} as const;

export function Text({
  variant = 'body',
  tone = 'default',
  weight,
  tabular = false,
  style,
  children,
  ...rest
}: TextProps) {
  const t = useTheme();
  const scale = typography.scale[variant];
  const color = t[toneToToken[tone]];
  const fontWeight: Weight = (weight ? typography.weight[weight] : scale.weight) as Weight;
  const base: TextStyle = {
    fontFamily: typography.family.sans,
    fontSize: scale.size,
    lineHeight: scale.lineHeight,
    fontWeight,
    color,
  };
  if (tabular) base.fontVariant = ['tabular-nums'];
  return (
    <RNText {...rest} style={[base, style]}>
      {children}
    </RNText>
  );
}
