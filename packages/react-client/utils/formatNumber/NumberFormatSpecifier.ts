import { mapValues } from 'lodash';

export enum CustomNumberFormatSpecifier {
  // For areas of the app where we want to show as much precision as possible
  NUMBER_PRECISE = 'number_precise',
  // For generic numbers and asset amounts
  NUMBER_AUTO = 'number_auto',
  SIGNED_NUMBER_AUTO = 'signed_number_auto',
  // Used for large numbers where we want to show "M" for million & "B" for billion
  NUMBER_LARGE_ABBREVIATED = 'number_large_abbreviated',
  CURRENCY_LARGE_ABBREVIATED = 'currency_large_abbreviated',
  SIGNED_CURRENCY_LARGE_ABBREVIATED = 'signed_currency_large_abbreviated',
  // Properly adjusts for zero values by not showing a sign
  SIGNED_CURRENCY_2DP = 'signed_currency_2dp',
  SIGNED_CURRENCY_INT = 'signed_currency_int',
}

export enum PresetNumberFormatSpecifier {
  CURRENCY_INT = '$,.0f',
  CURRENCY_2DP = '$,.2f',
  CURRENCY_UPTO_3DP = '$,.3~f',
  CURRENCY_SI_3SF = '$,.3s',
  NUMBER_1DP = '.1f',
  NUMBER_2DP = ',.2f',
  NUMBER_4DP = ',.4f',
  NUMBER_UPTO_6DP = ',.6~f',
  NUMBER_INT = ',.0f',
  NUMBER_SI_3SF = ',.3s',
  NUMBER_SI_5SF = ',.5s',
  PERCENTAGE_2DP = ',.2%',
  PERCENTAGE_UPTO_4DP = ',.4~%',
  PERCENTAGE_INT = ',.0%',
  SIGNED_NUMBER_INT = '+,.0f',
  SIGNED_NUMBER_2DP = '+,.2f',
  SIGNED_NUMBER_4DP = '+,.4f',
  SIGNED_CURRENCY_INT = '+$,.0f',
  SIGNED_CURRENCY_2DP = '+$,.2f',
  SIGNED_PERCENTAGE_2DP = '+,.2%',
  SIGNED_PERCENTAGE_4DP = '+,.4%',
  SIGNED_CURRENCY_SI_3SF = '+$,.3s',
}

/**
 * Accepted by `formatNumber`'s `formatSpecifier`: a preset/custom id, or a
 * ready-made `Intl.NumberFormat` (e.g. the prebuilt, tick-derived formatters
 * from `getMarketPriceFormatSpecifier`).
 */
export type NumberFormatSpecifier =
  | PresetNumberFormatSpecifier
  | CustomNumberFormatSpecifier
  | Intl.NumberFormat;

const SIGNED_DISPLAY: Pick<Intl.NumberFormatOptions, 'signDisplay'> = {
  signDisplay: 'exceptZero',
};

const LOCALE = 'en-US';

/**
 * Builds an `Intl.NumberFormat` for our fixed locale. Centralizes locale +
 * construction so callers never reach for `new Intl.NumberFormat` directly.
 */
export function createNumberFormat(
  options: Intl.NumberFormatOptions,
): Intl.NumberFormat {
  return new Intl.NumberFormat(LOCALE, options);
}

const NUMBER_PRESET_TO_INTL_OPTIONS: Record<
  PresetNumberFormatSpecifier,
  Intl.NumberFormatOptions
> = {
  [PresetNumberFormatSpecifier.CURRENCY_INT]: {
    style: 'currency',
    currency: 'USD',
    useGrouping: true,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  },
  [PresetNumberFormatSpecifier.CURRENCY_2DP]: {
    style: 'currency',
    currency: 'USD',
    useGrouping: true,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
  [PresetNumberFormatSpecifier.CURRENCY_UPTO_3DP]: {
    style: 'currency',
    currency: 'USD',
    useGrouping: true,
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  },
  [PresetNumberFormatSpecifier.CURRENCY_SI_3SF]: {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    minimumSignificantDigits: 3,
    maximumSignificantDigits: 3,
  },
  [PresetNumberFormatSpecifier.NUMBER_1DP]: {
    useGrouping: false,
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  },
  [PresetNumberFormatSpecifier.NUMBER_2DP]: {
    useGrouping: true,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
  [PresetNumberFormatSpecifier.NUMBER_4DP]: {
    useGrouping: true,
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  },
  [PresetNumberFormatSpecifier.NUMBER_UPTO_6DP]: {
    useGrouping: true,
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  },
  [PresetNumberFormatSpecifier.NUMBER_INT]: {
    useGrouping: true,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  },
  [PresetNumberFormatSpecifier.NUMBER_SI_3SF]: {
    useGrouping: true,
    notation: 'compact',
    minimumSignificantDigits: 3,
    maximumSignificantDigits: 3,
  },
  [PresetNumberFormatSpecifier.NUMBER_SI_5SF]: {
    useGrouping: true,
    notation: 'compact',
    minimumSignificantDigits: 5,
    maximumSignificantDigits: 5,
  },
  [PresetNumberFormatSpecifier.PERCENTAGE_2DP]: {
    style: 'percent',
    useGrouping: true,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
  [PresetNumberFormatSpecifier.PERCENTAGE_UPTO_4DP]: {
    style: 'percent',
    useGrouping: true,
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  },
  [PresetNumberFormatSpecifier.PERCENTAGE_INT]: {
    style: 'percent',
    useGrouping: true,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  },
  [PresetNumberFormatSpecifier.SIGNED_CURRENCY_INT]: {
    style: 'currency',
    currency: 'USD',
    useGrouping: true,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    ...SIGNED_DISPLAY,
  },
  [PresetNumberFormatSpecifier.SIGNED_CURRENCY_2DP]: {
    style: 'currency',
    currency: 'USD',
    useGrouping: true,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...SIGNED_DISPLAY,
  },
  [PresetNumberFormatSpecifier.SIGNED_CURRENCY_SI_3SF]: {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    minimumSignificantDigits: 3,
    maximumSignificantDigits: 3,
    ...SIGNED_DISPLAY,
  },
  [PresetNumberFormatSpecifier.SIGNED_NUMBER_INT]: {
    useGrouping: true,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    ...SIGNED_DISPLAY,
  },
  [PresetNumberFormatSpecifier.SIGNED_NUMBER_2DP]: {
    useGrouping: true,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...SIGNED_DISPLAY,
  },
  [PresetNumberFormatSpecifier.SIGNED_NUMBER_4DP]: {
    useGrouping: true,
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
    ...SIGNED_DISPLAY,
  },
  [PresetNumberFormatSpecifier.SIGNED_PERCENTAGE_2DP]: {
    style: 'percent',
    useGrouping: true,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...SIGNED_DISPLAY,
  },
  [PresetNumberFormatSpecifier.SIGNED_PERCENTAGE_4DP]: {
    style: 'percent',
    useGrouping: true,
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
    ...SIGNED_DISPLAY,
  },
};

/**
 * Presets are a fixed set, so their formatters are built once at module load
 * and reused - no per-call construction or runtime cache needed.
 */
export const NUMBER_PRESET_TO_INTL_FORMAT: Record<
  PresetNumberFormatSpecifier,
  Intl.NumberFormat
> = mapValues(NUMBER_PRESET_TO_INTL_OPTIONS, createNumberFormat);

export function isLegacyNumberFormatSpecifier(
  specifierId: PresetNumberFormatSpecifier | CustomNumberFormatSpecifier,
): specifierId is PresetNumberFormatSpecifier {
  return Object.hasOwn(NUMBER_PRESET_TO_INTL_FORMAT, specifierId);
}
