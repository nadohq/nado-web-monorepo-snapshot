import { BigNumbers, removeDecimals } from '@nadohq/client';
import { BigNumber } from 'bignumber.js';
import { getRoundedIncrement } from '../xStocks/getRoundedIncrement';
import { toXStocksDisplayAmount } from '../xStocks/xStocksConversions';
import {
  CustomNumberFormatSpecifier,
  NumberFormatSpecifier,
} from './NumberFormatSpecifier';
import { getPrecisionFixedFormatSpecifier } from './getPrecisionFixedFormatSpecifier';

export interface GetMarketSizeFormatSpecifierParams {
  sizeIncrement: BigNumber | undefined;
  shouldRemoveDecimals?: boolean;
  exchangeRate: BigNumber | undefined;
  isSigned?: boolean;
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
  exchangeRate,
  isSigned,
}: GetMarketSizeFormatSpecifierParams): NumberFormatSpecifier {
  const roundedDisplaySizeIncrement = getRoundedIncrement(
    toXStocksDisplayAmount(sizeIncrement, exchangeRate ?? BigNumbers.ONE),
  );

  if (!roundedDisplaySizeIncrement || roundedDisplaySizeIncrement.isZero()) {
    return isSigned
      ? CustomNumberFormatSpecifier.SIGNED_NUMBER_AUTO
      : CustomNumberFormatSpecifier.NUMBER_AUTO;
  }

  const decimalAdjustedSizeIncrement = shouldRemoveDecimals
    ? removeDecimals(roundedDisplaySizeIncrement)
    : roundedDisplaySizeIncrement;

  return getPrecisionFixedFormatSpecifier({
    step: decimalAdjustedSizeIncrement.toNumber(),
    isSigned,
  });
}
