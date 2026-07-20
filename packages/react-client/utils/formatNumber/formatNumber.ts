import { toBigNumber } from '@nadohq/client';
import { mapCustomFormatSpecifier } from './mapCustomFormatSpecifier';
import {
  CustomNumberFormatSpecifier,
  isLegacyNumberFormatSpecifier,
  NUMBER_PRESET_TO_INTL_FORMAT,
  NumberFormatSpecifier,
} from './NumberFormatSpecifier';
import { NumberFormatOptions, NumberFormatValue } from './types';

const DEFAULT_FORMAT_SPECIFIER = CustomNumberFormatSpecifier.NUMBER_AUTO;

export function formatNumber(
  val: NumberFormatValue | undefined | null,
  options?: NumberFormatOptions,
): string {
  const { defaultValue, defaultFallback, formatSpecifier } = options ?? {};

  if (defaultValue == null && val == null) {
    return defaultFallback ?? '--';
  }

  const givenFormatSpecifier = formatSpecifier ?? DEFAULT_FORMAT_SPECIFIER;
  const valueToFormat = toBigNumber(val ?? defaultValue ?? 0);
  const formatter = resolveFormatter(valueToFormat, givenFormatSpecifier);

  return formatter.format(valueToFormat.toNumber());
}

function resolveFormatter(
  value: ReturnType<typeof toBigNumber>,
  formatSpecifier: NumberFormatSpecifier,
): Intl.NumberFormat {
  // A ready-made formatter (e.g. prebuilt tick-derived precision) - use as-is.
  if (formatSpecifier instanceof Intl.NumberFormat) {
    return formatSpecifier;
  }

  if (isLegacyNumberFormatSpecifier(formatSpecifier)) {
    return NUMBER_PRESET_TO_INTL_FORMAT[formatSpecifier];
  }

  const mappedPreset = mapCustomFormatSpecifier(value, formatSpecifier);
  if (!mappedPreset) {
    // Unreachable for valid specifiers - indicates a developer error.
    throw new Error(`Unrecognized number format specifier: ${formatSpecifier}`);
  }

  return NUMBER_PRESET_TO_INTL_FORMAT[mappedPreset];
}
