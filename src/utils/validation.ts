import { EMAIL_REGEX, PASSWORD_REGEX } from "@/utils/regex";

export type ValidationRule<T = string> = (value: T) => string | null;

// RFC 5321 practical email cap / reasonable UI caps to stop unbounded input.
export const MAX_EMAIL_LENGTH = 254;
export const MAX_PASSWORD_LENGTH = 128;
export const MAX_NAME_LENGTH = 120;

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

export const maxLength =
  (length: number, messageKey = "validation.maxLength"): ValidationRule<string> =>
  (value) =>
    value.length <= length ? null : messageKey;

export const email = (messageKey = "validation.invalidEmail") =>
  pattern(EMAIL_REGEX, messageKey);

export const CODE_LENGTH = 6;

export const code = (messageKey = "validation.invalidCode") =>
  pattern(/^\d{6}$/, messageKey);

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
