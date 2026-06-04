/**
 * NEW-28 — calendar grid of transactions.
 */
import React, { useEffect, useState } from 'react';
import { ScrollView, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card, Text } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { db } from '@/db/client';
import { sql } from 'drizzle-orm';
import { startOfMonthLocal, endOfMonthLocal, monthLabel, addMonths } from '@/lib/date';
import { formatINR } from '@/lib/money';
import { useTheme } from '@/theme';

type DayRow = { day: string; total: number; count: number };

export default function CalendarView() {
  const t = useTheme();
  const router = useRouter();
  const [monthRef, setMonthRef] = useState<string>(new Date().toISOString());
  const [days, setDays] = useState<DayRow[]>([]);

  useEffect(() => {
    (async () => {
      const start = startOfMonthLocal(monthRef);
      const end = endOfMonthLocal(monthRef);
      const rows = await db.all<DayRow>(sql`
        SELECT SUBSTR(occurred_at, 1, 10) AS day, SUM(amount_paise) AS total, COUNT(*) AS count
        FROM transactions
        WHERE type = 'expense' AND deleted_at IS NULL
          AND occurred_at BETWEEN ${start} AND ${end}
        GROUP BY day
      `);
      setDays(rows);
    })();
  }, [monthRef]);

  const max = Math.max(1, ...days.map((d) => d.total));
  const byDay = new Map(days.map((d) => [d.day, d]));
  const cells = Array.from({ length: 31 }).map((_, i) => i + 1);

  return (
    <AppShell>
      <ScreenHeader title={monthLabel(monthRef)} />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['4'] }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Pressable onPress={() => setMonthRef(addMonths(monthRef, -1))}>
            <Text variant="bodyMed" tone="accent">‹ Prev</Text>
          </Pressable>
          <Pressable onPress={() => setMonthRef(addMonths(monthRef, 1))}>
            <Text variant="bodyMed" tone="accent">Next ›</Text>
          </Pressable>
        </View>
        <Card>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'flex-start' }}>
            {cells.map((d) => {
              const day = monthRef.slice(0, 8) + String(d).padStart(2, '0');
              const row = byDay.get(day);
              const intensity = row ? Math.min(1, row.total / max) : 0;
              return (
                <Pressable
                  key={d}
                  onPress={() => {
                    if (row) router.push(`/transactions?day=${day}` as never);
                  }}
                  style={{
                    width: 42,
                    height: 56,
                    borderRadius: 8,
                    backgroundColor: row ? `rgba(22,163,74,${0.15 + intensity * 0.75})` : t.surfaceMuted,
                    padding: 4,
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text variant="caption" tone={row ? 'default' : 'faint'}>{d}</Text>
                  {row ? <Text variant="caption" tabular style={{ fontSize: 8 }}>{formatINR(row.total).replace('₹', '')}</Text> : null}
                </Pressable>
              );
            })}
          </View>
        </Card>
      </ScrollView>
    </AppShell>
  );
}
