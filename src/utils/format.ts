export function formatCurrency(amount: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

const COMPACT_CURRENCY_THRESHOLD = 1_000_000;

/** Hermes' Intl.NumberFormat silently ignores `notation: "compact"` on some
 * platforms (falls back to plain digits instead of throwing), so scaling is
 * done manually here rather than relying on that option. */
const COMPACT_SCALES: { value: number; suffix: string }[] = [
  { value: 1_000_000_000_000, suffix: "T" },
  { value: 1_000_000_000, suffix: "B" },
  { value: 1_000_000, suffix: "M" },
  { value: 1_000, suffix: "K" },
];

function pickCompactScale(amount: number): { value: number; suffix: string } | undefined {
  const absAmount = Math.abs(amount);
  return COMPACT_SCALES.find((scale) => absAmount >= scale.value);
}

/** Like formatCurrency, but switches to compact scale notation (1.20M, 3.40B, ...)
 * once the amount reaches one million, for space-constrained dashboard cards. */
export function formatCurrencyCompact(amount: number, currency: string, locale: string): string {
  if (Math.abs(amount) < COMPACT_CURRENCY_THRESHOLD) {
    return formatCurrency(amount, currency, locale);
  }

  const scale = pickCompactScale(amount);
  if (!scale) {
    return formatCurrency(amount, currency, locale);
  }

  const parts = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).formatToParts(amount / scale.value);

  const numericType = parts.some((part) => part.type === "fraction") ? "fraction" : "integer";
  const suffixAfterIndex = parts.map((part) => part.type).lastIndexOf(numericType);

  return parts.map((part, index) => (index === suffixAfterIndex ? part.value + scale.suffix : part.value)).join("");
}

export function formatCompactNumber(amount: number, locale: string): string {
  const scale = pickCompactScale(amount);
  if (!scale) {
    return new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(amount);
  }

  const formatted = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(amount / scale.value);
  return `${formatted}${scale.suffix}`;
}

export function formatShortDate(isoDate: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
  }).format(new Date(isoDate));
}

export function formatNumericDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatLongDate(isoDate: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(isoDate));
}

/** Serializes a Date's local calendar day as "YYYY-MM-DD", ignoring time-of-day
 * and timezone — use this (not `Date#toISOString()`) when sending a date-only
 * value to the API, since `toISOString()` converts to UTC and can shift the
 * calendar day by one in timezones behind UTC. */
export function toLocalDateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
