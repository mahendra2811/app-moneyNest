/**
 * Home-screen widgets — react-native-android-widget JSX trees.
 *
 * IMPORTANT: react-native-android-widget compiles these into Android widget
 * XML at build time via a Metro transformer. They are NOT regular RN
 * components — they only render inside the widget host. We scaffold them
 * here so the registration in `WidgetTaskHandler` is ready; the registration
 * itself happens after `pnpm prebuild --clean` adds the native code.
 *
 * After prebuild, register in `app.config.ts` via the plugin and link the
 * provider in `android/app/src/main/AndroidManifest.xml` (the plugin does
 * this automatically when configured).
 */
import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import { palette } from '@/brand/colors';
import { brand } from '@/brand/name';

export type QuickAddWidgetProps = { spentTodayPaise?: number };

export function QuickAddWidget(_props: QuickAddWidgetProps) {
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: palette.primary,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      clickAction="OPEN_NEW_TXN"
    >
      <TextWidget text="+" style={{ fontSize: 32, color: palette.white }} />
      <TextWidget text={brand.name} style={{ fontSize: 10, color: palette.white }} />
    </FlexWidget>
  );
}
