# `src/brand/`

The brand source of truth. Every color, font size, spacing value, radius,
animation timing, glass token, and the app name itself live here.

## Rules

1. **Never hardcode brand values anywhere else.** No hex codes in screens,
   no font sizes in components, no spacing magic numbers outside this folder.
2. **Screens use semantic tokens via `useTheme()`**, not raw palette.
3. **Raw palette is exported** for use by `tailwind.config.js` and the
   theme engine only.
4. **Rename the app** by editing `.env.local` — the brand name reads from env.
5. **Change the primary color** by editing `colors.ts` only. NativeWind picks
   it up via `tailwind.config.js`.

## Files

- `colors.ts` — raw palette
- `typography.ts` — font families, weights, type scale
- `radius.ts` — border-radius scale
- `spacing.ts` — 4pt spacing grid
- `shadows.ts` — elevation tokens
- `motion.ts` — animation timings + easings
- `glass.ts` — Liquid Glass tokens (blur, tint, refraction, etc.)
- `icons.ts` — lucide size + stroke-width
- `name.ts` — env-derived brand strings (app name, tagline, support email)
- `index.ts` — barrel export
