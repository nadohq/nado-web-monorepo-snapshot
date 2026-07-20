import { BigNumbers } from '@nadohq/client';
import { BigNumber } from 'bignumber.js';
import { getRoundedIncrement } from '../xStocks/getRoundedIncrement';
import { toXStocksDisplayPrice } from '../xStocks/xStocksConversions';
import {
  NumberFormatSpecifier,
  PresetNumberFormatSpecifier,
} from './NumberFormatSpecifier';
import { getPrecisionFixedFormatSpecifier } from './getPrecisionFixedFormatSpecifier';

export interface GetMarketPriceFormatSpecifierParams {
  priceIncrement: BigNumber | undefined;
  exchangeRate: BigNumber | undefined;
  isSigned?: boolean;
}

export function getMarketPriceFormatSpecifier({
  priceIncrement,
  isSigned,
  exchangeRate,
}: GetMarketPriceFormatSpecifierParams): NumberFormatSpecifier {
  const roundedDisplayIncrement = getRoundedIncrement(
    toXStocksDisplayPrice(priceIncrement, exchangeRate ?? BigNumbers.ONE),
  );

  if (
    !roundedDisplayIncrement ||
    roundedDisplayIncrement.isZero() ||
    roundedDisplayIncrement.gte(1)
  ) {
    return isSigned
      ? PresetNumberFormatSpecifier.SIGNED_NUMBER_INT
      : PresetNumberFormatSpecifier.NUMBER_INT;
  }

  return getPrecisionFixedFormatSpecifier({
    step: roundedDisplayIncrement.toNumber(),
    isSigned,
  });
}
