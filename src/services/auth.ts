import { apiFetch } from "@/services/api";
import type {
  ApiSuccess,
  AuthResponse,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  SignInPayload,
  SignUpPayload,
  VerifyResetCodePayload,
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

export function deleteAccount() {
  return apiFetch<{ message?: string }>("/users/me", {
    method: "DELETE",
  });
}

export function forgotPassword(payload: ForgotPasswordPayload) {
  return apiFetch<{ message?: string }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload),
    skipAuth: true,
  });
}

export function verifyResetCode(payload: VerifyResetCodePayload) {
  return apiFetch<{ message?: string }>("/auth/verify-reset-code", {
    method: "POST",
    body: JSON.stringify(payload),
    skipAuth: true,
  });
}

export function resetPassword(payload: ResetPasswordPayload) {
  return apiFetch<{ message?: string }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
    skipAuth: true,
  });
}
