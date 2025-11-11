// Currency utility for Ethiopian Birr (ETB)
export const CURRENCY_SYMBOL = "ETB";
export const CURRENCY_NAME = "Ethiopian Birr";

/**
 * Format a number as Ethiopian Birr currency
 * @param amount - The amount to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number | string | undefined | null,
  decimals: number = 2
): string {
  if (amount === undefined || amount === null) {
    return `${CURRENCY_SYMBOL} 0.00`;
  }

  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return `${CURRENCY_SYMBOL} 0.00`;
  }

  // Format with thousands separators
  const formattedNumber = numAmount.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return `${CURRENCY_SYMBOL} ${formattedNumber}`;
}

/**
 * Format a number as Ethiopian Birr currency without symbol (for input placeholders, etc.)
 * @param amount - The amount to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted currency string without symbol
 */
export function formatCurrencyAmount(
  amount: number | string | undefined | null,
  decimals: number = 2
): string {
  if (amount === undefined || amount === null) {
    return "0.00";
  }

  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return "0.00";
  }

  // Format with thousands separators
  return numAmount.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Get currency symbol for labels and placeholders
 * @returns Currency symbol
 */
export function getCurrencySymbol(): string {
  return CURRENCY_SYMBOL;
}

/**
 * Get currency name for display purposes
 * @returns Currency name
 */
export function getCurrencyName(): string {
  return CURRENCY_NAME;
}
