import React from 'react';
import { ScrollView, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card, Text, Icon } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { useTheme } from '@/theme';

type Item = { href: string; icon: string; title: string; sub: string };

const ITEMS: Item[] = [
  { href: '/goals', icon: 'target', title: 'Goals', sub: 'Save for a laptop, a trip, anything' },
  { href: '/net-worth', icon: 'trending-up', title: 'Net worth', sub: 'Accounts + investments − loans' },
  { href: '/subscriptions', icon: 'repeat', title: 'Subscriptions', sub: 'Monthly burn at a glance' },
  { href: '/debts', icon: 'users', title: 'Debts', sub: 'Money lent / owed' },
  { href: '/insurance', icon: 'shield', title: 'Insurance', sub: 'Premium renewals' },
  { href: '/tax/itr', icon: 'file-text', title: 'ITR helper', sub: 'Totals by tax section' },
  { href: '/rent-receipt', icon: 'home', title: 'Rent receipt', sub: 'HRA proof PDF/HTML' },
];

export default function FinanceHub() {
  const router = useRouter();
  const t = useTheme();
  return (
    <AppShell>
      <ScreenHeader title="Finance" />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['3'] }}>
        {ITEMS.map((it) => (
          <Pressable key={it.href} onPress={() => router.push(it.href as never)}>
            <Card>
              <View style={{ flexDirection: 'row', gap: spacing['3'], alignItems: 'center' }}>
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
                  <Icon name={it.icon} size="sm" tone="accent" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyMed">{it.title}</Text>
                  <Text variant="caption" tone="muted">
                    {it.sub}
                  </Text>
                </View>
                <Icon name="chevron-right" size="sm" tone="muted" />
              </View>
            </Card>
          </Pressable>
        ))}
      </ScrollView>
    </AppShell>
  );
}
