# `src/platform/`

Platform-specific implementations live behind small TS interfaces. The rest
of the app imports from `index.ts`, which re-exports the active impl.

## Pattern

For each capability (voice, widget, filesystem, biometric, notifications):

```
voice/
  types.ts                # the interface — VoiceService
  voice.android.ts        # Android impl (real)
  voice.ios.ts            # iOS impl (stub in V1 — throws "not implemented")
  index.ts                # re-exports the active impl based on RN Platform
```

The decision of which file to load is made **only** in `index.ts` (via
RN's platform-extension `.android.ts` / `.ios.ts` resolution where
possible). Screens never see this.

## Adding a new capability

1. Define the TS interface in `types.ts`.
2. Add `*.android.ts` with the real implementation.
3. Add `*.ios.ts` that throws so missing impls are loud.
4. Re-export from `index.ts`.

## Why

Keeps `Platform.OS` checks out of the rest of the codebase. Porting to iOS
later is "implement the `*.ios.ts` files" — not "rewrite the screens".
