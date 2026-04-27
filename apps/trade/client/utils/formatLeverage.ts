import {
  formatNumber,
  NumberFormatSpecifier,
  NumberFormatValue,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';

/**
 * Formats a leverage value and adds "x" suffix.
 * @param value - The value to format.
 * @param formatSpecifier - Optional format specifier. Defaults to NUMBER_1DP.
 * @returns The formatted value with "x" suffix.
 */
export function formatLeverage(
  value: NumberFormatValue | undefined | null,
  formatSpecifier?: NumberFormatSpecifier,
): string {
  const formatted = formatNumber(value, {
    formatSpecifier: formatSpecifier ?? PresetNumberFormatSpecifier.NUMBER_1DP,
  });

  return `${formatted}x`;
}
