import { apiFetch } from "@/services/api";
import type { ScheduleEvent } from "@/types/schedule";

export function getScheduleEvents(params: { month: number; year: number; includePaid?: boolean }) {
  const query = new URLSearchParams({
    month: String(params.month),
    year: String(params.year),
  });
  if (params.includePaid) query.set("includePaid", "true");

  return apiFetch<ScheduleEvent[]>(`/schedule/events?${query.toString()}`);
}
