import { apiFetch } from "@/services/api";
import type { AuthResponse, SignInPayload, SignUpPayload } from "@/types/auth";

export function signIn(payload: SignInPayload) {
  return apiFetch<AuthResponse>("/auth/signin", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function signUp(payload: SignUpPayload) {
  return apiFetch<AuthResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
