import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell } from '@/components/layout/AppShell';
import { GlassCard, Text, Button } from '@/components/primitives';
import { brand } from '@/brand/name';
import { spacing } from '@/brand/spacing';
import { t } from '@/copy';

export default function Welcome() {
  const router = useRouter();
  return (
    <AppShell>
      <View style={{ flex: 1, justifyContent: 'space-between', padding: spacing['4'] }}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <GlassCard intensity="strong" radius="xl">
            <Text variant="caption" tone="muted">
              {brand.name}
            </Text>
            <View style={{ height: spacing['2'] }} />
            <Text variant="display">{t('onboarding.welcomeTitle')}</Text>
            <Text variant="display" tone="muted">
              {t('onboarding.welcomeSubtitle')}
            </Text>
            <View style={{ height: spacing['4'] }} />
            <Text variant="body" tone="muted">
              {t('onboarding.welcomeBody')}
            </Text>
          </GlassCard>
        </View>
        <View style={{ gap: spacing['2'] }}>
          <Button
            label={t('onboarding.welcomeCta')}
            size="lg"
            fullWidth
            onPress={() => router.push('/(onboarding)/first-account')}
          />
          <Button
            label="Restore from backup"
            variant="ghost"
            fullWidth
            onPress={() => router.push('/backup' as never)}
          />
        </View>
      </View>
    </AppShell>
  );
}
