# moneyNest

The expense tracker that does less, on purpose. Track every rupee. Quietly.

Android-first, privacy-first, on-device-only personal finance app for Indian users.

## Setup

```bash
pnpm install
cp .env.example .env.local
```

Edit `.env.local` to set app name/package/colors before building.

## Develop

```bash
pnpm start              # start Metro
pnpm android            # build + install dev client
```

## Build

```bash
pnpm prebuild           # regenerate android/ from app.config.ts
pnpm build:dev          # EAS development build (Android)
pnpm build:prod         # EAS production AAB
```

## Test

```bash
pnpm typecheck
pnpm lint
pnpm test
```

## Database

Drizzle ORM + expo-sqlite. Migrations live in `src/db/migrations/`.

```bash
pnpm drizzle:generate   # generate migration from schema diff
```

## Structure

See `prompts/03_FOLDER_STRUCTURE.md` for the canonical layout.

- `src/brand/` — design tokens (only place hex/spacing/typography live)
- `src/copy/` — user-facing text (no string literals in JSX)
- `src/theme/` — semantic tokens resolved from brand
- `src/components/primitives/` — pure UI primitives
- `src/lib/` — pure logic, no RN imports, Vitest-tested
- `src/db/` — Drizzle schema + queries
- `src/platform/` — platform-specific implementations behind interfaces

## License

UNLICENSED — private project.
