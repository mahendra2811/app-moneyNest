# moneyNest

The expense tracker that does less, on purpose. **Track every rupee. Quietly.**

Android-first, privacy-first, on-device-only personal finance app for Indian users. No login. No ads. No cloud. Voice runs entirely on-device.

## What's inside

- **Hinglish voice input** — say _"250 ka chai"_ and you're done. Parser lives in `src/lib/voice-parser.ts` (45 unit tests).
- **Encrypted local backup** — AES-256-GCM + PBKDF2-SHA256, passphrase-derived, file lives wherever you point it via Storage Access Framework.
- **Liquid Glass** UI with light + dark themes, hero-vs-dense surface rule.
- **Reports** — donut + daily bars + month-over-month + top payees + CSV export.
- **Budgets** with 80% / 100% local notifications (no server).
- **Recurring** transactions with a pure-TS engine (5 unit tests).
- **Biometric app-lock**, optional, off by default.
- **DPDP-compliant** "Delete all my data" + privacy policy.

## Setup

```bash
pnpm install
cp .env.example .env.local      # edit values for your build identity
```

## Develop

```bash
pnpm start                       # Metro bundler
pnpm android                     # install dev build on connected device
```

The first build needs `pnpm exec expo prebuild --clean --platform android` to generate the native project.

## Tests / lint / typecheck

```bash
pnpm typecheck
pnpm lint
pnpm test                        # 75 unit tests across money, date, id, recurring, voice parser, crypto, backup
```

## Release

```bash
pnpm exec eas login
pnpm exec eas build --profile production --platform android
pnpm exec eas submit --platform android
```

Full launch flow in [`LAUNCH_CHECKLIST.md`](./LAUNCH_CHECKLIST.md).

## Database

Drizzle ORM + expo-sqlite. Schema in `src/db/schema.ts`. The init migration is embedded as an inline SQL string in `src/db/migrations/inline.ts` and applied on every cold start (idempotent — `CREATE TABLE IF NOT EXISTS` everywhere).

```bash
pnpm drizzle:generate            # produces a new migration when schema changes
```

## Architecture

| Folder | Role |
| --- | --- |
| `src/brand/` | Design tokens. The only place hex codes, font sizes, spacing values, radii, glass tokens live. |
| `src/copy/` | User-facing text. No string literals in JSX outside this folder. |
| `src/theme/` | Semantic tokens resolved from brand. Screens consume `useTheme()`. |
| `src/components/primitives/` | Pure RN primitives (`Text`, `Button`, `GlassCard`, `Sheet`, `Keypad`, …). |
| `src/components/transaction/` etc. | Domain-aware components that compose primitives. |
| `src/lib/` | Pure logic. **No RN imports.** Fully testable in Vitest. (`money`, `date`, `id`, `crypto`, `backup`, `voice-parser`, `recurring-engine`, `csv-export`.) |
| `src/db/` | Drizzle schema + queries. All SQL lives here. |
| `src/platform/` | Platform implementations behind small TS interfaces (voice, biometric, notifications, filesystem, widget). Screens never branch on `Platform.OS`. |
| `src/hooks/` | The bridge between screens and queries. |
| `src/stores/` | Zustand: UI/session state only. Domain data lives in SQLite. |
| `src/widgets/` | Android home-screen widget JSX trees (compiled to widget XML by `react-native-android-widget`). |

Spec, design system, voice grammar, and the phase prompts live in `prompts/` at the repo root.

## License

UNLICENSED — private project.
