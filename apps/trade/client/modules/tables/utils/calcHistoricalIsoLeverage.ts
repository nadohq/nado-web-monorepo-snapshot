import { calcIsoPositionLeverage } from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';

interface Params {
  decimalAdjustedPreCloseMargin: BigNumber | null;
  decimalAdjustedPreBaseAmount: BigNumber;
  fillPrice: BigNumber;
  decimalAdjustedVQuoteBalance: BigNumber | undefined;
}

export function calcHistoricalIsoLeverage({
  decimalAdjustedPreCloseMargin,
  decimalAdjustedPreBaseAmount,
  fillPrice,
  decimalAdjustedVQuoteBalance,
}: Params): number | null {
  if (!decimalAdjustedPreCloseMargin || !decimalAdjustedVQuoteBalance) {
    return null;
  }

  const positionNotionalValueWithSign =
    decimalAdjustedPreBaseAmount.multipliedBy(fillPrice);

  return calcIsoPositionLeverage({
    totalMargin: decimalAdjustedPreCloseMargin,
    vQuoteBalance: decimalAdjustedVQuoteBalance,
    positionNotionalValueWithSign,
  }).toNumber();
}
