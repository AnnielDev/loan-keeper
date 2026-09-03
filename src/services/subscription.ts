import { apiFetch } from "@/services/api";
import type {
  ApiSuccess,
  SubscriptionStatusResponse,
  User,
  VerifyPurchasePayload,
} from "@/types/auth";

export function getSubscriptionStatus() {
  return apiFetch<ApiSuccess<SubscriptionStatusResponse>>("/subscriptions/status");
}

export function verifyPurchase(payload: VerifyPurchasePayload) {
  return apiFetch<ApiSuccess<User>>("/subscriptions/verify-purchase", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
