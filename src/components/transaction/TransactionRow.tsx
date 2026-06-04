import React, { memo } from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { spacing } from '@/brand/spacing';
import { radius } from '@/brand/radius';
import { Text, Icon } from '@/components/primitives';
import { formatINR } from '@/lib/money';
import { formatRelativeDay, formatTime } from '@/lib/date';
import type { TransactionWithJoins } from '@/db/queries/transactions';

export type TransactionRowProps = {
  tx: TransactionWithJoins;
  onPress?: ((id: string) => void) | undefined;
};

export const TransactionRow = memo(function TransactionRow({
  tx,
  onPress,
}: TransactionRowProps) {
  const t = useTheme();
  const isExpense = tx.type === 'expense';
  const isIncome = tx.type === 'income';
  const isTransfer = tx.type === 'transfer';

  const amountTone = isExpense ? t.expense : isIncome ? t.income : t.transfer;
  const sign = isExpense ? '-' : isIncome ? '+' : '';
  const title =
    isTransfer
      ? `${tx.account?.name ?? '—'} → ${tx.toAccount?.name ?? '—'}`
      : tx.category?.name ?? (tx.payee ?? 'Uncategorised');

  const subtitle = isTransfer
    ? formatRelativeDay(tx.occurredAt)
    : `${tx.account?.name ?? '—'} · ${formatRelativeDay(tx.occurredAt)} · ${formatTime(tx.occurredAt)}`;

  const iconName = tx.category?.icon ?? (isTransfer ? 'repeat' : 'circle');
  const iconColor = tx.category?.color ?? amountTone;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${tx.type}, ${formatINR(tx.amountPaise)}, ${title}`}
      onPress={() => onPress?.(tx.id)}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing['3'],
        backgroundColor: t.surface,
        borderRadius: radius.lg,
        padding: spacing['4'],
        marginVertical: spacing['1'],
        borderWidth: 1,
        borderColor: t.border,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: t.surfaceMuted,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={iconName} size="sm" color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="bodyMed" numberOfLines={1}>
          {title}
        </Text>
        {tx.payee && !isTransfer ? (
          <Text variant="caption" tone="muted" numberOfLines={1}>
            {tx.payee}
          </Text>
        ) : null}
        <Text variant="caption" tone="faint" numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <Text variant="bodyMed" tabular style={{ color: amountTone }}>
        {sign}
        {formatINR(tx.amountPaise, { withSymbol: true })}
      </Text>
    </Pressable>
  );
});
