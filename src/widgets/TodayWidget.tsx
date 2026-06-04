import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import { palette } from '@/brand/colors';
import { formatINRShort } from '@/lib/money';

export type TodayWidgetProps = {
  spentPaise: number;
  topCategory?: string | null;
  topCategoryPaise?: number;
};

export function TodayWidget({ spentPaise, topCategory, topCategoryPaise = 0 }: TodayWidgetProps) {
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: palette.surface,
        borderRadius: 24,
        padding: 16,
        flexGap: 6,
      }}
      clickAction="OPEN_HOME"
    >
      <TextWidget text="TODAY" style={{ fontSize: 10, color: palette.inkSoft }} />
      <TextWidget text={formatINRShort(spentPaise)} style={{ fontSize: 22, color: palette.ink, fontWeight: '700' }} />
      {topCategory ? (
        <TextWidget
          text={`${topCategory} · ${formatINRShort(topCategoryPaise)}`}
          style={{ fontSize: 12, color: palette.inkSoft }}
        />
      ) : null}
    </FlexWidget>
  );
}
