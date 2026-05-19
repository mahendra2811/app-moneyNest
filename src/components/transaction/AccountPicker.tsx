import React from 'react';
import { ScrollView, View } from 'react-native';
import { spacing } from '@/brand/spacing';
import { Chip } from '@/components/primitives';
import { useAccounts } from '@/hooks/use-accounts';

export type AccountPickerProps = {
  value: string | null;
  onChange: (id: string) => void;
  excludeId?: string | undefined;
};

export function AccountPicker({ value, onChange, excludeId }: AccountPickerProps) {
  const { data } = useAccounts();
  const accs = (data ?? []).filter((a) => a.id !== excludeId);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: spacing['2'], paddingHorizontal: spacing['1'] }}
    >
      {accs.map((a) => (
        <Chip
          key={a.id}
          label={a.name}
          iconLeft={a.icon}
          selected={a.id === value}
          onPress={() => onChange(a.id)}
        />
      ))}
      <View style={{ width: spacing['2'] }} />
    </ScrollView>
  );
}
