import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Input, Button, Text, Chip } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { useAccount } from '@/hooks/use-accounts';
import { archiveAccount, createAccount, updateAccount } from '@/db/queries/accounts';
import { useInvalidateStore } from '@/stores/invalidate';
import { useUiStore } from '@/stores/ui';
import { parseToPaise } from '@/lib/money';
import type { AccountType } from '@/types/domain';

const TYPES: { key: AccountType; label: string; icon: string }[] = [
  { key: 'cash', label: 'Cash', icon: 'wallet' },
  { key: 'bank', label: 'Bank', icon: 'landmark' },
  { key: 'upi', label: 'UPI', icon: 'qr-code' },
  { key: 'wallet', label: 'Wallet', icon: 'credit-card' },
  { key: 'credit_card', label: 'Credit card', icon: 'credit-card' },
];
const COLORS = ['#16A34A', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6'];

export default function AccountDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === 'new';
  const { data } = useAccount(isNew ? undefined : (typeof id === 'string' ? id : undefined));
  const bump = useInvalidateStore((s) => s.bumpAccounts);
  const showToast = useUiStore((s) => s.showToast);

  const [name, setName] = useState('Cash');
  const [type, setType] = useState<AccountType>('cash');
  const [color, setColor] = useState(COLORS[0]!);
  const [startingBalance, setStartingBalance] = useState('0');

  useEffect(() => {
    if (data) {
      setName(data.name);
      setType(data.type as AccountType);
      setColor(data.color);
      setStartingBalance(String(data.startingBalancePaise / 100));
    }
  }, [data]);

  const onSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      showToast({ tone: 'error', text: 'Name required' });
      return;
    }
    const paise = parseToPaise(startingBalance || '0') ?? 0;
    const icon = TYPES.find((tp) => tp.key === type)?.icon ?? 'wallet';
    if (isNew) {
      await createAccount({
        name: trimmed,
        type,
        startingBalancePaise: paise,
        currency: 'INR',
        icon,
        color,
        sortOrder: 99,
        isArchived: false,
      });
    } else if (data) {
      await updateAccount(data.id, {
        name: trimmed,
        type,
        startingBalancePaise: paise,
        icon,
        color,
      });
    }
    bump();
    router.back();
  };

  const onArchive = async () => {
    if (data) {
      await archiveAccount(data.id);
      bump();
      router.back();
    }
  };

  return (
    <AppShell>
      <ScreenHeader title={isNew ? 'New account' : 'Edit account'} />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['4'] }}>
        <Input label="Name" value={name} onChangeText={setName} placeholder="HDFC, Cash, …" autoCapitalize="words" />
        <View>
          <Text variant="small" tone="muted" style={{ marginBottom: spacing['2'] }}>
            Type
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['2'] }}>
            {TYPES.map((tp) => (
              <Chip
                key={tp.key}
                label={tp.label}
                iconLeft={tp.icon}
                selected={tp.key === type}
                onPress={() => setType(tp.key)}
              />
            ))}
          </View>
        </View>
        <Input
          label="Starting balance (₹)"
          value={startingBalance}
          onChangeText={setStartingBalance}
          keyboardType="decimal-pad"
        />
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
        <Button label="Save" fullWidth size="lg" onPress={onSave} />
        {!isNew && data ? <Button label="Archive" variant="danger" fullWidth onPress={onArchive} /> : null}
      </ScrollView>
    </AppShell>
  );
}
