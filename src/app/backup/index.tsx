import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card, Text, Button, Input, Icon } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { t } from '@/copy';
import { useUiStore } from '@/stores/ui';
import { filesystemService } from '@/platform/filesystem';
import { snapshotDatabase, exportToEncryptedBlob, readEncryptedBlob, restoreFromBackup } from '@/lib/backup-io';
import { useInvalidateStore } from '@/stores/invalidate';
import { setSetting } from '@/db/queries/settings';
import { now } from '@/lib/date';

function bytesToBase64(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  try {
    return typeof btoa === 'function' ? btoa(bin) : Buffer.from(bin, 'binary').toString('base64');
  } catch {
    return Buffer.from(bin, 'binary').toString('base64');
  }
}

function base64ToBytes(b64: string): Uint8Array {
  try {
    if (typeof atob === 'function') {
      const bin = atob(b64);
      const out = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
      return out;
    }
  } catch {
    /* fallthrough */
  }
  return new Uint8Array(Buffer.from(b64, 'base64'));
}

export default function BackupIndex() {
  const router = useRouter();
  const showToast = useUiStore((s) => s.showToast);
  const bumpAll = useInvalidateStore((s) => s.bumpAll);
  const [passphrase, setPassphrase] = useState('');
  const [restorePass, setRestorePass] = useState('');
  const [working, setWorking] = useState(false);

  const onExport = async () => {
    if (passphrase.length < 8) {
      showToast({ tone: 'error', text: 'Set an 8+ char passphrase' });
      return;
    }
    setWorking(true);
    try {
      const snap = await snapshotDatabase();
      const blob = await exportToEncryptedBlob(passphrase, snap);
      const base64 = bytesToBase64(blob);
      const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const res = await filesystemService.saveFile({
        suggestedName: `moneynest-${ts}.mnbk`,
        base64,
        mimeType: 'application/octet-stream',
      });
      if (res) {
        await setSetting('backup.lastAt', now());
        showToast({ tone: 'success', text: t('backup.exportSuccess') });
      } else {
        showToast({ tone: 'error', text: 'Export cancelled' });
      }
    } catch (e) {
      showToast({ tone: 'error', text: (e as Error).message });
    } finally {
      setWorking(false);
    }
  };

  const onPickAndRestore = async (mode: 'replace' | 'merge') => {
    if (restorePass.length < 8) {
      showToast({ tone: 'error', text: 'Enter passphrase' });
      return;
    }
    setWorking(true);
    try {
      const file = await filesystemService.pickFile();
      if (!file) {
        setWorking(false);
        return;
      }
      const blob = base64ToBytes(file.base64);
      const parsed = await readEncryptedBlob(restorePass, blob);
      await restoreFromBackup(parsed, mode);
      bumpAll();
      showToast({ tone: 'success', text: t('backup.importSuccess') });
    } catch (e) {
      showToast({ tone: 'error', text: (e as Error).message });
    } finally {
      setWorking(false);
    }
  };

  return (
    <AppShell>
      <ScreenHeader title={t('backup.title')} />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['4'] }}>
        <Card>
          <Text variant="h3">{t('backup.exportTitle')}</Text>
          <View style={{ height: spacing['2'] }} />
          <Text variant="small" tone="muted">
            {t('backup.exportBody')}
          </Text>
          <View style={{ height: spacing['3'] }} />
          <Input
            label={t('backup.passphraseLabel')}
            value={passphrase}
            onChangeText={setPassphrase}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View style={{ height: spacing['3'] }} />
          <Button
            label={working ? '…' : t('backup.exportCta')}
            iconLeft="download"
            onPress={onExport}
            fullWidth
          />
        </Card>

        <Card>
          <Text variant="h3">{t('backup.importTitle')}</Text>
          <View style={{ height: spacing['2'] }} />
          <Text variant="small" tone="muted">
            {t('backup.importBody')}
          </Text>
          <View style={{ height: spacing['3'] }} />
          <Input
            label={t('backup.passphraseLabel')}
            value={restorePass}
            onChangeText={setRestorePass}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View style={{ height: spacing['3'] }} />
          <Button label={t('backup.importMergeCta')} iconLeft="upload" onPress={() => onPickAndRestore('merge')} fullWidth />
          <View style={{ height: spacing['2'] }} />
          <Button label={t('backup.importReplaceCta')} variant="danger" onPress={() => onPickAndRestore('replace')} fullWidth />
        </Card>

        <Card>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing['3'],
            }}
          >
            <Icon name="key" tone="muted" />
            <View style={{ flex: 1 }}>
              <Text variant="bodyMed">{t('settings.changePassphrase')}</Text>
              <Text variant="caption" tone="muted">
                Sets the canary used to verify your passphrase.
              </Text>
            </View>
            <Button label="Set" variant="secondary" onPress={() => router.push('/backup/passphrase' as never)} />
          </View>
        </Card>
      </ScrollView>
    </AppShell>
  );
}
