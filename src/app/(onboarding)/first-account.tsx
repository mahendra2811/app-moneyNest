import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { GlassCard, Text, Input, Button, Chip } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { t } from '@/copy';
import { useAccounts } from '@/hooks/use-accounts';
import { updateAccount, createAccount } from '@/db/queries/accounts';
import { useInvalidateStore } from '@/stores/invalidate';
import type { AccountType } from '@/types/domain';

const TYPES: { key: AccountType; label: string; icon: string }[] = [
  { key: 'cash', label: 'Cash', icon: 'wallet' },
  { key: 'bank', label: 'Bank', icon: 'landmark' },
  { key: 'upi', label: 'UPI', icon: 'qr-code' },
  { key: 'wallet', label: 'Wallet', icon: 'credit-card' },
  { key: 'credit_card', label: 'Credit card', icon: 'credit-card' },
];

const COLORS = ['#16A34A', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6'];

export default function FirstAccount() {
  const router = useRouter();
  const { data: accounts } = useAccounts();
  const seeded = accounts?.[0];
  const [name, setName] = useState(seeded?.name ?? 'Cash');
  const [type, setType] = useState<AccountType>((seeded?.type as AccountType) ?? 'cash');
  const [color, setColor] = useState(seeded?.color ?? COLORS[0]!);
  const bumpAccounts = useInvalidateStore((s) => s.bumpAccounts);

  const onContinue = async () => {
    if (seeded) {
      await updateAccount(seeded.id, { name: name.trim() || 'Cash', type, color });
    } else {
      await createAccount({
        name: name.trim() || 'Cash',
        type,
        startingBalancePaise: 0,
        currency: 'INR',
        icon: TYPES.find((tp) => tp.key === type)?.icon ?? 'wallet',
        color,
        sortOrder: 0,
        isArchived: false,
      });
    }
    bumpAccounts();
    router.push('/(onboarding)/privacy');
  };

  return (
    <AppShell>
      <ScreenHeader title={t('onboarding.accountTitle')} />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['4'] }}>
        <Text variant="body" tone="muted">
          {t('onboarding.accountBody')}
        </Text>
        <GlassCard intensity="medium" radius="lg">
          <View style={{ gap: spacing['4'] }}>
            <Input
              label="Name"
              value={name}
              onChangeText={setName}
              placeholder={t('onboarding.accountNamePlaceholder')}
              autoCapitalize="words"
            />
            <View>
              <Text variant="small" tone="muted" style={{ marginBottom: spacing['2'] }}>
                {t('onboarding.accountTypeLabel')}
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
            <View>
              <Text variant="small" tone="muted" style={{ marginBottom: spacing['2'] }}>
                Color
              </Text>
              <View style={{ flexDirection: 'row', gap: spacing['3'] }}>
                {COLORS.map((c) => (
                  <ColorSwatch key={c} color={c} selected={c === color} onPress={() => setColor(c)} />
                ))}
              </View>
            </View>
          </View>
        </GlassCard>
        <Button label={t('common.continue')} size="lg" fullWidth onPress={onContinue} />
      </ScrollView>
    </AppShell>
  );
}

import { Pressable } from 'react-native';
import { radius } from '@/brand/radius';

function ColorSwatch({
  color,
  selected,
  onPress,
}: {
  color: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={`color ${color}`}
      style={({ pressed }) => ({
        width: 32,
        height: 32,
        borderRadius: radius.full,
        backgroundColor: color,
        borderColor: selected ? '#0F172A' : 'transparent',
        borderWidth: 2,
        opacity: pressed ? 0.7 : 1,
      })}
    />
  );
}
