import { useCallback } from "react";

import { useApiResource } from "@/hooks/useApiResource";
import { getCustomerDetail } from "@/services/customers";

export function useCustomerDetail(id: string) {
  const fetcher = useCallback(() => getCustomerDetail(id), [id]);
  return useApiResource(fetcher);
}
