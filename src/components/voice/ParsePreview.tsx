import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { GlassCard, Text, Button, Chip } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { formatINR } from '@/lib/money';
import type { ParseResult } from '@/lib/voice-parser';

export type ParsePreviewProps = {
  result: ParseResult;
  resolvedCategoryName?: string | null;
  resolvedAccountName?: string | null;
  onSave: () => void;
  onEdit: () => void;
  onDiscard: () => void;
};

export function ParsePreview({
  result,
  resolvedCategoryName,
  resolvedAccountName,
  onSave,
  onEdit,
  onDiscard,
}: ParsePreviewProps) {
  const t = useTheme();
  const tone =
    result.type === 'expense' ? t.expense : result.type === 'income' ? t.income : t.transfer;
  const confident = result.confidence >= 0.7;
  return (
    <GlassCard intensity="strong" radius="xl">
      <Text variant="caption" tone="muted">
        {confident ? 'PARSED' : 'PLEASE CHECK'}
      </Text>
      <View style={{ height: spacing['2'] }} />
      <Text variant="display" tabular style={{ color: tone }}>
        {result.amountPaise !== null ? formatINR(result.amountPaise) : '—'}
      </Text>
      <Text variant="bodyMed" tone="muted" style={{ textTransform: 'capitalize' }}>
        {result.type}
      </Text>
      <View style={{ height: spacing['3'] }} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['2'] }}>
        {resolvedCategoryName ? <Chip label={resolvedCategoryName} iconLeft="tag" /> : null}
        {resolvedAccountName ? <Chip label={resolvedAccountName} iconLeft="wallet" /> : null}
        {result.payee ? <Chip label={result.payee} iconLeft="user" /> : null}
        {result.dateHint ? <Chip label={result.dateHint} iconLeft="calendar" /> : null}
      </View>
      <View style={{ height: spacing['3'] }} />
      <Text variant="caption" tone="faint">
        You said: “{result.raw}”
      </Text>
      <View style={{ height: spacing['4'] }} />
      <View style={{ flexDirection: 'row', gap: spacing['2'] }}>
        <Button label="Save" onPress={onSave} fullWidth />
      </View>
      <View style={{ height: spacing['2'] }} />
      <View style={{ flexDirection: 'row', gap: spacing['2'] }}>
        <Button label="Edit details" variant="secondary" onPress={onEdit} />
        <Button label="Discard" variant="ghost" onPress={onDiscard} />
      </View>
    </GlassCard>
  );
}
