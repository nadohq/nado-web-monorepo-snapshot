import { sumBigNumberBy } from '@nadohq/client';
import { BigNumber } from 'bignumber.js';
import { MappedNullable } from 'client/utils/types';

/**
 * @param valueByProductId
 * @returns sums of all products values to single total value.
 */
export function calcAllProductsTotalValue<
  TValue extends Record<number, BigNumber> | undefined,
>(valueByProductId: TValue): MappedNullable<TValue, BigNumber> {
  if (!valueByProductId) {
    return undefined as MappedNullable<TValue, never>;
  }

  return sumBigNumberBy(
    Object.values(valueByProductId),
    (value) => value,
  ) as MappedNullable<TValue, BigNumber>;
}
