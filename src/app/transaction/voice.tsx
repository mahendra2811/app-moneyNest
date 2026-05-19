import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { GlassCard, Text, Button, Icon } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { t } from '@/copy';

/**
 * Phase 1: placeholder. Real Hinglish voice flow lands in Phase 3.
 */
export default function VoiceStub() {
  const router = useRouter();
  return (
    <AppShell>
      <ScreenHeader title="Voice" />
      <View style={{ flex: 1, padding: spacing['4'], justifyContent: 'center' }}>
        <GlassCard intensity="strong" radius="xl">
          <View style={{ alignItems: 'center', gap: spacing['3'] }}>
            <Icon name="mic" size="lg" tone="accent" />
            <Text variant="h2" style={{ textAlign: 'center' }}>
              Voice is coming in Phase 3
            </Text>
            <Text variant="body" tone="muted" style={{ textAlign: 'center' }}>
              {t('voice.holdToTalk')}
            </Text>
            <Button label="Add manually" onPress={() => router.replace('/transaction/new' as never)} />
          </View>
        </GlassCard>
      </View>
    </AppShell>
  );
}
