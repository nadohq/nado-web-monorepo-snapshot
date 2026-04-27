import { removeDecimals } from '@nadohq/client';
import { BigNumber } from 'bignumber.js';
import { calcAllProductsTotalValue } from 'client/utils/calcAllProductsTotalValue';
import { MappedNullable } from 'client/utils/types';

/**
 * @param currentCumulativeValueByProductId
 * @param earlierCumulativeValueByProductId
 * @returns Decimal adjusted delta value
 */
export function calcTotalDecimalAdjustedDeltas<
  TCurrentValue extends Record<number, BigNumber> | undefined,
  TEarlierValue extends Record<number, BigNumber> | undefined,
>(
  currentCumulativeValueByProductId: TCurrentValue,
  earlierCumulativeValueByProductId: TEarlierValue,
) {
  const currentValue = calcAllProductsTotalValue(
    currentCumulativeValueByProductId,
  );
  const earlierValue = calcAllProductsTotalValue(
    earlierCumulativeValueByProductId,
  );
  const delta = (
    earlierValue ? currentValue?.minus(earlierValue) : undefined
  ) as MappedNullable<TCurrentValue & TEarlierValue, BigNumber>;

  return removeDecimals(delta);
}
