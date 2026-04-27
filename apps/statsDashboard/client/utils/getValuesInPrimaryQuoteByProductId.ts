import { BigNumbers, mapValues } from '@nadohq/client';
import { BigNumber } from 'bignumber.js';
import { MappedNullable } from 'client/utils/types';

/**
 * @param valueByProductId
 * @param oraclePricesByProductId
 * @returns values in primary quote by productId.
 */
export function getValuesInPrimaryQuoteByProductId<
  TValue extends Record<number, BigNumber> | undefined,
>(
  valueByProductId: TValue,
  oraclePricesByProductId: Record<number, BigNumber> | undefined,
) {
  if (!valueByProductId) {
    return undefined as MappedNullable<TValue, never>;
  }

  return mapValues(valueByProductId, (value, productId) => {
    const productIdAsNum = Number(productId);

    return value.times(
      oraclePricesByProductId?.[productIdAsNum] ?? BigNumbers.ZERO,
    );
  }) as MappedNullable<TValue, Record<number, BigNumber>>;
}
