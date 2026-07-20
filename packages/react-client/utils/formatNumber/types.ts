import { BigNumberish } from '@nadohq/client';
import { NumberFormatSpecifier } from './NumberFormatSpecifier';

export type NumberFormatValue = BigNumberish;

export interface NumberFormatOptions {
  /**
   * A preset/custom specifier, or a ready-made `Intl.NumberFormat` (e.g. the
   * tick-derived formatter from `getMarketPriceFormatSpecifier`).
   */
  formatSpecifier?: NumberFormatSpecifier;
  // What to render if the value given is null, has precedence over `defaultValue`
  defaultFallback?: string;
  // If the value is undefined, default to formatting this value
  defaultValue?: NumberFormatValue;
}
