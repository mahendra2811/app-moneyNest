import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Text, Input, Button, Switch } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { useBudgetForCategory } from '@/hooks/use-budgets';
import { useCategory } from '@/hooks/use-categories';
import { upsertBudget, deleteBudget } from '@/db/queries/budgets';
import { useInvalidateStore } from '@/stores/invalidate';
import { useUiStore } from '@/stores/ui';
import { parseToPaise } from '@/lib/money';
import { t } from '@/copy';

export default function BudgetEdit() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const categoryId = typeof id === 'string' ? id : '';
  const { data: cat } = useCategory(categoryId);
  const { data: existing } = useBudgetForCategory(categoryId);
  const bump = useInvalidateStore((s) => s.bumpBudgets);
  const showToast = useUiStore((s) => s.showToast);

  const [amount, setAmount] = useState('');
  const [rollover, setRollover] = useState(false);
  const [alert80, setAlert80] = useState(true);
  const [alert100, setAlert100] = useState(true);

  useEffect(() => {
    if (existing) {
      setAmount(String(existing.amountPaise / 100));
      setRollover(existing.rollover);
      setAlert80(existing.alertAt80);
      setAlert100(existing.alertAt100);
    }
  }, [existing]);

  const onSave = async () => {
    const paise = parseToPaise(amount || '0');
    if (paise === null || paise <= 0) {
      showToast({ tone: 'error', text: t('errors.invalidAmount') });
      return;
    }
    await upsertBudget({
      categoryId,
      amountPaise: paise,
      rollover,
      alertAt80: alert80,
      alertAt100: alert100,
    });
    bump();
    router.back();
  };

  const onDelete = async () => {
    if (existing) {
      await deleteBudget(existing.id);
      bump();
      router.back();
    }
  };

  return (
    <AppShell>
      <ScreenHeader title={cat?.name ?? t('budgets.editTitle')} />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['4'] }}>
        <Input
          label={t('budgets.monthlyAmount')}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="0"
        />
        <Row label={t('budgets.rollover')}>
          <Switch value={rollover} onValueChange={setRollover} />
        </Row>
        <Row label={t('budgets.alertAt80')}>
          <Switch value={alert80} onValueChange={setAlert80} />
        </Row>
        <Row label={t('budgets.alertAt100')}>
          <Switch value={alert100} onValueChange={setAlert100} />
        </Row>
        <Button label={t('common.save')} size="lg" fullWidth onPress={onSave} />
        {existing ? <Button label={t('common.delete')} variant="danger" fullWidth onPress={onDelete} /> : null}
      </ScrollView>
    </AppShell>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Text variant="bodyMed" style={{ flex: 1 }}>
        {label}
      </Text>
      {children}
    </View>
  );
}
