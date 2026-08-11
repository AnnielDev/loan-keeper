import { apiFetch } from "@/services/api";
import type { ApiSuccess, UpdateLocationPayload, User } from "@/types/auth";

export function updateLocation(payload: UpdateLocationPayload) {
  return apiFetch<ApiSuccess<User>>("/settings/location", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
