import React from 'react';
import { Pressable, type PressableProps } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { radius } from '@/brand/radius';
import { Icon } from './Icon';
import { iconSize, type IconSizeKey } from '@/brand/icons';
import { useHaptic } from '@/hooks/use-haptic';

export type IconButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  name: string;
  size?: IconSizeKey;
  tone?: 'default' | 'muted' | 'accent' | 'expense';
  surface?: 'solid' | 'soft' | 'ghost';
  accessibilityLabel: string;
};

export function IconButton({
  name,
  size = 'md',
  tone = 'default',
  surface = 'ghost',
  onPress,
  accessibilityLabel,
  ...rest
}: IconButtonProps) {
  const t = useTheme();
  const haptic = useHaptic();
  const dim = iconSize[size] + 16;
  const bg =
    surface === 'solid' ? t.surface :
    surface === 'soft' ? t.surfaceMuted :
    'transparent';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={(e) => {
        haptic('light');
        onPress?.(e);
      }}
      style={({ pressed }) => ({
        width: dim,
        height: dim,
        borderRadius: radius.full,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.6 : 1,
      })}
      hitSlop={8}
      {...rest}
    >
      <Icon name={name} size={size} tone={tone} />
    </Pressable>
  );
}
