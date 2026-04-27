import { removeDecimals } from '@nadohq/client';
import { BigNumber } from 'bignumber.js';
import { precisionFixed } from 'd3-format';
import { CustomNumberFormatSpecifier } from './NumberFormatSpecifier';

export interface GetMarketSizeFormatSpecifierParams {
  sizeIncrement: BigNumber | undefined;
  shouldRemoveDecimals?: boolean;
}

/**
 * Returns a format specifier for displaying a trade size, based on the size increment of the market
 * This results in a minimum 0dp in displayed amount
 * If increment is 10, then we show integers
 * If increment is 0.0001, then we show 4dp
 */
export function getMarketSizeFormatSpecifier({
  sizeIncrement,
  shouldRemoveDecimals = true,
}: GetMarketSizeFormatSpecifierParams) {
  // Size increments should never be zero, so this allows us to use an easy default (BigNumbers.ZERO) when we don't have data
  if (!sizeIncrement || sizeIncrement.isZero()) {
    return CustomNumberFormatSpecifier.NUMBER_AUTO;
  }
  const decimalAdjustedSizeIncrement = shouldRemoveDecimals
    ? removeDecimals(sizeIncrement)
    : sizeIncrement;

  // precisionFixed has a minimum of 0, so precisionFixed(10) = 0
  return `,.${precisionFixed(decimalAdjustedSizeIncrement.toNumber()).toFixed()}f`;
}
