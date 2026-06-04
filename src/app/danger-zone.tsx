import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Text, Input, Button, GlassCard, Icon } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { t } from '@/copy';
import { wipeAllData } from '@/lib/wipe';
import { useInvalidateStore } from '@/stores/invalidate';
import { useUiStore } from '@/stores/ui';
import { deleteSetting } from '@/db/queries/settings';

export default function DangerZone() {
  const router = useRouter();
  const showToast = useUiStore((s) => s.showToast);
  const bumpAll = useInvalidateStore((s) => s.bumpAll);
  const [confirm, setConfirm] = useState('');
  const [working, setWorking] = useState(false);

  const onDelete = async () => {
    if (confirm.trim().toUpperCase() !== 'DELETE') {
      showToast({ tone: 'error', text: 'Type DELETE to confirm' });
      return;
    }
    setWorking(true);
    try {
      await wipeAllData();
      await deleteSetting('onboarding.completedAt');
      bumpAll();
      showToast({ tone: 'success', text: 'All data deleted' });
      router.replace('/(onboarding)/welcome' as never);
    } catch (e) {
      showToast({ tone: 'error', text: (e as Error).message });
    } finally {
      setWorking(false);
    }
  };

  return (
    <AppShell>
      <ScreenHeader title={t('settings.deleteAllData')} />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['4'] }}>
        <GlassCard intensity="medium">
          <View style={{ flexDirection: 'row', gap: spacing['3'], alignItems: 'flex-start' }}>
            <Icon name="triangle-alert" tone="expense" />
            <View style={{ flex: 1 }}>
              <Text variant="bodyMed">{t('settings.deleteAllData')}</Text>
              <Text variant="small" tone="muted">
                {t('settings.deleteAllDataBody')}
              </Text>
            </View>
          </View>
        </GlassCard>
        <Input
          label='Type "DELETE" to confirm'
          value={confirm}
          onChangeText={setConfirm}
          autoCapitalize="characters"
          autoCorrect={false}
        />
        <Button label={working ? '…' : t('settings.deleteAllData')} variant="danger" fullWidth size="lg" onPress={onDelete} />
      </ScrollView>
    </AppShell>
  );
}
