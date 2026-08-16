import { apiFetch } from "@/services/api";
import type {
  ApiSuccess,
  Currency,
  Language,
  UpdateCurrencyPayload,
  UpdateLanguagePayload,
  UpdateLocationPayload,
  User,
} from "@/types/auth";

export function updateLocation(payload: UpdateLocationPayload) {
  return apiFetch<ApiSuccess<User>>("/settings/location", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function getLanguages() {
  return apiFetch<ApiSuccess<Language[]>>("/settings/languages");
}

export function updateLanguage(payload: UpdateLanguagePayload) {
  return apiFetch<ApiSuccess<User>>("/settings/language", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function getCurrencies() {
  return apiFetch<ApiSuccess<Currency[]>>("/settings/currencies");
}

export function updateCurrency(payload: UpdateCurrencyPayload) {
  return apiFetch<ApiSuccess<User>>("/settings/currency", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
