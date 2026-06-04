/**
 * Registry of widget components. Wired into the native widget provider
 * via the `react-native-android-widget` Expo plugin after `pnpm prebuild`.
 *
 * Click actions (`OPEN_NEW_TXN`, `OPEN_HOME`, `OPEN_BUDGETS`) are handled
 * by an Android Activity that opens deep links. Configure in:
 *   android/app/src/main/AndroidManifest.xml (auto-managed by the plugin)
 */
export const WIDGET_NAMES = ['QuickAdd', 'Today', 'BudgetPulse'] as const;
export type WidgetName = (typeof WIDGET_NAMES)[number];

export const WIDGET_SIZES: Record<WidgetName, { minWidth: number; minHeight: number; targetCellWidth?: number; targetCellHeight?: number }> = {
  QuickAdd: { minWidth: 60, minHeight: 60, targetCellWidth: 1, targetCellHeight: 1 },
  Today: { minWidth: 140, minHeight: 140, targetCellWidth: 2, targetCellHeight: 2 },
  BudgetPulse: { minWidth: 280, minHeight: 70, targetCellWidth: 4, targetCellHeight: 1 },
};
