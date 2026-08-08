import { apiFetch } from "@/services/api";
import type {
  ApiSuccess,
  AuthResponse,
  SignInPayload,
  SignUpPayload,
} from "@/types/auth";

export function signIn(payload: SignInPayload) {
  return apiFetch<ApiSuccess<AuthResponse>>("/auth/signin", {
    method: "POST",
    body: JSON.stringify(payload),
    skipAuth: true,
  });
}

export function signUp(payload: SignUpPayload) {
  return apiFetch<{ message?: string }>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
    skipAuth: true,
  });
}

export function logout() {
  return apiFetch<{ message?: string }>("/auth/logout", {
    method: "POST",
    skipRefresh: true,
  });
}
