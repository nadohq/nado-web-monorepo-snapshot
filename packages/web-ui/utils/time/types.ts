import { TimeFormatSpecifier } from './TimeFormatSpecifier';

export type TimeFormatValue = Date | number;

export interface FormatOptions {
  /** The format specifier to use */
  formatSpecifier?: TimeFormatSpecifier;
  /** What to render if the value given is null */
  defaultFallback?: string;
}
