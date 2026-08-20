// ATM-style cash entry: every digit typed shifts in from the right as cents,
// so the field always renders a fully-formed amount (grouped, 2 decimals)
// without the user ever typing a decimal point. Works for any decimal-typed
// field (currency amounts, interest rates, etc.) since it only cares about
// the digits typed, not the locale's grouping/decimal separators.
function digitsAndSign(text: string): { isNegative: boolean; digits: string } {
  return { isNegative: text.includes("-"), digits: text.replace(/[^0-9]/g, "") };
}

/** Spanish's default grouping/decimal separators (100.000,00) read as a
 * formatting bug to this app's Spanish-speaking users, who expect US-style
 * grouping (100,000.00) — see the matching fix in utils/format.ts. */
function moneyNumberLocale(locale: string): string {
  return locale.startsWith("es") ? "en-US" : locale;
}

export function formatMoneyInput(text: string, locale: string): string {
  const { isNegative, digits } = digitsAndSign(text);
  if (digits.length === 0) return isNegative ? "-" : "";
  const amount = parseInt(digits, 10) / 100;
  const formatted = new Intl.NumberFormat(moneyNumberLocale(locale), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return isNegative ? `-${formatted}` : formatted;
}

export function parseMoneyInput(text: string): number {
  const { isNegative, digits } = digitsAndSign(text);
  if (digits.length === 0) return 0;
  const amount = parseInt(digits, 10) / 100;
  return isNegative ? -amount : amount;
}

/** Formats an existing numeric value (e.g. prefilling an edit form) as if it
 * had been typed digit-by-digit into a masked field. */
export function moneyToInputText(amount: number, locale: string): string {
  return formatMoneyInput(String(Math.round(Math.abs(amount) * 100)), locale);
}
