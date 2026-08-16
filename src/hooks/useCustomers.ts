import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";

import { getCustomers } from "@/services/customers";
import type { CustomerStatusFilter, CustomerSummary } from "@/types/customer";

const SEARCH_DEBOUNCE_MS = 300;

type UseCustomersResult = {
  data: CustomerSummary[] | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useCustomers(
  search: string,
  status: CustomerStatusFilter,
): UseCustomersResult {
  const [data, setData] = useState<CustomerSummary[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const hasLoadedRef = useRef(false);

  const runFetch = useCallback(
    async (searchValue: string, statusValue: CustomerStatusFilter, isManualRefresh: boolean) => {
      const requestId = ++requestIdRef.current;
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else if (!hasLoadedRef.current) {
        setIsLoading(true);
      }

      try {
        const result = await getCustomers({
          search: searchValue.trim() || undefined,
          status: statusValue,
        });
        if (requestId !== requestIdRef.current) return;
        setData(result);
        setError(null);
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        setError(err instanceof Error ? err.message : "unknown error");
      } finally {
        if (requestId !== requestIdRef.current) return;
        hasLoadedRef.current = true;
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    const timeout = setTimeout(() => runFetch(search, status, false), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [search, status, runFetch]);

  // Silent refresh when the screen regains focus (e.g. returning from the
  // create-customer form) — skipped on first mount since the effect above
  // already handles the initial load.
  useFocusEffect(
    useCallback(() => {
      if (hasLoadedRef.current) {
        runFetch(search, status, false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [runFetch]),
  );

  return {
    data,
    isLoading,
    isRefreshing,
    error,
    refetch: () => runFetch(search, status, true),
  };
}
