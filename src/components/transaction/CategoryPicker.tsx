import React from 'react';
import { ScrollView, View } from 'react-native';
import { spacing } from '@/brand/spacing';
import { Chip } from '@/components/primitives';
import { useCategories } from '@/hooks/use-categories';
import type { CategoryType } from '@/db/queries/categories';

export type CategoryPickerProps = {
  type: CategoryType;
  value: string | null;
  onChange: (id: string) => void;
};

export function CategoryPicker({ type, value, onChange }: CategoryPickerProps) {
  const { data } = useCategories({ type });
  const cats = data ?? [];
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: spacing['2'], paddingHorizontal: spacing['1'] }}
    >
      {cats.map((c) => (
        <Chip
          key={c.id}
          label={c.name}
          iconLeft={c.icon}
          selected={c.id === value}
          onPress={() => onChange(c.id)}
        />
      ))}
      <View style={{ width: spacing['2'] }} />
    </ScrollView>
  );
}
