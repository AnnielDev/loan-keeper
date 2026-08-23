import { useCallback } from "react";

import { useApiResource } from "@/hooks/useApiResource";
import { getPaymentDetail } from "@/services/loans";

export function usePaymentDetail(loanId: string, installmentId: string) {
  const fetcher = useCallback(() => getPaymentDetail(loanId, installmentId), [loanId, installmentId]);
  return useApiResource(fetcher);
}
