import React, { useState } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Text, Chip, Icon, IconButton, EmptyState } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { radius } from '@/brand/radius';
import { useTheme } from '@/theme';
import { useCategories } from '@/hooks/use-categories';
import type { CategoryType } from '@/db/queries/categories';
import { t } from '@/copy';

export default function CategoriesIndex() {
  const t_ = useTheme();
  const router = useRouter();
  const [type, setType] = useState<CategoryType>('expense');
  const { data } = useCategories({ type });

  return (
    <AppShell>
      <ScreenHeader
        title="Categories"
        right={<IconButton name="plus" accessibilityLabel="Add" onPress={() => router.push('/categories/new' as never)} />}
      />
      <View style={{ paddingHorizontal: spacing['4'], paddingBottom: spacing['3'] }}>
        <View style={{ flexDirection: 'row', gap: spacing['2'] }}>
          <Chip label={t('transactions.expense')} selected={type === 'expense'} onPress={() => setType('expense')} />
          <Chip label={t('transactions.income')} selected={type === 'income'} onPress={() => setType('income')} />
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['2'] }}>
        {(data ?? []).length === 0 ? (
          <EmptyState icon="layers" title="No categories" body="Tap + to add a category." />
        ) : (
          (data ?? []).map((c) => (
            <Pressable
              key={c.id}
              onPress={() => router.push(`/categories/${c.id}` as never)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing['3'],
                backgroundColor: t_.surface,
                borderColor: t_.border,
                borderWidth: 1,
                borderRadius: radius.lg,
                padding: spacing['4'],
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: t_.surfaceMuted,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name={c.icon} size="sm" color={c.color} />
              </View>
              <Text variant="bodyMed" style={{ flex: 1 }}>
                {c.name}
              </Text>
              <Icon name="chevron-right" size="sm" tone="muted" />
            </Pressable>
          ))
        )}
      </ScrollView>
    </AppShell>
  );
}
