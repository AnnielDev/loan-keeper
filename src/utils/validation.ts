import { EMAIL_REGEX, PASSWORD_REGEX } from "@/utils/regex";

export type ValidationRule<T = string> = (value: T) => string | null;

export const required =
  (messageKey = "validation.required"): ValidationRule<string> =>
  (value) =>
    value.trim().length === 0 ? messageKey : null;

export const pattern =
  (regex: RegExp, messageKey: string): ValidationRule<string> =>
  (value) =>
    regex.test(value.trim()) ? null : messageKey;

export const minLength =
  (length: number, messageKey = "validation.minLength"): ValidationRule<string> =>
  (value) =>
    value.length >= length ? null : messageKey;

export const email = (messageKey = "validation.invalidEmail") =>
  pattern(EMAIL_REGEX, messageKey);

export const strongPassword = (messageKey = "validation.passwordWeak") =>
  pattern(PASSWORD_REGEX, messageKey);

export function validateField<T>(
  value: T,
  rules: ValidationRule<T>[],
): string | null {
  for (const rule of rules) {
    const error = rule(value);
    if (error) return error;
  }
  return null;
}
