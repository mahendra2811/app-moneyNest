import React from 'react';
import { Pressable, View, type PressableProps, ActivityIndicator } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { radius } from '@/brand/radius';
import { spacing } from '@/brand/spacing';
import { Text } from './Text';
import { Icon } from './Icon';
import { useHaptic } from '@/hooks/use-haptic';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconLeft?: string;
  iconRight?: string;
  loading?: boolean;
  fullWidth?: boolean;
};

const sizeStyles = {
  sm: { paddingV: spacing['2'], paddingH: spacing['4'], minH: 36, fontSize: 14, iconSize: 16 },
  md: { paddingV: spacing['3'], paddingH: spacing['5'], minH: 48, fontSize: 16, iconSize: 20 },
  lg: { paddingV: spacing['4'], paddingH: spacing['6'], minH: 56, fontSize: 18, iconSize: 24 },
} as const;

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  loading = false,
  disabled,
  fullWidth = false,
  onPress,
  ...rest
}: ButtonProps) {
  const t = useTheme();
  const haptic = useHaptic();
  const s = sizeStyles[size];

  const palettes = {
    primary: { bg: t.accent, fg: t.textOnAccent, border: t.accent },
    secondary: { bg: 'transparent', fg: t.accent, border: t.accent },
    ghost: { bg: 'transparent', fg: t.text, border: 'transparent' },
    danger: { bg: t.expense, fg: t.textOnAccent, border: t.expense },
  } as const;
  const p = palettes[variant];

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={(e) => {
        haptic('light');
        onPress?.(e);
      }}
      style={({ pressed }) => ({
        backgroundColor: p.bg,
        borderColor: p.border,
        borderWidth: variant === 'secondary' ? 1.5 : 0,
        borderRadius: radius.md,
        paddingVertical: s.paddingV,
        paddingHorizontal: s.paddingH,
        minHeight: s.minH,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing['2'],
        opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        alignSelf: fullWidth ? 'stretch' : 'flex-start',
      })}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={p.fg} />
      ) : (
        <>
          {iconLeft ? (
            <View accessible={false}>
              <Icon name={iconLeft} size={s.iconSize} color={p.fg} />
            </View>
          ) : null}
          <Text style={{ color: p.fg, fontSize: s.fontSize, fontWeight: '600' }}>{label}</Text>
          {iconRight ? (
            <View accessible={false}>
              <Icon name={iconRight} size={s.iconSize} color={p.fg} />
            </View>
          ) : null}
        </>
      )}
    </Pressable>
  );
}
