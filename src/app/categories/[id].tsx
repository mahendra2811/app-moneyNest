import React, { useEffect, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Input, Button, Text, Chip } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { useCategory } from '@/hooks/use-categories';
import { archiveCategory, createCategory, updateCategory } from '@/db/queries/categories';
import { useInvalidateStore } from '@/stores/invalidate';
import { useUiStore } from '@/stores/ui';
import { t } from '@/copy';

const ICONS = [
  'tag',
  'utensils',
  'shopping-cart',
  'car',
  'fuel',
  'receipt',
  'home',
  'shopping-bag',
  'film',
  'heart-pulse',
  'graduation-cap',
  'sparkles',
];
const COLORS = ['#16A34A', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6', '#EF4444', '#0EA5E9', '#14B8A6'];

export default function CategoryDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === 'new';
  const { data } = useCategory(isNew ? undefined : (typeof id === 'string' ? id : undefined));
  const bump = useInvalidateStore((s) => s.bumpCategories);
  const showToast = useUiStore((s) => s.showToast);

  const [name, setName] = useState<string>('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [icon, setIcon] = useState<string>('tag');
  const [color, setColor] = useState<string>('#16A34A');

  useEffect(() => {
    if (data) {
      setName(data.name);
      setType(data.type);
      setIcon(data.icon);
      setColor(data.color);
    }
  }, [data]);

  const onSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      showToast({ tone: 'error', text: 'Name required' });
      return;
    }
    if (isNew) {
      await createCategory({
        name: trimmed,
        type,
        icon,
        color,
        sortOrder: 99,
        isArchived: false,
        isDefault: false,
      });
    } else if (data) {
      await updateCategory(data.id, { name: trimmed, type, icon, color });
    }
    bump();
    router.back();
  };

  const onArchive = async () => {
    if (data) {
      await archiveCategory(data.id);
      bump();
      router.back();
    }
  };

  return (
    <AppShell>
      <ScreenHeader title={isNew ? 'New category' : 'Edit category'} />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['4'] }}>
        <Input label="Name" value={name} onChangeText={setName} placeholder="e.g. Subscriptions" />
        <View style={{ flexDirection: 'row', gap: spacing['2'] }}>
          <Chip label={t('transactions.expense')} selected={type === 'expense'} onPress={() => setType('expense')} />
          <Chip label={t('transactions.income')} selected={type === 'income'} onPress={() => setType('income')} />
        </View>
        <View>
          <Text variant="small" tone="muted" style={{ marginBottom: spacing['2'] }}>
            Icon
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['2'] }}>
            {ICONS.map((i) => (
              <Chip key={i} label={i} iconLeft={i} selected={i === icon} onPress={() => setIcon(i)} />
            ))}
          </View>
        </View>
        <View>
          <Text variant="small" tone="muted" style={{ marginBottom: spacing['2'] }}>
            Color
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing['2'], flexWrap: 'wrap' }}>
            {COLORS.map((c) => (
              <Chip key={c} label={c} selected={c === color} onPress={() => setColor(c)} />
            ))}
          </View>
        </View>
        <Button label={t('common.save')} fullWidth onPress={onSave} size="lg" />
        {!isNew && data && !data.isDefault ? (
          <Button label="Archive" variant="danger" fullWidth onPress={onArchive} />
        ) : null}
      </ScrollView>
    </AppShell>
  );
}
