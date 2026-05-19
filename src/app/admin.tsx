import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card, Text, Input, Button, IconButton } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { listPayeeAliases, setPayeeAlias, applyPayeeAliases, mergeCategories } from '@/db/queries/admin';
import { useCategories } from '@/hooks/use-categories';
import { useInvalidateStore } from '@/stores/invalidate';
import { useUiStore } from '@/stores/ui';

export default function AdminScreen() {
  const showToast = useUiStore((s) => s.showToast);
  const bumpAll = useInvalidateStore((s) => s.bumpAll);
  const [aliases, setAliases] = useState<{ from: string; to: string }[]>([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const { data: cats } = useCategories({ type: 'expense' });
  const [mergeFrom, setMergeFrom] = useState<string | null>(null);
  const [mergeInto, setMergeInto] = useState<string | null>(null);

  useEffect(() => {
    listPayeeAliases().then(setAliases);
  }, []);

  const onAddAlias = async () => {
    if (!from.trim() || !to.trim()) return;
    await setPayeeAlias({ from: from.trim(), to: to.trim() });
    setAliases(await listPayeeAliases());
    setFrom('');
    setTo('');
  };

  const onApplyAliases = async () => {
    const n = await applyPayeeAliases();
    bumpAll();
    showToast({ tone: 'success', text: `Updated ${n} transactions` });
  };

  const onMergeCategories = async () => {
    if (!mergeFrom || !mergeInto || mergeFrom === mergeInto) return;
    await mergeCategories(mergeFrom, mergeInto);
    bumpAll();
    showToast({ tone: 'success', text: 'Categories merged' });
  };

  return (
    <AppShell>
      <ScreenHeader title="Cleanup" />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['4'] }}>
        <Card>
          <Text variant="h3">Payee aliases</Text>
          <Text variant="small" tone="muted">
            Map "Zomato Ltd" → "Zomato" once; we apply it across history.
          </Text>
          <View style={{ height: spacing['3'] }} />
          <Input label="From" value={from} onChangeText={setFrom} placeholder="Zomato Limited" />
          <View style={{ height: spacing['2'] }} />
          <Input label="To" value={to} onChangeText={setTo} placeholder="Zomato" />
          <View style={{ height: spacing['3'] }} />
          <Button label="Add alias" iconLeft="plus" onPress={onAddAlias} fullWidth />
          <View style={{ height: spacing['2'] }} />
          {aliases.map((a) => (
            <View key={`${a.from}-${a.to}`} style={{ flexDirection: 'row', paddingVertical: spacing['2'] }}>
              <Text variant="small" style={{ flex: 1 }}>
                {a.from} → {a.to}
              </Text>
            </View>
          ))}
          {aliases.length > 0 ? <Button label="Apply all" onPress={onApplyAliases} fullWidth /> : null}
        </Card>

        <Card>
          <Text variant="h3">Merge categories</Text>
          <View style={{ height: spacing['3'] }} />
          <Text variant="small" tone="muted">
            From: {mergeFrom ? cats?.find((c) => c.id === mergeFrom)?.name : 'pick'} · Into: {mergeInto ? cats?.find((c) => c.id === mergeInto)?.name : 'pick'}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['2'], marginTop: spacing['2'] }}>
            {(cats ?? []).map((c) => (
              <IconButton
                key={c.id}
                name={c.icon}
                accessibilityLabel={`pick ${c.name}`}
                onPress={() => {
                  if (!mergeFrom) setMergeFrom(c.id);
                  else if (!mergeInto && c.id !== mergeFrom) setMergeInto(c.id);
                  else {
                    setMergeFrom(c.id);
                    setMergeInto(null);
                  }
                }}
              />
            ))}
          </View>
          <View style={{ height: spacing['3'] }} />
          <Button label="Merge" variant="danger" onPress={onMergeCategories} disabled={!mergeFrom || !mergeInto} />
        </Card>
      </ScrollView>
    </AppShell>
  );
}
