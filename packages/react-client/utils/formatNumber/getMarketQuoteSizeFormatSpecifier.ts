import {
  CustomNumberFormatSpecifier,
  PresetNumberFormatSpecifier,
} from './NumberFormatSpecifier';

interface Params {
  /**
   * Whether the quote is the primary quote.
   */
  isPrimaryQuote: boolean | undefined;
  /**
   * Whether the quote size should be formatted as signed. Defaults to false.
   */
  isSigned?: boolean;
  /**
   * Whether to format the primary quote as currency. Defaults to false.
   */
  primaryQuoteAsCurrency?: boolean;
}
/**
 * Selects the correct number format specifier for displaying market quote sizes.
 * @param params - The parameters for the function.
 * @returns A format specifier for the quote size.
 */
export function getMarketQuoteSizeFormatSpecifier({
  isPrimaryQuote,
  isSigned = false,
  primaryQuoteAsCurrency = false,
}: Params) {
  if (isPrimaryQuote) {
    // Use preset specifiers for primary quotes
    if (primaryQuoteAsCurrency) {
      // Currency format (signed or unsigned)
      return isSigned
        ? PresetNumberFormatSpecifier.SIGNED_CURRENCY_2DP
        : PresetNumberFormatSpecifier.CURRENCY_2DP;
    }

    // Numeric format with 2 decimal places (signed or unsigned)
    return isSigned
      ? PresetNumberFormatSpecifier.SIGNED_NUMBER_2DP
      : PresetNumberFormatSpecifier.NUMBER_2DP;
  }

  // Use custom auto-precision formats for secondary quotes
  return isSigned
    ? CustomNumberFormatSpecifier.SIGNED_NUMBER_AUTO
    : CustomNumberFormatSpecifier.NUMBER_AUTO;
}
