import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { spacing } from '@/brand/spacing';
import { radius } from '@/brand/radius';
import { Text } from './Text';
import { Icon } from './Icon';
import { useHaptic } from '@/hooks/use-haptic';

export type KeypadProps = {
  onPressKey: (key: string) => void;
  onBackspace: () => void;
};

const KEYS: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'];

export function Keypad({ onPressKey, onBackspace }: KeypadProps) {
  const t = useTheme();
  const haptic = useHaptic();
  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: spacing['3'],
      }}
    >
      {KEYS.map((k) => (
        <Pressable
          key={k}
          onPress={() => {
            haptic('light');
            onPressKey(k);
          }}
          style={({ pressed }) => ({
            width: '30%',
            height: 56,
            backgroundColor: t.surface,
            borderColor: t.border,
            borderWidth: 1,
            borderRadius: radius.md,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text variant="h2">{k}</Text>
        </Pressable>
      ))}
      <Pressable
        onPress={() => {
          haptic('light');
          onBackspace();
        }}
        accessibilityLabel="Delete"
        style={({ pressed }) => ({
          width: '30%',
          height: 56,
          backgroundColor: t.surfaceMuted,
          borderColor: t.border,
          borderWidth: 1,
          borderRadius: radius.md,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Icon name="delete" size="md" tone="muted" />
      </Pressable>
    </View>
  );
}
