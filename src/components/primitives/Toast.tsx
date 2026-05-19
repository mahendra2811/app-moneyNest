import React, { useEffect } from 'react';
import { View, Pressable } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useUiStore } from '@/stores/ui';
import { useTheme } from '@/theme/useTheme';
import { spacing } from '@/brand/spacing';
import { radius } from '@/brand/radius';
import { Text } from './Text';
import { Icon } from './Icon';

const AUTO_DISMISS_MS = 3000;

export function ToastHost() {
  const t = useTheme();
  const toast = useUiStore((s) => s.toast);
  const dismiss = useUiStore((s) => s.dismissToast);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(dismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(id);
  }, [toast, dismiss]);

  if (!toast) return null;

  const iconName =
    toast.tone === 'success' ? 'check-circle' :
    toast.tone === 'error' ? 'alert-circle' :
    'info';

  const accent =
    toast.tone === 'success' ? t.income :
    toast.tone === 'error' ? t.expense :
    t.accent;

  return (
    <Animated.View
      entering={FadeInDown}
      exiting={FadeOutDown}
      style={{
        position: 'absolute',
        bottom: 96,
        left: spacing['4'],
        right: spacing['4'],
      }}
      pointerEvents="box-none"
    >
      <View
        style={{
          backgroundColor: t.surface,
          borderColor: t.border,
          borderWidth: 1,
          borderRadius: radius.lg,
          padding: spacing['4'],
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing['3'],
        }}
      >
        <Icon name={iconName} size="sm" color={accent} />
        <Text style={{ flex: 1 }} variant="small">
          {toast.text}
        </Text>
        {toast.actionLabel ? (
          <Pressable
            onPress={() => {
              toast.onAction?.();
              dismiss();
            }}
            hitSlop={8}
          >
            <Text variant="smallMed" tone="accent">
              {toast.actionLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </Animated.View>
  );
}
