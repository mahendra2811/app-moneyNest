import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import { palette } from '@/brand/colors';
import { formatINRShort } from '@/lib/money';

export type BudgetPulseWidgetProps = {
  spentPaise: number;
  budgetPaise: number;
};

export function BudgetPulseWidget({ spentPaise, budgetPaise }: BudgetPulseWidgetProps) {
  const ratio = budgetPaise > 0 ? Math.min(1, spentPaise / budgetPaise) : 0;
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
      clickAction="OPEN_BUDGETS"
    >
      <TextWidget text="BUDGET" style={{ fontSize: 10, color: palette.inkSoft }} />
      <TextWidget
        text={`${formatINRShort(spentPaise)} of ${formatINRShort(budgetPaise)}`}
        style={{ fontSize: 14, color: palette.ink, fontWeight: '600' }}
      />
      <FlexWidget
        style={{
          height: 6,
          width: 'match_parent',
          backgroundColor: palette.border,
          borderRadius: 6,
        }}
      >
        <FlexWidget
          style={{
            height: 6,
            width: `${Math.round(ratio * 100)}%` as unknown as number,
            backgroundColor: ratio > 1 ? palette.danger : palette.primary,
            borderRadius: 6,
          }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}
