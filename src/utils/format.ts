export function formatCurrency(amount: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
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
