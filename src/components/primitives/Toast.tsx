import React, { useEffect } from 'react';
import { Pressable } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useUiStore } from '@/stores/ui';
import { useTheme } from '@/theme/useTheme';
import { spacing } from '@/brand/spacing';
import { GlassCard } from './GlassCard';
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
      accessibilityLiveRegion="polite"
      style={{
        position: 'absolute',
        bottom: 96,
        left: spacing['4'],
        right: spacing['4'],
      }}
      pointerEvents="box-none"
    >
      <GlassCard intensity="medium" radius="lg" padded={false} style={{ padding: spacing['4'], flexDirection: 'row', alignItems: 'center', gap: spacing['3'] }}>
        <Icon name={iconName} size="sm" color={accent} />
        <Text style={{ flex: 1 }} variant="small">
          {toast.text}
        </Text>
        {toast.actionLabel ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={toast.actionLabel}
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
      </GlassCard>
    </Animated.View>
  );
}
