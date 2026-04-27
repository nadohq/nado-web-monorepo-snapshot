import { IndexerV2MarketHours } from '@nadohq/client';
import { BigNumber } from 'bignumber.js';
import { useMemo } from 'react';
import { useQuerySymbols } from '../query/useQuerySymbols';

interface MarketRestrictions {
  /**
   * Market only supports isolated mode
   */
  isolatedOnly: boolean;
  /**
   * Maximum open interest allowed in the market. If undefined, there is no limit.
   */
  maxOpenInterest: BigNumber | undefined;
  /**
   * Market hours for the market. If undefined, the market is open 24/7.
   */
  marketHours: IndexerV2MarketHours | undefined;
}

/**
 * Retrieves market restrictions by product ID
 */
export function useMarketRestrictions() {
  const { data, ...rest } = useQuerySymbols();

  const mappedData = useMemo(():
    | Record<number, MarketRestrictions>
    | undefined => {
    if (!data) {
      return undefined;
    }

    const marketRestrictionsByProductId: Record<number, MarketRestrictions> =
      {};

    Object.values(data).forEach(
      ({ productId, isolatedOnly, maxOpenInterest, marketHours }) => {
        marketRestrictionsByProductId[productId] = {
          isolatedOnly,
          maxOpenInterest: maxOpenInterest ?? undefined,
          marketHours: marketHours ?? undefined,
        };
      },
    );

    return marketRestrictionsByProductId;
  }, [data]);

  return {
    data: mappedData,
    ...rest,
  };
}
