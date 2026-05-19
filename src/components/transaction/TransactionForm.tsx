import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { spacing } from '@/brand/spacing';
import { Text, Input, Button, Sheet, Keypad } from '@/components/primitives';
import { AmountInput } from './AmountInput';
import { TypeToggle, type TxType } from './TypeToggle';
import { CategoryPicker } from './CategoryPicker';
import { AccountPicker } from './AccountPicker';
import { DatePicker } from './DatePicker';
import { t } from '@/copy';
import { parseToPaise } from '@/lib/money';
import { now } from '@/lib/date';
import { useSessionStore } from '@/stores/session';
import { useAccounts } from '@/hooks/use-accounts';
import {
  createTransaction,
  updateTransaction,
  softDeleteTransaction,
} from '@/db/queries/transactions';
import { useInvalidateStore } from '@/stores/invalidate';
import { useUiStore } from '@/stores/ui';
import type { Transaction } from '@/db/schema';
import { useHaptic } from '@/hooks/use-haptic';

export type TransactionFormProps = {
  existing?: Transaction | null;
};

export function TransactionForm({ existing }: TransactionFormProps) {
  const router = useRouter();
  const haptic = useHaptic();
  const bumpTx = useInvalidateStore((s) => s.bumpTransactions);
  const showToast = useUiStore((s) => s.showToast);
  const session = useSessionStore();
  const { data: accounts } = useAccounts();

  const [type, setType] = useState<TxType>((existing?.type ?? session.lastTxType) as TxType);
  const [paise, setPaise] = useState<number>(existing?.amountPaise ?? 0);
  const [categoryId, setCategoryId] = useState<string | null>(
    existing?.categoryId ?? (type === 'expense' ? session.lastExpenseCategoryId : session.lastIncomeCategoryId),
  );
  const [accountId, setAccountId] = useState<string | null>(
    existing?.accountId ?? session.lastAccountId ?? accounts?.[0]?.id ?? null,
  );
  const [toAccountId, setToAccountId] = useState<string | null>(existing?.toAccountId ?? null);
  const [occurredAt, setOccurredAt] = useState<string>(existing?.occurredAt ?? now());
  const [note, setNote] = useState<string>(existing?.note ?? '');
  const [payee, setPayee] = useState<string>(existing?.payee ?? '');
  const [amountSheet, setAmountSheet] = useState<boolean>(!existing);
  const [draft, setDraft] = useState<string>(existing ? String(existing.amountPaise / 100) : '');

  useEffect(() => {
    if (!accountId && accounts && accounts.length > 0) setAccountId(accounts[0]!.id);
  }, [accounts, accountId]);

  useEffect(() => {
    if (type !== 'transfer') setToAccountId(null);
  }, [type]);

  const onKey = (k: string) => {
    setDraft((d) => {
      if (k === '.' && d.includes('.')) return d;
      if (d.includes('.') && d.split('.')[1]!.length >= 2) return d;
      return d + k;
    });
  };
  const onBackspace = () => setDraft((d) => d.slice(0, -1));

  const confirmAmount = () => {
    const p = parseToPaise(draft || '0');
    if (p === null || p === 0) {
      showToast({ tone: 'error', text: t('errors.invalidAmount') });
      return;
    }
    setPaise(p);
    setAmountSheet(false);
  };

  const onSave = async () => {
    if (paise <= 0) {
      showToast({ tone: 'error', text: t('errors.invalidAmount') });
      return;
    }
    if (!accountId) {
      showToast({ tone: 'error', text: t('errors.pickAccountFirst') });
      return;
    }
    if (type === 'transfer') {
      if (!toAccountId) {
        showToast({ tone: 'error', text: t('errors.pickToAccount') });
        return;
      }
      if (toAccountId === accountId) {
        showToast({ tone: 'error', text: t('errors.sameAccount') });
        return;
      }
    } else {
      if (!categoryId) {
        showToast({ tone: 'error', text: t('errors.pickCategoryFirst') });
        return;
      }
    }

    if (existing) {
      await updateTransaction(existing.id, {
        amountPaise: paise,
        type,
        accountId,
        toAccountId: type === 'transfer' ? toAccountId : null,
        categoryId: type === 'transfer' ? null : categoryId,
        occurredAt,
        note: note.trim() || null,
        payee: payee.trim() || null,
      });
    } else {
      await createTransaction({
        amountPaise: paise,
        type,
        accountId,
        toAccountId: type === 'transfer' ? toAccountId : null,
        categoryId: type === 'transfer' ? null : categoryId,
        occurredAt,
        note: note.trim() || null,
        payee: payee.trim() || null,
        source: 'manual',
        deletedAt: null,
        recurringId: null,
      });
    }
    bumpTx();
    session.setLastAccountId(accountId);
    session.setLastTxType(type);
    if (categoryId) {
      if (type === 'expense') session.setLastExpenseCategoryId(categoryId);
      if (type === 'income') session.setLastIncomeCategoryId(categoryId);
    }
    haptic('success');
    showToast({ tone: 'success', text: t('transactions.savedToast') });
    router.back();
  };

  const onDelete = async () => {
    if (!existing) return;
    await softDeleteTransaction(existing.id);
    bumpTx();
    haptic('warning');
    showToast({
      tone: 'info',
      text: t('transactions.deletedToast'),
      actionLabel: t('common.undo'),
      onAction: async () => {
        const { undoSoftDelete } = await import('@/db/queries/transactions');
        await undoSoftDelete(existing.id);
        bumpTx();
      },
    });
    router.back();
  };

  return (
    <>
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['4'] }}>
        <TypeToggle value={type} onChange={setType} />
        <AmountInput paise={paise} tone={type} onPress={() => setAmountSheet(true)} />

        {type !== 'transfer' ? (
          <View style={{ gap: spacing['2'] }}>
            <Text variant="small" tone="muted">
              {t('transactions.category')}
            </Text>
            <CategoryPicker
              type={type === 'income' ? 'income' : 'expense'}
              value={categoryId}
              onChange={setCategoryId}
            />
          </View>
        ) : null}

        <View style={{ gap: spacing['2'] }}>
          <Text variant="small" tone="muted">
            {type === 'transfer' ? 'From account' : t('transactions.account')}
          </Text>
          <AccountPicker value={accountId} onChange={setAccountId} />
        </View>

        {type === 'transfer' ? (
          <View style={{ gap: spacing['2'] }}>
            <Text variant="small" tone="muted">
              {t('transactions.toAccount')}
            </Text>
            <AccountPicker
              value={toAccountId}
              onChange={setToAccountId}
              excludeId={accountId ?? undefined}
            />
          </View>
        ) : null}

        <View style={{ gap: spacing['2'] }}>
          <Text variant="small" tone="muted">
            {t('transactions.date')}
          </Text>
          <DatePicker valueIso={occurredAt} onChange={setOccurredAt} />
        </View>

        {type !== 'transfer' ? (
          <Input
            label={t('transactions.payee')}
            placeholder={t('transactions.payeePlaceholder')}
            value={payee}
            onChangeText={setPayee}
            autoCapitalize="words"
          />
        ) : null}

        <Input
          label={t('transactions.note')}
          placeholder={t('transactions.notePlaceholder')}
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={2}
        />

        <Button label={t('transactions.saveTransaction')} size="lg" fullWidth onPress={onSave} />
        {existing ? (
          <Button label={t('common.delete')} variant="danger" size="md" fullWidth onPress={onDelete} />
        ) : null}
      </ScrollView>

      <Sheet open={amountSheet} onClose={() => setAmountSheet(false)}>
        <Text variant="h3" style={{ textAlign: 'center' }}>
          ₹{draft || '0'}
        </Text>
        <View style={{ height: spacing['4'] }} />
        <Keypad onPressKey={onKey} onBackspace={onBackspace} />
        <View style={{ height: spacing['4'] }} />
        <Button label={t('common.done')} size="lg" fullWidth onPress={confirmAmount} />
      </Sheet>
    </>
  );
}
