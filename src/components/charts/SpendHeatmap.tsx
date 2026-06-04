import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { Text } from '@/components/primitives';
import type { DailyPoint } from '@/db/queries/reports';

/**
 * Calendar heatmap — B11. Each cell = one day; shade by amount.
 */
export function SpendHeatmap({ series }: { series: DailyPoint[] }) {
  const t = useTheme();
  const max = Math.max(1, ...series.map((p) => p.spent));
  // Build a 6x7 grid for the month
  const byDay = new Map(series.map((p) => [p.day, p]));
  const days = Array.from({ length: 31 }).map((_, i) => i + 1);
  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 4,
        }}
      >
        {days.map((d) => {
          const key = series[0]?.day.slice(0, 8) + String(d).padStart(2, '0');
          const point = byDay.get(key);
          const intensity = point ? Math.min(1, point.spent / max) : 0;
          return (
            <View
              key={d}
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                backgroundColor: point
                  ? `rgba(22, 163, 74, ${0.15 + intensity * 0.75})`
                  : t.surfaceMuted,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text variant="caption" tone={point ? 'default' : 'faint'}>
                {d}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
