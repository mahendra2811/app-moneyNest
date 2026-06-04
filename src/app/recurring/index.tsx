import React from 'react';
import { ScrollView, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Text, IconButton, EmptyState, Icon, Skeleton } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { radius } from '@/brand/radius';
import { useTheme } from '@/theme';
import { useRecurring } from '@/hooks/use-recurring';
import { pauseRecurring, resumeRecurring } from '@/db/queries/recurring';
import { useInvalidateStore } from '@/stores/invalidate';
import { formatRelativeDay } from '@/lib/date';
import { formatINR } from '@/lib/money';
import { t } from '@/copy';

export default function RecurringIndex() {
  const router = useRouter();
  const t_ = useTheme();
  const { data, loading } = useRecurring({ includeInactive: true });
  const bump = useInvalidateStore((s) => s.bumpRecurring);

  return (
    <AppShell>
      <ScreenHeader
        title={t('recurring.title')}
        right={<IconButton name="plus" accessibilityLabel="Add recurring" onPress={() => router.push('/recurring/new' as never)} />}
      />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['2'] }}>
        {loading ? (
          <Skeleton height={120} />
        ) : (data ?? []).length === 0 ? (
          <EmptyState icon="repeat" title={t('recurring.empty')} body={t('emptyStates.recurringBody')} />
        ) : (
          (data ?? []).map((r) => {
            const tpl = safeParseTemplate(r.templateJson);
            return (
              <Pressable
                key={r.id}
                onPress={() => router.push(`/recurring/${r.id}` as never)}
                style={({ pressed }) => ({
                  backgroundColor: t_.surface,
                  borderColor: t_.border,
                  borderWidth: 1,
                  borderRadius: radius.lg,
                  padding: spacing['4'],
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing['3'],
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
                  <Icon name="repeat" size="sm" tone="accent" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyMed">
                    {tpl ? formatINR(tpl.amountPaise) : '—'} · {r.frequency}
                  </Text>
                  <Text variant="caption" tone="muted">
                    Next: {formatRelativeDay(r.nextRunAt)}
                  </Text>
                </View>
                <Pressable
                  onPress={async () => {
                    if (r.isActive) await pauseRecurring(r.id);
                    else await resumeRecurring(r.id);
                    bump();
                  }}
                  hitSlop={8}
                >
                  <Icon name={r.isActive ? 'pause' : 'play'} size="sm" tone="muted" />
                </Pressable>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </AppShell>
  );
}

function safeParseTemplate(json: string): { amountPaise: number } | null {
  try {
    const parsed = JSON.parse(json) as { amountPaise?: number };
    if (typeof parsed.amountPaise === 'number') return { amountPaise: parsed.amountPaise };
    return null;
  } catch {
    return null;
  }
}
