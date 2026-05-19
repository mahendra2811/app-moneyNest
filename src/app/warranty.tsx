/**
 * NEW-44 — warranty tracking (sub-view of the vault).
 */
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card, Text, Button, EmptyState, Icon } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { listDocs, type VaultDoc } from '@/lib/documents';
import dayjs from 'dayjs';

export default function Warranty() {
  const router = useRouter();
  const [docs, setDocs] = useState<VaultDoc[]>([]);
  useEffect(() => { listDocs().then((all) => setDocs(all.filter((d) => d.category === 'warranty'))); }, []);

  const sorted = docs
    .filter((d) => d.expiresAt)
    .sort((a, b) => (a.expiresAt! < b.expiresAt! ? -1 : 1));

  return (
    <AppShell>
      <ScreenHeader title="Warranties" />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['3'] }}>
        {sorted.length === 0 ? (
          <>
            <EmptyState icon="shield" title="No warranties tracked" body="Add a receipt or warranty card to the vault with an expiry date." />
            <Button label="Open vault" onPress={() => router.push('/vault' as never)} />
          </>
        ) : (
          sorted.map((d) => {
            const days = dayjs(d.expiresAt).diff(dayjs(), 'day');
            const expiringSoon = days <= 30 && days >= 0;
            const expired = days < 0;
            return (
              <Card key={d.id}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['3'] }}>
                  <Icon name="shield" tone={expired ? 'expense' : expiringSoon ? 'muted' : 'accent'} />
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyMed">{d.name}</Text>
                    <Text variant="caption" tone={expired ? 'expense' : 'muted'}>
                      {expired ? `Expired ${-days} days ago` : `${days} days left`} · {d.expiresAt!.slice(0, 10)}
                    </Text>
                  </View>
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>
    </AppShell>
  );
}
