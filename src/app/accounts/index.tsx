import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Text, IconButton, Icon, EmptyState } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { radius } from '@/brand/radius';
import { useAccounts } from '@/hooks/use-accounts';
import { useTheme } from '@/theme';
import { formatINR } from '@/lib/money';
import { useAccountBalance } from '@/hooks/use-accounts';

export default function AccountsIndex() {
  const router = useRouter();
  const t_ = useTheme();
  const { data } = useAccounts();
  return (
    <AppShell>
      <ScreenHeader
        title="Accounts"
        right={<IconButton name="plus" accessibilityLabel="Add" onPress={() => router.push('/accounts/new' as never)} />}
      />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['2'] }}>
        {(data ?? []).length === 0 ? (
          <EmptyState icon="wallet" title="No accounts" body="Add a cash account to start." />
        ) : (
          (data ?? []).map((a) => <AccountRow key={a.id} a={a} t_={t_} onPress={() => router.push(`/accounts/${a.id}` as never)} />)
        )}
      </ScrollView>
    </AppShell>
  );
}

import type { Account } from '@/db/schema';
import type { ThemeTokens } from '@/theme';

function AccountRow({ a, t_, onPress }: { a: Account; t_: ThemeTokens; onPress: () => void }) {
  const { data: balance } = useAccountBalance(a.id);
  return (
    <Pressable
      onPress={onPress}
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
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: t_.surfaceMuted,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={a.icon} size="sm" color={a.color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="bodyMed">{a.name}</Text>
        <Text variant="caption" tone="muted">
          {a.type.replace('_', ' ')}
        </Text>
      </View>
      <Text variant="bodyMed" tabular>
        {formatINR(balance ?? 0)}
      </Text>
    </Pressable>
  );
}
