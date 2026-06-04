import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell } from '@/components/layout/AppShell';
import { GlassCard, Text, Button, Icon } from '@/components/primitives';
import { biometricService } from '@/platform/biometric';
import { brand } from '@/brand/name';
import { spacing } from '@/brand/spacing';
import { useUiStore } from '@/stores/ui';

export default function LockScreen() {
  const router = useRouter();
  const showToast = useUiStore((s) => s.showToast);
  const [busy, setBusy] = useState(false);

  const tryAuth = async () => {
    setBusy(true);
    try {
      const ok = await biometricService.authenticate(`Unlock ${brand.name}`);
      if (ok) router.replace('/(tabs)' as never);
      else showToast({ tone: 'error', text: 'Authentication failed' });
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    tryAuth();
  }, []);

  return (
    <AppShell>
      <View style={{ flex: 1, padding: spacing['4'], justifyContent: 'center' }}>
        <GlassCard intensity="strong" radius="xl">
          <View style={{ alignItems: 'center', gap: spacing['3'] }}>
            <Icon name="lock" size="xl" tone="accent" />
            <Text variant="h2">{brand.name}</Text>
            <Text variant="body" tone="muted" style={{ textAlign: 'center' }}>
              Locked. Authenticate to continue.
            </Text>
            <Button label={busy ? '…' : 'Unlock'} onPress={tryAuth} />
          </View>
        </GlassCard>
      </View>
    </AppShell>
  );
}
