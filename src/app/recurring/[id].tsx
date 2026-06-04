import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Text, Input, Button, Chip } from '@/components/primitives';
import { AccountPicker } from '@/components/transaction/AccountPicker';
import { CategoryPicker } from '@/components/transaction/CategoryPicker';
import { spacing } from '@/brand/spacing';
import { useRecurringById } from '@/hooks/use-recurring';
import { createRecurring, updateRecurring, deleteRecurring } from '@/db/queries/recurring';
import { useInvalidateStore } from '@/stores/invalidate';
import { useUiStore } from '@/stores/ui';
import { parseToPaise } from '@/lib/money';
import { now } from '@/lib/date';
import { computeNextRun, type Frequency } from '@/lib/recurring-engine';
import { t } from '@/copy';

const FREQUENCIES: { key: Frequency; label: string }[] = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'yearly', label: 'Yearly' },
];

export default function RecurringDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === 'new';
  const { data } = useRecurringById(isNew ? undefined : (typeof id === 'string' ? id : undefined));
  const bump = useInvalidateStore((s) => s.bumpRecurring);
  const showToast = useUiStore((s) => s.showToast);

  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('monthly');
  const [dayOfMonth, setDayOfMonth] = useState('1');
  const [accountId, setAccountId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [payee, setPayee] = useState('');

  useEffect(() => {
    if (data) {
      const tpl = JSON.parse(data.templateJson);
      setAmount(String(tpl.amountPaise / 100));
      setFrequency(data.frequency as Frequency);
      setDayOfMonth(String(data.dayOfMonth ?? 1));
      setAccountId(tpl.accountId ?? null);
      setCategoryId(tpl.categoryId ?? null);
      setPayee(tpl.payee ?? '');
    }
  }, [data]);

  const onSave = async () => {
    const paise = parseToPaise(amount || '0');
    if (paise === null || paise <= 0) {
      showToast({ tone: 'error', text: t('errors.invalidAmount') });
      return;
    }
    if (!accountId) {
      showToast({ tone: 'error', text: t('errors.pickAccountFirst') });
      return;
    }
    const tpl = {
      amountPaise: paise,
      type: 'expense' as const,
      accountId,
      categoryId,
      payee: payee.trim() || null,
      note: null,
    };
    const ts = now();
    const dom = Number(dayOfMonth);
    const start = ts;
    const nextRunAt = computeNextRun({
      frequency,
      intervalCount: 1,
      dayOfMonth: frequency === 'monthly' ? dom : null,
      fromIso: start,
      strictlyAfter: false,
    });
    if (isNew) {
      await createRecurring({
        templateJson: JSON.stringify(tpl),
        frequency,
        intervalCount: 1,
        dayOfMonth: frequency === 'monthly' ? dom : null,
        dayOfWeek: null,
        startDate: start,
        endDate: null,
        nextRunAt,
        lastRunAt: null,
        isActive: true,
      });
    } else if (data) {
      await updateRecurring(data.id, {
        templateJson: JSON.stringify(tpl),
        frequency,
        dayOfMonth: frequency === 'monthly' ? dom : null,
        nextRunAt,
      });
    }
    bump();
    router.back();
  };

  const onDelete = async () => {
    if (data) {
      await deleteRecurring(data.id);
      bump();
      router.back();
    }
  };

  return (
    <AppShell>
      <ScreenHeader title={isNew ? t('recurring.newTitle') : t('recurring.editTitle')} />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['4'] }}>
        <Input label="Amount (₹)" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
        <View>
          <Text variant="small" tone="muted" style={{ marginBottom: spacing['2'] }}>
            {t('recurring.frequency')}
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing['2'], flexWrap: 'wrap' }}>
            {FREQUENCIES.map((f) => (
              <Chip key={f.key} label={f.label} selected={f.key === frequency} onPress={() => setFrequency(f.key)} />
            ))}
          </View>
        </View>
        {frequency === 'monthly' ? (
          <Input label="Day of month" value={dayOfMonth} onChangeText={setDayOfMonth} keyboardType="number-pad" />
        ) : null}
        <View>
          <Text variant="small" tone="muted" style={{ marginBottom: spacing['2'] }}>
            Account
          </Text>
          <AccountPicker value={accountId} onChange={setAccountId} />
        </View>
        <View>
          <Text variant="small" tone="muted" style={{ marginBottom: spacing['2'] }}>
            Category
          </Text>
          <CategoryPicker type="expense" value={categoryId} onChange={setCategoryId} />
        </View>
        <Input label="Payee (optional)" value={payee} onChangeText={setPayee} />
        <Button label={t('common.save')} size="lg" fullWidth onPress={onSave} />
        {!isNew ? <Button label={t('common.delete')} variant="danger" fullWidth onPress={onDelete} /> : null}
      </ScrollView>
    </AppShell>
  );
}
