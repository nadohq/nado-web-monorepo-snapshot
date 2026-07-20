import {
  TIME_SPECIFIER_TO_INTL_FORMAT,
  TimeFormatSpecifier,
} from './TimeFormatSpecifier';
import { FormatOptions, TimeFormatValue } from './types';

/**
 * Format a timestamp in human-readable format.
 * NOTE: use formatDurationMillis if you want to format a duration.
 *
 * @param {TimeFormatValue | undefined} val
 * @param {FormatOptions?} options
 * @returns {string}
 */
export function formatTimestamp(
  val: TimeFormatValue | undefined,
  options?: FormatOptions,
): string {
  if (val == null) {
    return options?.defaultFallback ?? '--';
  }

  const specifier = options?.formatSpecifier ?? TimeFormatSpecifier.HH_MM_SS;
  const date = typeof val === 'number' ? new Date(val) : val;

  return TIME_SPECIFIER_TO_INTL_FORMAT[specifier].format(date);
}
