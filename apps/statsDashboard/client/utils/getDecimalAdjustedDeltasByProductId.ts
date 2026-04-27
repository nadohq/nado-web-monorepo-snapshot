import { removeDecimals } from '@nadohq/client';
import { BigNumber } from 'bignumber.js';

/**
 * @param valueByProductId
 * @param earlierValueByProductId
 * @returns Decimal adjusted delta value for each product separately
 */
export function getDecimalAdjustedDeltasByProductId(
  valueByProductId: Record<number, BigNumber> | undefined,
  earlierValueByProductId: Record<number, BigNumber> | undefined,
) {
  const deltasByProductId: Record<number, BigNumber | undefined> = {};

  Object.entries(valueByProductId ?? {}).map(([productId, currentValue]) => {
    const productIdAsNum = Number(productId);

    const prevValue = earlierValueByProductId?.[productIdAsNum];

    if (!prevValue) {
      return;
    }

    const decimalAdjustedDelta = removeDecimals(currentValue.minus(prevValue));

    deltasByProductId[productIdAsNum] = decimalAdjustedDelta;
  });

  return deltasByProductId;
}
