import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";

type LoadMode = "initial" | "refresh" | "silent";

type UseApiResourceResult<T> = {
  data: T | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

/**
 * Fetches `fetcher()` whenever the screen gains focus (silently after the
 * first load, so returning to a tab doesn't flash a spinner over stale
 * data) and exposes a `refetch` for pull-to-refresh. Shared by every
 * screen backed by the API so they don't each reimplement this.
 */
export function useApiResource<T>(fetcher: () => Promise<T>): UseApiResourceResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  const load = useCallback(
    async (mode: LoadMode) => {
      if (mode === "initial") setIsLoading(true);
      if (mode === "refresh") setIsRefreshing(true);

      try {
        const result = await fetcher();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "unknown error");
      } finally {
        if (mode === "initial") setIsLoading(false);
        if (mode === "refresh") setIsRefreshing(false);
      }
    },
    [fetcher],
  );

  useFocusEffect(
    useCallback(() => {
      load(hasLoadedRef.current ? "silent" : "initial");
      hasLoadedRef.current = true;
    }, [load]),
  );

  return {
    data,
    isLoading,
    isRefreshing,
    error,
    refetch: () => load("refresh"),
  };
}
