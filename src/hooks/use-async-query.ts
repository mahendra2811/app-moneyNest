import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Tiny async-query hook. Reruns `fn` when any item in `deps` changes.
 * Returns { data, loading, error, refetch }.
 */
export function useAsyncQuery<T>(
  fn: () => Promise<T>,
  deps: ReadonlyArray<unknown>,
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fnRef.current();
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    run();
  }, deps);

  return { data, loading, error, refetch: run };
}
