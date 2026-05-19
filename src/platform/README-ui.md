# F1-F3, F11 — UI port and platform-extension notes

These features are scaffolded but require native work that the Expo
plugin system cannot do declaratively.

## F1 — iOS port

The architecture is already iOS-portable per `01_CLAUDE.md`:
- Platform-specific code lives in `src/platform/*.android.ts` /
  `*.ios.ts`. iOS files are present and either throw or call shared impls.
- `voiceService` on iOS needs `expo-speech-recognition` or
  `SFSpeechRecognizer` via a custom config plugin.
- `widgetService` on iOS needs WidgetKit (Swift) — not portable from RN.
- `filesystemService` works on iOS as-is via `expo-document-picker` +
  `expo-sharing`.

Switching `voice/index.ts` to load `voice.ios.ts` when `Platform.OS === 'ios'`
is the only platform branch in the codebase (and it lives in `src/platform/`,
which is the allowed place per the brief).

## F2 — Tablet layout

Add a single conditional in `src/app/_layout.tsx`:

```tsx
import { useWindowDimensions } from 'react-native';
const { width } = useWindowDimensions();
const isTablet = width >= 768;
```

Pass `isTablet` down via context; key screens render a two-pane layout
(list + detail) when true. The patterns are local; no plugin needed.

## F3 — Foldable layout

Galaxy Fold reports two configurations via `Dimensions` events. Subscribe
in the root layout:

```tsx
Dimensions.addEventListener('change', ({ window }) => { /* adapt */ });
```

Treat the "unfolded" config the same as F2 (tablet).

## F11 — AOD (Always-On Display)

Android 13+ supports Quick Settings tiles and active widgets that the
AOD can render. Use the existing `BudgetPulseWidget` configured with
`previewLayout` and `description` so the system can show it.

## F19 — One-handed mode

When `prefs.oneHandedMode === true`, the app shell pads the top so the
content lives in the bottom 70% of the screen. Already wired via
`getUiPrefs().oneHandedMode` and consumed by the screen's outer View.
