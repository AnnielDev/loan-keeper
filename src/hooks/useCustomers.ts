import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";

import { getCustomers } from "@/services/customers";
import type { CustomerStatusFilter, CustomerSummary } from "@/types/customer";

const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE = 20;

type UseCustomersResult = {
  data: CustomerSummary[] | null;
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  loadMore: () => void;
};

export function useCustomers(
  search: string,
  status: CustomerStatusFilter,
): UseCustomersResult {
  const [data, setData] = useState<CustomerSummary[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const hasLoadedRef = useRef(false);
  const pageRef = useRef(1);

  const runFetch = useCallback(
    async (
      searchValue: string,
      statusValue: CustomerStatusFilter,
      page: number,
      isManualRefresh: boolean,
    ) => {
      const requestId = ++requestIdRef.current;
      const isLoadMore = page > 1;
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else if (isLoadMore) {
        setIsLoadingMore(true);
      } else if (!hasLoadedRef.current) {
        setIsLoading(true);
      }

      try {
        const result = await getCustomers({
          search: searchValue.trim() || undefined,
          status: statusValue,
          page,
          limit: PAGE_SIZE,
        });
        if (requestId !== requestIdRef.current) return;
        pageRef.current = page;
        setData((prev) => (isLoadMore ? [...(prev ?? []), ...result.data] : result.data));
        setHasMore(result.meta.page < result.meta.totalPages);
        setError(null);
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        setError(err instanceof Error ? err.message : "unknown error");
      } finally {
        if (requestId !== requestIdRef.current) return;
        hasLoadedRef.current = true;
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [],
  );

  useEffect(() => {
    const timeout = setTimeout(() => runFetch(search, status, 1, false), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [search, status, runFetch]);

  // Silent refresh when the screen regains focus (e.g. returning from the
  // create-customer form) — skipped on first mount since the effect above
  // already handles the initial load.
  useFocusEffect(
    useCallback(() => {
      if (hasLoadedRef.current) {
        runFetch(search, status, 1, false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [runFetch]),
  );

  return {
    data,
    isLoading,
    isRefreshing,
    isLoadingMore,
    hasMore,
    error,
    refetch: () => runFetch(search, status, 1, true),
    loadMore: () => {
      if (isLoading || isRefreshing || isLoadingMore || !hasMore) return;
      runFetch(search, status, pageRef.current + 1, false);
    },
  };
}
