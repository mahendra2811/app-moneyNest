import type { WidgetService } from './types';

// Wiring of react-native-android-widget happens in Phase 3.
// This is a no-op stub so the rest of the app can import it safely.
export const widgetService: WidgetService = {
  async refresh() {
    // intentionally empty until Phase 3
  },
};
