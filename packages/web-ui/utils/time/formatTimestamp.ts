import { format } from 'date-fns';
import { TimeFormatSpecifier } from './TimeFormatSpecifier';
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
) {
  if (val == null) {
    return options?.defaultFallback ?? '--';
  }

  return format(val, options?.formatSpecifier ?? TimeFormatSpecifier.HH_MM_SS);
}
