import { useCallback } from "react";

import { useApiResource } from "@/hooks/useApiResource";
import { getLoan } from "@/services/loans";

export function useLoanDetail(id: string) {
  const fetcher = useCallback(() => getLoan(id), [id]);
  return useApiResource(fetcher);
}
