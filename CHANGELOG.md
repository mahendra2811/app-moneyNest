# Changelog

All notable changes to moneyNest.

## [1.0.0] — Internal Testing

### Phase 0 — Setup
- Expo SDK 54 + React Native 0.76 + TypeScript strict scaffold
- Brand tokens (colors, typography, radius, spacing, shadows, motion, glass)
- Theme engine: light, dark, glass variants, MMKV-persisted preference, system listener
- 14 primitive components
- NativeWind v4 wired
- Drizzle ORM + expo-sqlite, ESLint + Prettier + Vitest baseline

### Phase 1 — Core CRUD
- Full schema migration applied on first launch
- Default seed (1 Cash account, 12 expense + 4 income categories)
- Onboarding (welcome / first-account / privacy)
- Home, transactions list, manual add/edit, accounts, categories
- Per-account live balance via SQL aggregation
- Soft delete + undo

### Phase 2 — Budgets, recurring, reports
- Monthly budgets with 80% / 100% alerts toggles
- Recurring engine (daily/weekly/monthly/yearly with day-of-month clamping)
- Reports tab: hero totals, category donut, daily bars, MoM, top payees
- CSV export via Storage Access Framework

### Phase 3 — Voice, widgets, notifications
- Hinglish voice parser (60+ synonyms, Hindi numerals, 45 unit tests)
- Voice add screen with live transcript and parse preview card
- 3 widget scaffolds (1×1 quick-add, 2×2 today, 4×1 budget pulse)
- Local notifications for budget alerts and backup reminders

### Phase 4 — Backup & security
- AES-256-GCM encrypted backup with PBKDF2-SHA256 (250k iters)
- Backup export + restore (replace / merge) via SAF
- Biometric app-lock screen
- Telemetry opt-in (PostHog + Sentry) wrapped behind toggles, OFF by default
- "Delete all my data" with type-to-confirm

### Phase 5 — Polish
- Glass-vs-solid audit applied across screens
- Toast migrated to GlassCard with live-region announcement
- Swipeable-row delete primitive
- Bottom tab bar a11y labels

### Phase 6 — Launch prep
- Privacy policy (DPDP-compliant) in `assets/privacy-policy.md`
- Launch checklist (`LAUNCH_CHECKLIST.md`)
- eas.json profiles for development / preview / production
