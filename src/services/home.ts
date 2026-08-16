import { apiFetch } from "@/services/api";
import type { DashboardResponse } from "@/types/dashboard";

export function getDashboard() {
  return apiFetch<DashboardResponse>("/dashboard");
}
