# moneyNest — Launch Checklist (Phase 6)

A condensed sign-off list. The code is ready; everything below requires
human action (Expo/EAS account, Play Console, device, asset generation).

## Identity

- [ ] Decide final published name (see `prompts/15_RESEARCH_NAMING.md`)
- [ ] Update `.env.local` with final `EXPO_PUBLIC_APP_NAME` and
      `EXPO_PUBLIC_PACKAGE_ID`
- [ ] Reserve package id `com.pooniya.moneynest` (or your choice) on
      Play Console
- [ ] Final brand color in `EXPO_PUBLIC_PRIMARY_HEX` if changing

## Assets (in `assets/`)

- [ ] `icon.png` (1024×1024, 32-bit PNG with alpha)
- [ ] `adaptive-icon.png` (1024×1024 foreground for Android adaptive icon)
- [ ] `splash.png` (1242×2436)
- [ ] Feature graphic 1024×500 (uploaded to Play Console, not in repo)
- [ ] 6 phone screenshots 1080×1920 — home, voice, transactions list,
      reports, budgets, settings/privacy

Generate via a clean device run in a demo state — see `prompts/13_PHASE_6_LAUNCH.md`
for the exact shot list.

## Privacy policy

- [ ] Host `assets/privacy-policy.md` (rendered to HTML) at
      `https://pooniya.com/moneynest-privacy` (or final URL)
- [ ] Confirm URL returns 200 and shows the policy content
- [ ] Update `.env.local`'s `EXPO_PUBLIC_PRIVACY_URL` to match

## EAS Build

```bash
pnpm exec eas login
pnpm exec eas init                           # links Expo project id
pnpm exec eas build --profile production --platform android
```

- [ ] AAB build succeeds
- [ ] AAB size under 30MB
- [ ] Sideload the AAB and verify: voice flow, manual add, budget alert,
      backup export → wipe → restore, biometric lock, delete all data
- [ ] No crashes in Hermes logs during the above flows

## Play Console

- [ ] Create app with final name + package id + English (India) default
- [ ] App content: Privacy policy URL, Ads: No, App access: All
      functionality available without restriction, Content rating:
      Everyone, Target audience: 18+, Data safety: declare opt-in
      analytics + crash reports only when toggled on
- [ ] Upload feature graphic + 6 screenshots + short description (≤80)
      + full description (template in `prompts/13_PHASE_6_LAUNCH.md`)

## Internal testing track

```bash
pnpm exec eas submit --platform android      # uploads to internal track
```

- [ ] Submit production AAB to Internal Testing
- [ ] Invite 5+ testers via email list / Google Group
- [ ] Distribute test plan (9 steps, in `prompts/13_PHASE_6_LAUNCH.md`)
- [ ] Wait 7 days; collect feedback in support inbox

## Sign-off before promoting to Closed/Production

- [ ] No P1 bugs reported in 7 days
- [ ] Pre-launch report on Play Console passes (no policy violations,
      no critical accessibility, no crashes on any of the 5 Firebase
      Test Lab device configs)
- [ ] Privacy policy URL still live
- [ ] Average tester rating ≥ 4

After sign-off: promote from Internal → Closed → Production.

## Versioning

- `app.config.ts` carries `version: '1.0.0'`. Bump for each release:
  - Patch (1.0.1) for bug fixes
  - Minor (1.1.0) for additive features
  - Major (2.0.0) for breaking schema changes
- `eas.json` has `autoIncrement: true` for the production profile so
  Android versionCode auto-increments.
