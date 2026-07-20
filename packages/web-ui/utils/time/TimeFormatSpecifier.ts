import { mapValues } from 'lodash';

export enum TimeFormatSpecifier {
  /** Ex: Mon, Oct 15 */
  E_D_MMM = 'E, MMM d',
  /** Ex: Mon, Oct 15, 1:00 PM */
  E_MMM_D_HH_12H = 'E, MMM d, p',
  /** Ex: Oct 15, 1:00 PM GMT-8 - Used for cases where the exact time is important */
  MMM_D_HH_12H_O = 'MMM d, p (O)',
  /** Ex: 08:30:12 */
  HH_MM_SS = 'HH:mm:ss',
  /** Ex: 45:20 */
  MM_SS = 'mm:ss',
  /** Ex: 10:05:12 PM */
  HH_MM_SS_12H = 'pp',
  /** Ex: 10:05 PM */
  HH_MM_12H = 'p',
  /** Ex: Oct 15 */
  MONTH_D = 'MMM d',
  /** Ex: Oct 15, 2023 */
  MONTH_D_YYYY = 'MMM d, yyyy',
  /** Ex: Oct 2023 */
  MONTH_YYYY = 'MMM yyyy',
}

const LOCALE = 'en-US';

const TIME_SPECIFIER_TO_INTL_OPTIONS: Record<
  TimeFormatSpecifier,
  Intl.DateTimeFormatOptions
> = {
  [TimeFormatSpecifier.E_D_MMM]: {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  },
  [TimeFormatSpecifier.E_MMM_D_HH_12H]: {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  },
  [TimeFormatSpecifier.MMM_D_HH_12H_O]: {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'shortOffset',
  },
  [TimeFormatSpecifier.HH_MM_SS]: {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    // `h23` keeps the hour in `00-23`, avoiding `24:xx` at midnight / 0-duration.
    hourCycle: 'h23',
  },
  [TimeFormatSpecifier.MM_SS]: {
    minute: '2-digit',
    second: '2-digit',
  },
  [TimeFormatSpecifier.HH_MM_SS_12H]: {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  },
  [TimeFormatSpecifier.HH_MM_12H]: {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  },
  [TimeFormatSpecifier.MONTH_D]: { month: 'short', day: 'numeric' },
  [TimeFormatSpecifier.MONTH_D_YYYY]: {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  },
  [TimeFormatSpecifier.MONTH_YYYY]: { month: 'short', year: 'numeric' },
};

// Prebuilt once so callers avoid per-call formatter construction.
function buildFormats(
  extraOptions?: Intl.DateTimeFormatOptions,
): Record<TimeFormatSpecifier, Intl.DateTimeFormat> {
  return mapValues(
    TIME_SPECIFIER_TO_INTL_OPTIONS,
    (options) =>
      new Intl.DateTimeFormat(LOCALE, { ...options, ...extraOptions }),
  );
}

export const TIME_SPECIFIER_TO_INTL_FORMAT = buildFormats();
// Use for durations (elapsed time), not wall-clock timestamps. `new Date(ms)`
// anchors a duration to the epoch, so formatting in UTC keeps the rendered
// h/m/s equal to the elapsed time - e.g. a 1h duration is "01:00:00", not
// "09:00:00" as it would render in SGT (UTC+8).
export const TIME_SPECIFIER_TO_UTC_INTL_FORMAT = buildFormats({
  timeZone: 'UTC',
});
