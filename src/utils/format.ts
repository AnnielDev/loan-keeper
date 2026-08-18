export function formatCurrency(amount: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

const COMPACT_CURRENCY_THRESHOLD = 1_000_000;

/** Like formatCurrency, but switches to compact scale notation (1.20M, 3.40B, ...)
 * once the amount reaches one million, for space-constrained dashboard cards. */
export function formatCurrencyCompact(amount: number, currency: string, locale: string): string {
  if (Math.abs(amount) < COMPACT_CURRENCY_THRESHOLD) {
    return formatCurrency(amount, currency, locale);
  }
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    notation: "compact",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCompactNumber(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
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
