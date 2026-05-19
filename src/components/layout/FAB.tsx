import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { radius } from '@/brand/radius';
import { shadows } from '@/brand/shadows';
import { spacing } from '@/brand/spacing';
import { Icon } from '@/components/primitives';
import { useHaptic } from '@/hooks/use-haptic';

export type FabProps = {
  onPress: () => void;
  onLongPress?: () => void;
  icon?: string;
  accessibilityLabel: string;
};

export function FAB({ onPress, onLongPress, icon = 'plus', accessibilityLabel }: FabProps) {
  const t = useTheme();
  const haptic = useHaptic();
  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        right: spacing['5'],
        bottom: spacing['8'],
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={() => {
          haptic('medium');
          onPress();
        }}
        onLongPress={
          onLongPress
            ? () => {
                haptic('heavy');
                onLongPress();
              }
            : undefined
        }
        style={({ pressed }) => ({
          width: 60,
          height: 60,
          borderRadius: radius.full,
          backgroundColor: t.accent,
          alignItems: 'center',
          justifyContent: 'center',
          ...shadows.lg,
          transform: [{ scale: pressed ? 0.94 : 1 }],
        })}
      >
        <Icon name={icon} size="lg" color={t.textOnAccent} />
      </Pressable>
    </View>
  );
}
