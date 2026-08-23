import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";

import { getScheduleEvents } from "@/services/schedule";
import type { ScheduleEvent } from "@/types/schedule";

type UseScheduleEventsResult = {
  data: ScheduleEvent[] | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useScheduleEvents(month: number, year: number): UseScheduleEventsResult {
  const [data, setData] = useState<ScheduleEvent[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const hasLoadedRef = useRef(false);

  const runFetch = useCallback(
    async (monthValue: number, yearValue: number, isManualRefresh: boolean) => {
      const requestId = ++requestIdRef.current;
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else if (!hasLoadedRef.current) {
        setIsLoading(true);
      }

      try {
        const result = await getScheduleEvents({ month: monthValue, year: yearValue, includePaid: true });
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
    runFetch(month, year, false);
  }, [month, year, runFetch]);

  // Silent refresh when the screen regains focus (e.g. returning from
  // elsewhere after registering a payment on another screen).
  useFocusEffect(
    useCallback(() => {
      if (hasLoadedRef.current) {
        runFetch(month, year, false);
      }
    }, [runFetch, month, year]),
  );

  return {
    data,
    isLoading,
    isRefreshing,
    error,
    refetch: () => runFetch(month, year, true),
  };
}
