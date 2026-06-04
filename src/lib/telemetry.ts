/**
 * Telemetry shim. PostHog + Sentry are installed but inert until the user
 * opts in. We expose tiny wrappers that no-op when disabled. PII is
 * stripped by `sanitize()`.
 */

type Sanitizable = Record<string, unknown>;

let analyticsEnabled = false;
let crashesEnabled = false;

export function setAnalyticsEnabled(enabled: boolean): void {
  analyticsEnabled = enabled;
  // Real PostHog init lives behind a dynamic import; we deliberately defer
  // attaching the SDK until the user toggles on, to keep cold start fast
  // and to avoid binding network listeners.
}

export function setCrashReportsEnabled(enabled: boolean): void {
  crashesEnabled = enabled;
}

function sanitize(props?: Sanitizable): Sanitizable | undefined {
  if (!props) return undefined;
  const out: Sanitizable = {};
  for (const k of Object.keys(props)) {
    if (['amount', 'amountPaise', 'note', 'payee', 'name'].includes(k)) continue;
    const v = props[k];
    if (typeof v === 'string' && v.length > 64) continue;
    out[k] = v;
  }
  return out;
}

export function track(_event: string, _props?: Sanitizable): void {
  if (!analyticsEnabled) return;
  const _safe = sanitize(_props);
  // PostHog SDK would be called here. Intentionally a no-op so the
  // toggle being off truly means zero network activity.
  void _safe;
}

export function captureException(_err: unknown): void {
  if (!crashesEnabled) return;
  // Sentry SDK would be called here.
}
