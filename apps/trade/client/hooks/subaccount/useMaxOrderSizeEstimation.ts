import {
  BalanceSide,
  BigNumberish,
  removeDecimals,
  toBigNumber,
} from '@nadohq/client';
import {
  calcMarketConversionPriceFromOraclePrice,
  toXStocksDisplayAmount,
  toXStocksRawPrice,
} from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { useMarket } from 'client/hooks/markets/useMarket';
import {
  useQueryMaxOrderSize,
  UseQueryMaxOrderSizeParams,
} from 'client/hooks/query/subaccount/useQueryMaxOrderSize';
import { useGetXStocksExchangeRate } from 'client/modules/xStocks/hooks/useGetXStocksExchangeRate';
import { QueryState } from 'client/types/QueryState';
import { roundToPrecision } from 'client/utils/rounding';
import { useMemo } from 'react';

interface ConvertDisplayPriceForQueryParams {
  price: BigNumberish | undefined;
  exchangeRate: BigNumber;
  side: BalanceSide;
}

function convertDisplayPriceForQuery({
  price,
  exchangeRate,
  side,
}: ConvertDisplayPriceForQueryParams): BigNumber | undefined {
  if (price == null) {
    return;
  }

  return roundToPrecision(
    // Query inputs are always in the display space (e.g. user input), so convert to raw space
    toXStocksRawPrice(toBigNumber(price), exchangeRate),
    4,
    side === 'long' ? BigNumber.ROUND_UP : BigNumber.ROUND_DOWN,
  );
}

/**
 * A wrapper hook around the max order size query that applies:
 * - Rounding of query prices (price and avgPrice) to ensure we don't hit backend too often
 * - Checking against market oracle price to ensure that the price submitted is within valid bounds (20% -> 500% of oracle price)
 * - Decimal adjustment of the returned max order size
 */
export function useMaxOrderSizeEstimation(
  params: UseQueryMaxOrderSizeParams | undefined,
): QueryState<BigNumber> {
  const { data: marketData } = useMarket({ productId: params?.productId });
  const { data: quoteData } = useMarket({
    productId: marketData?.metadata.quoteProductId,
  });
  const { getExchangeRate } = useGetXStocksExchangeRate();
  const exchangeRate = useMemo(
    () => getExchangeRate(params?.productId),
    [getExchangeRate, params?.productId],
  );

  // Round the price for a more stable query key.
  const roundedPriceForQuery = useMemo(() => {
    if (!params) {
      return;
    }

    return convertDisplayPriceForQuery({
      price: params.price,
      exchangeRate,
      side: params.side,
    });
  }, [exchangeRate, params]);

  const roundedAvgPriceForQuery = useMemo(() => {
    if (!params) {
      return;
    }

    return convertDisplayPriceForQuery({
      price: params.avgPrice,
      exchangeRate,
      side: params.side,
    });
  }, [exchangeRate, params]);

  const maxOrderSizeParams = useMemo<
    UseQueryMaxOrderSizeParams | undefined
  >(() => {
    if (!roundedPriceForQuery || !params) {
      return;
    }

    // These are already in the raw space
    const baseOraclePrice = marketData?.product.oraclePrice;
    const quoteOraclePrice = quoteData?.product.oraclePrice;

    // Backend errors on prices that are out of the 20% -> 500% range from the current ORACLE price, so skip the query if the price is outside of this range
    if (baseOraclePrice && quoteOraclePrice) {
      const impliedMarketOraclePrice = calcMarketConversionPriceFromOraclePrice(
        baseOraclePrice,
        quoteOraclePrice,
      );
      const isInvalidPrice =
        impliedMarketOraclePrice.multipliedBy(5).lt(roundedPriceForQuery) ||
        impliedMarketOraclePrice.multipliedBy(0.2).gt(roundedPriceForQuery);

      // Perform the check only if we have a valid market oracle price
      if (impliedMarketOraclePrice.gt(0) && isInvalidPrice) {
        return;
      }
    }

    return {
      ...params,
      price: roundedPriceForQuery,
      avgPrice: roundedAvgPriceForQuery,
    };
  }, [
    roundedAvgPriceForQuery,
    roundedPriceForQuery,
    params,
    marketData?.product.oraclePrice,
    quoteData?.product.oraclePrice,
  ]);

  const { data, ...rest } = useQueryMaxOrderSize(maxOrderSizeParams);

  const mappedData = useMemo(() => {
    const rawDecimalAdjusted = removeDecimals(data);
    if (!rawDecimalAdjusted) {
      return undefined;
    }
    // Engine returns raw (wQQQx) amount — convert to display after decimal adjustment
    return toXStocksDisplayAmount(rawDecimalAdjusted, exchangeRate);
  }, [data, exchangeRate]);

  return {
    data: mappedData,
    ...rest,
  };
}
