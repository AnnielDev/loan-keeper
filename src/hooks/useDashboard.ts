import { useApiResource } from "@/hooks/useApiResource";
import { getDashboard } from "@/services/home";

export function useDashboard() {
  return useApiResource(getDashboard);
}
