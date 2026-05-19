import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Text, Input, Button, GlassCard } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { t } from '@/copy';
import { deriveKey, encryptAesGcm, randomBytes, cryptoConsts } from '@/lib/crypto';
import { setSetting } from '@/db/queries/settings';
import { useUiStore } from '@/stores/ui';

export default function PassphraseScreen() {
  const router = useRouter();
  const showToast = useUiStore((s) => s.showToast);
  const [pass, setPass] = useState('');
  const [confirm, setConfirm] = useState('');

  const onSave = async () => {
    if (pass.length < 8) {
      showToast({ tone: 'error', text: 'Use 8+ characters' });
      return;
    }
    if (pass !== confirm) {
      showToast({ tone: 'error', text: 'Passphrases do not match' });
      return;
    }
    const salt = await randomBytes(cryptoConsts.SALT_BYTES);
    const key = await deriveKey(pass, salt);
    const canary = new TextEncoder().encode('moneynest:canary:v1');
    const { ciphertext, iv, tag } = await encryptAesGcm(key, canary);
    const stored = {
      salt: Array.from(salt),
      iv: Array.from(iv),
      tag: Array.from(tag),
      ciphertext: Array.from(ciphertext),
    };
    await SecureStore.setItemAsync('passphrase.canary', JSON.stringify(stored));
    await setSetting('backup.canary', true);
    showToast({ tone: 'success', text: 'Passphrase saved' });
    router.back();
  };

  return (
    <AppShell>
      <ScreenHeader title="Backup passphrase" />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['4'] }}>
        <GlassCard intensity="medium">
          <Text variant="body" tone="muted">
            {t('backup.passphraseHint')}
          </Text>
        </GlassCard>
        <Input
          label={t('backup.passphraseLabel')}
          value={pass}
          onChangeText={setPass}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Input
          label={t('backup.confirmPassphraseLabel')}
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Button label={t('common.save')} fullWidth size="lg" onPress={onSave} />
        <View style={{ height: spacing['2'] }} />
      </ScrollView>
    </AppShell>
  );
}
