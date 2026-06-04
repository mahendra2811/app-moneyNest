/**
 * Plugin API — I5.
 *
 * Sandbox-design only; not yet implemented. The contract: a plugin is a
 * JS bundle that exports `onTransactionCreated(tx)` and runs in a tightly
 * scoped V8 isolate. Because that means executing third-party JS on the
 * user's device, V1 ships the type contract but no executor.
 *
 * When implementing, pick one of:
 *   - JavaScriptCore via react-native-jsi-quickjs (sandbox)
 *   - Quickjs-emscripten WASM (fully isolated; slower)
 *
 * Storage: plugin manifest in settings, code blobs in app sandbox.
 */
import type { Transaction } from '@/db/schema';

export type PluginHooks = {
  onTransactionCreated?: (tx: Transaction) => Promise<void>;
  onMonthlyClose?: (monthIso: string) => Promise<void>;
};

export type PluginManifest = {
  id: string;
  name: string;
  version: string;
  author: string;
  permissions: ('read_transactions' | 'create_transaction' | 'notify')[];
};

// Intentionally a no-op for V1.
export async function dispatch(_event: keyof PluginHooks, _payload: unknown): Promise<void> {
  return;
}
