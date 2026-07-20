import { range } from 'lodash';
import {
  createNumberFormat,
  NumberFormatSpecifier,
} from './NumberFormatSpecifier';
import { precisionFixed } from './precisionFixed';

export interface GetPrecisionFixedFormatSpecifierParams {
  step: number;
  isSigned?: boolean;
}
// Backend amounts are X18, so precision realistically maxes out at 18 (well under
// the 20 above which Intl throws). We prebuild a formatter for every precision in
// range, avoiding per-call construction entirely.
const MAX_FRACTION_DIGITS = 18;

const PREBUILT_PRECISION_FORMATS: Record<
  'signed' | 'unsigned',
  Intl.NumberFormat[]
> = {
  unsigned: range(MAX_FRACTION_DIGITS + 1).map((precision) =>
    buildPrecisionFormat(precision, false),
  ),
  signed: range(MAX_FRACTION_DIGITS + 1).map((precision) =>
    buildPrecisionFormat(precision, true),
  ),
};

/**
 * Builds a fixed-point `NumberFormatSpecifier` from a step/tick size, reusing a
 * prebuilt formatter for the (clamped) precision.
 */
export function getPrecisionFixedFormatSpecifier({
  step,
  isSigned,
}: GetPrecisionFixedFormatSpecifierParams): NumberFormatSpecifier {
  const precision = Math.min(precisionFixed(step), MAX_FRACTION_DIGITS);
  const formats = isSigned
    ? PREBUILT_PRECISION_FORMATS.signed
    : PREBUILT_PRECISION_FORMATS.unsigned;

  return formats[precision];
}

function buildPrecisionFormat(
  precision: number,
  isSigned?: boolean,
): Intl.NumberFormat {
  return createNumberFormat({
    useGrouping: true,
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
    ...(isSigned ? { signDisplay: 'exceptZero' as const } : {}),
  });
}
