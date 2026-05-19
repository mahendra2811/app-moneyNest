/**
 * NEW-43, NEW-44, NEW-45 — document vault.
 */
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card, Text, Input, Button, Chip, IconButton, EmptyState } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { listDocs, saveDoc, deleteDoc, type VaultDoc, type DocCategory } from '@/lib/documents';
import { filesystemService } from '@/platform/filesystem';
import { useUiStore } from '@/stores/ui';
import { formatRelativeDay } from '@/lib/date';

const CATEGORIES: DocCategory[] = ['rent', 'insurance', 'warranty', 'nominee', 'tax', 'other'];

export default function Vault() {
  const showToast = useUiStore((s) => s.showToast);
  const [docs, setDocs] = useState<VaultDoc[]>([]);
  const [category, setCategory] = useState<DocCategory>('rent');
  const [passphrase, setPassphrase] = useState('');
  const [expires, setExpires] = useState('');

  const reload = async () => setDocs(await listDocs());
  useEffect(() => { reload(); }, []);

  const onAdd = async () => {
    if (passphrase.length < 8) {
      showToast({ tone: 'error', text: 'Passphrase 8+ chars' });
      return;
    }
    const file = await filesystemService.pickFile();
    if (!file) return;
    await saveDoc({
      category,
      name: file.name,
      base64: file.base64,
      passphrase,
      ...(expires ? { expiresAt: expires } : {}),
    });
    showToast({ tone: 'success', text: 'Saved to vault' });
    setPassphrase('');
    reload();
  };

  return (
    <AppShell>
      <ScreenHeader title="Document vault" />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['3'] }}>
        <Card>
          <Text variant="small" tone="muted">
            PDFs and images, AES-256-GCM encrypted on device. Same passphrase you use for backups
            can also unlock these.
          </Text>
        </Card>
        <Card>
          <Text variant="h3">Add document</Text>
          <View style={{ height: spacing['3'] }} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['2'] }}>
            {CATEGORIES.map((c) => (
              <Chip key={c} label={c} selected={c === category} onPress={() => setCategory(c)} />
            ))}
          </View>
          <View style={{ height: spacing['3'] }} />
          <Input label="Expires (YYYY-MM-DD, optional)" value={expires} onChangeText={setExpires} />
          <View style={{ height: spacing['2'] }} />
          <Input label="Passphrase" value={passphrase} onChangeText={setPassphrase} secureTextEntry autoCapitalize="none" />
          <View style={{ height: spacing['3'] }} />
          <Button label="Pick file" iconLeft="file-up" onPress={onAdd} fullWidth />
        </Card>
        {docs.length === 0 ? (
          <EmptyState icon="folder" title="Vault is empty" body="Add rent agreement, insurance, warranty cards…" />
        ) : (
          docs.map((d) => (
            <Card key={d.id}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyMed">{d.name}</Text>
                  <Text variant="caption" tone="muted">
                    {d.category} · {(d.sizeBytes / 1024).toFixed(1)} KB
                    {d.expiresAt ? ` · expires ${formatRelativeDay(d.expiresAt)}` : ''}
                  </Text>
                </View>
                <IconButton name="trash-2" accessibilityLabel="Delete" onPress={async () => { await deleteDoc(d.id); reload(); }} />
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </AppShell>
  );
}
