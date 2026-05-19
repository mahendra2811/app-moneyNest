import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell } from '@/components/layout/AppShell';
import { GlassCard, Text, Button, Icon } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { t } from '@/copy';
import { setSetting } from '@/db/queries/settings';
import { now } from '@/lib/date';
import { seedIfEmpty } from '@/db/seed';
import { useInvalidateStore } from '@/stores/invalidate';

export default function Privacy() {
  const router = useRouter();
  const bumpAll = useInvalidateStore((s) => s.bumpAll);

  const onFinish = async () => {
    await seedIfEmpty();
    await setSetting('onboarding.completedAt', now());
    bumpAll();
    router.replace('/(tabs)');
  };

  return (
    <AppShell>
      <View style={{ flex: 1, justifyContent: 'space-between', padding: spacing['4'] }}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <GlassCard intensity="strong" radius="xl">
            <Icon name="shield-check" size="lg" tone="accent" />
            <View style={{ height: spacing['3'] }} />
            <Text variant="h1">{t('onboarding.privacyTitle')}</Text>
            <View style={{ height: spacing['3'] }} />
            <Text variant="body" tone="muted">
              {t('onboarding.privacyBody')}
            </Text>
          </GlassCard>
        </View>
        <Button label={t('onboarding.privacyCta')} size="lg" fullWidth onPress={onFinish} />
      </View>
    </AppShell>
  );
}
