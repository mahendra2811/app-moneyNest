import React from 'react';
import { View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { useTheme } from '@/theme/useTheme';
import { Text } from '@/components/primitives';
import { formatINRShort } from '@/lib/money';
import { db } from '@/db/client';
import { sql } from 'drizzle-orm';

/**
 * Income source pie — B13. Sibling of CategoryDonut for income.
 */
export type IncomeRow = { categoryId: string | null; categoryName: string | null; categoryColor: string | null; totalPaise: number };

export function IncomePie({ data }: { data: IncomeRow[] }) {
  const t = useTheme();
  const total = data.reduce((s, r) => s + r.totalPaise, 0);
  if (total === 0) {
    return <Text variant="small" tone="muted" style={{ textAlign: 'center' }}>No income</Text>;
  }
  const slices = data.map((r) => ({
    value: r.totalPaise,
    color: r.categoryColor ?? t.accent,
    text: r.categoryName ?? '—',
  }));
  return (
    <View style={{ alignItems: 'center' }}>
      <PieChart
        data={slices}
        donut
        radius={80}
        innerRadius={50}
        innerCircleColor={t.surface}
        centerLabelComponent={() => (
          <View style={{ alignItems: 'center' }}>
            <Text variant="caption" tone="muted">
              IN
            </Text>
            <Text variant="bodyMed" tabular>
              {formatINRShort(total)}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

export async function getMonthIncomeByCategory(monthStart: string, monthEnd: string): Promise<IncomeRow[]> {
  const rows = await db.all<IncomeRow>(sql`
    SELECT t.category_id AS categoryId, c.name AS categoryName, c.color AS categoryColor,
           COALESCE(SUM(t.amount_paise), 0) AS totalPaise
    FROM transactions t
    LEFT JOIN categories c ON c.id = t.category_id
    WHERE t.type = 'income' AND t.deleted_at IS NULL
      AND t.occurred_at BETWEEN ${monthStart} AND ${monthEnd}
    GROUP BY t.category_id
    ORDER BY totalPaise DESC
  `);
  return rows;
}
