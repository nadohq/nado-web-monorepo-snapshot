/** Formats a numeric string with thousand separators (e.g., "86901" → "86,901") */
export function formatPrice(price: string | number): string {
  const num =
    typeof price === 'string' ? Number(price.replace(/,/g, '')) : price;

  if (isNaN(num)) return price.toString();

  return num.toLocaleString('en-US');
}

/**
 * Extracts a number from text by removing all characters except digits, dashes, and periods.
 * E.g., " -$1,234.56abc" => -1234.56
 */
export function getNumberFromText(text: string): number {
  // Retain digits, optional leading minus, and periods (for decimals)
  const cleaned = text.replace(/[^\d.-]/g, '');
  return parseFloat(cleaned);
}
