import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Input, Button } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { upsertGoal } from '@/db/queries/goals';
import { parseToPaise } from '@/lib/money';
import { useUiStore } from '@/stores/ui';

export default function NewGoal() {
  const router = useRouter();
  const showToast = useUiStore((s) => s.showToast);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [due, setDue] = useState('');

  const onSave = async () => {
    if (!name.trim()) return;
    const p = parseToPaise(target || '0');
    if (!p) {
      showToast({ tone: 'error', text: 'Invalid amount' });
      return;
    }
    await upsertGoal({
      name: name.trim(),
      targetPaise: p,
      currentPaise: 0,
      ...(due.trim() ? { dueDate: due.trim() } : {}),
    });
    router.back();
  };

  return (
    <AppShell>
      <ScreenHeader title="New goal" />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['4'] }}>
        <Input label="Goal name" value={name} onChangeText={setName} placeholder="New laptop" autoCapitalize="words" />
        <Input label="Target amount (₹)" value={target} onChangeText={setTarget} keyboardType="decimal-pad" />
        <Input label="Due date (YYYY-MM-DD, optional)" value={due} onChangeText={setDue} />
        <Button label="Create" fullWidth size="lg" onPress={onSave} />
      </ScrollView>
    </AppShell>
  );
}
