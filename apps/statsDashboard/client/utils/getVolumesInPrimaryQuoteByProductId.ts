import { BigNumbers, mapValues, QUOTE_PRODUCT_ID } from '@nadohq/client';
import { BigNumber } from 'bignumber.js';
import { AllEdgeMarketsData } from 'client/hooks/query/useQueryAllEdgeMarkets';
import { MappedNullable } from 'client/utils/types';

/**
 * Calculates volumes in the primary quote for each product ID.
 *
 * @param volumeByProductId - A map of volumes by product ID.
 * @param allMarketsData - All available market data, including quoteProductId and oraclePrice.
 * @returns A map of volumes adjusted to the primary quote for each product ID.
 */
export function getVolumesInPrimaryQuoteByProductId<
  TValue extends Record<number, BigNumber> | undefined,
>(volumeByProductId: TValue, allMarketsData: AllEdgeMarketsData | undefined) {
  if (!volumeByProductId) {
    return undefined as MappedNullable<TValue, never>;
  }

  return mapValues(volumeByProductId, (value, productId) => {
    const productIdAsNum = Number(productId);

    const quoteOraclePrice = (() => {
      const market = allMarketsData?.allMarkets?.[productIdAsNum];

      // If the market is not found or its primary quote is the specified quote product, return 1
      if (!market || market.metadata.quoteProductId === QUOTE_PRODUCT_ID) {
        return BigNumbers.ONE;
      }

      // Retrieve the oracle price for the market's quote product
      const quoteProductOraclePrice =
        allMarketsData?.allMarkets?.[market.metadata.quoteProductId]?.product
          .oraclePrice;

      // Return the oracle price if found; otherwise, return 1
      return quoteProductOraclePrice ?? BigNumbers.ONE;
    })();

    // Multiply the volume by the quoteOraclePrice to get the adjusted volume
    return value.times(quoteOraclePrice);
  }) as MappedNullable<TValue, Record<number, BigNumber>>;
}
