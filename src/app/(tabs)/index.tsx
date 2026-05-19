import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientBackground, GlassCard, Text } from '@/components/primitives';
import { brand } from '@/brand/name';
import { spacing } from '@/brand/spacing';
import { useHaptic } from '@/hooks/use-haptic';
import { Pressable } from 'react-native';

export default function Home() {
  const haptic = useHaptic();
  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <Pressable
          onPress={() => haptic('light')}
          style={{ flex: 1, justifyContent: 'center', padding: spacing['4'] }}
          accessibilityLabel="moneyNest welcome card"
        >
          <GlassCard intensity="strong" radius="xl">
            <Text variant="display">{brand.name}</Text>
            <Text variant="body" tone="muted" style={{ marginTop: spacing['2'] }}>
              {brand.tagline}
            </Text>
            <View style={{ height: spacing['4'] }} />
            <Text variant="small" tone="faint">
              Phase 0 scaffold ready. Tap anywhere for haptic.
            </Text>
          </GlassCard>
        </Pressable>
      </SafeAreaView>
    </GradientBackground>
  );
}
