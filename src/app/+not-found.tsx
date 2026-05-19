import React from 'react';
import { View } from 'react-native';
import { Link } from 'expo-router';
import { GradientBackground, GlassCard, Text } from '@/components/primitives';
import { spacing } from '@/brand/spacing';

export default function NotFound() {
  return (
    <GradientBackground style={{ alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ padding: spacing['6'] }}>
        <GlassCard>
          <Text variant="h1">Not found</Text>
          <Text variant="body" tone="muted" style={{ marginTop: spacing['2'] }}>
            That page doesn’t exist.
          </Text>
          <Link
            href="/"
            style={{ marginTop: spacing['4'] }}
            accessibilityLabel="Back to home"
          >
            <Text variant="bodyMed" tone="accent">Back to home</Text>
          </Link>
        </GlassCard>
      </View>
    </GradientBackground>
  );
}
