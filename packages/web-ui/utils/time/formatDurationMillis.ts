import {
  TIME_SPECIFIER_TO_UTC_INTL_FORMAT,
  TimeFormatSpecifier,
} from './TimeFormatSpecifier';
import { FormatOptions } from './types';

/**
 * Format a duration in milliseconds in human-readable format.
 *
 * Formats against `timeZone: 'UTC'` so the rendered h/m/s equal the elapsed
 * time. Without it, `new Date(val)` renders in the local zone - e.g. a 1h
 * duration shows as "09:00:00" in SGT (UTC+8) instead of "01:00:00".
 *
 * @param {number | undefined} val
 * @returns {string}
 */
export function formatDurationMillis(
  val: number | undefined,
  options?: FormatOptions,
): string {
  if (val == null) {
    return options?.defaultFallback ?? '--';
  }

  const specifier = options?.formatSpecifier ?? TimeFormatSpecifier.HH_MM_SS;

  return TIME_SPECIFIER_TO_UTC_INTL_FORMAT[specifier].format(new Date(val));
}
