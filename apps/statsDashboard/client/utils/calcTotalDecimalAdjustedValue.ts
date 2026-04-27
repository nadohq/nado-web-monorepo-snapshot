import { removeDecimals } from '@nadohq/client';
import { BigNumber } from 'bignumber.js';
import { calcAllProductsTotalValue } from 'client/utils/calcAllProductsTotalValue';
import { MappedNullable } from 'client/utils/types';

/**
 * @param valueByProductId
 * @returns decimal adjusted total value
 */
export function calcTotalDecimalAdjustedValue<
  TValue extends Record<number, BigNumber> | undefined,
>(valueByProductId: TValue): MappedNullable<TValue, BigNumber> {
  const decimalAdjustedTotalValue = removeDecimals(
    calcAllProductsTotalValue(valueByProductId),
  );
  return decimalAdjustedTotalValue as MappedNullable<TValue, BigNumber>;
}
