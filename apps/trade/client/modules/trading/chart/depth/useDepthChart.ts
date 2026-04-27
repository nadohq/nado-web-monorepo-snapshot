import {
  BigNumbers,
  EnginePriceTickLiquidity,
  removeDecimals,
} from '@nadohq/client';
import {
  getMarketPriceFormatSpecifier,
  getMarketSizeFormatSpecifier,
  safeDiv,
} from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { useMarket } from 'client/hooks/markets/useMarket';
import { useQueryMarketLiquidity } from 'client/hooks/query/markets/useQueryMarketLiquidity';
import { getSharedProductMetadata } from 'client/utils/getSharedProductMetadata';
import { first } from 'lodash';
import { useMemo } from 'react';

export interface DepthChartItem {
  /** Price of order */
  price: number;
  /** Cumulative ask base size */
  cumulativeAskBaseSize: number | undefined;
  /** Cumulative bid base size */
  cumulativeBidBaseSize: number | undefined;
  /** Cumulutive quote size */
  cumulativeQuoteSize: number;
  /** Fractional difference from top of book price (i.e. for a bid, % change from the highest bid) price */
  changeFraction: BigNumber;
}

interface Params {
  /** Current market's product ID */
  productId: number | undefined;
  /** The number of orders on each side of the book */
  limit: number;
}

export function useDepthChart({ productId, limit }: Params) {
  const { data: allMarkets } = useAllMarketsStaticData();
  const { data: market, isLoading: isLoadingMarket } = useMarket({ productId });
  const { data: liquidityQueryData, isLoading: isLoadingMarketLiquidity } =
    useQueryMarketLiquidity({
      productId,
    });

  const priceFormatSpecifier = getMarketPriceFormatSpecifier(
    market?.priceIncrement,
  );

  const sizeFormatSpecifier = getMarketSizeFormatSpecifier({
    sizeIncrement: market?.sizeIncrement,
  });

  const chartData = useMemo(() => {
    if (!liquidityQueryData || !market) {
      return [];
    }

    // Data starts from the top-of-book price, so the first item is the lowest ask / highest bid
    const { asks, bids } = liquidityQueryData;

    const highestBidPrice = first(bids)?.price;
    const lowestAskPrice = first(asks)?.price;

    const mappedBids = mapDepthChartData(
      bids,
      // If one side of the book doesn't exist, we still need `limit` number of data points starting from an appropriate number (either the other side of the book, or a default of 0)
      highestBidPrice ?? lowestAskPrice ?? BigNumbers.ZERO,
      market.priceIncrement,
      false,
      limit,
    );
    const mappedAsks = mapDepthChartData(
      asks,
      lowestAskPrice ?? highestBidPrice ?? BigNumbers.ZERO,
      market.priceIncrement,
      true,
      limit,
    );

    return [...mappedBids, ...mappedAsks];
  }, [liquidityQueryData, limit, market]);

  return {
    chartData,
    isLoading: isLoadingMarket || isLoadingMarketLiquidity,
    priceFormatSpecifier,
    sizeFormatSpecifier,
    symbol: market ? getSharedProductMetadata(market.metadata).symbol : '',
    quoteSymbol:
      productId && allMarkets ? allMarkets.quotes[productId].symbol : '',
  };
}

function mapDepthChartData(
  ticks: EnginePriceTickLiquidity[],
  startPrice: BigNumber,
  priceIncrement: BigNumber,
  isAsk: boolean,
  limit: number,
) {
  let cumulativeBaseSize = BigNumbers.ZERO;
  let cumulativeQuoteSize = BigNumbers.ZERO;
  let currentPrice = startPrice;

  const items: DepthChartItem[] = [];

  for (const tick of ticks) {
    if (items.length === limit) {
      break;
    }

    const decimalAdjustedSize = removeDecimals(tick.liquidity);
    cumulativeBaseSize = cumulativeBaseSize.plus(decimalAdjustedSize);
    cumulativeQuoteSize = cumulativeQuoteSize.plus(
      decimalAdjustedSize.multipliedBy(tick.price),
    );
    currentPrice = tick.price;

    const changeFraction = safeDiv(currentPrice.minus(startPrice), startPrice);

    items.push({
      price: currentPrice.toNumber(),
      cumulativeBidBaseSize: isAsk ? undefined : cumulativeBaseSize.toNumber(),
      cumulativeAskBaseSize: isAsk ? cumulativeBaseSize.toNumber() : undefined,
      cumulativeQuoteSize: cumulativeQuoteSize.toNumber(),
      changeFraction,
    });
  }

  while (items.length < limit) {
    currentPrice = isAsk
      ? currentPrice.plus(priceIncrement)
      : currentPrice.minus(priceIncrement);

    const changeFraction = safeDiv(currentPrice.minus(startPrice), startPrice);

    items.push({
      price: currentPrice.toNumber(),
      cumulativeBidBaseSize: isAsk ? undefined : cumulativeBaseSize.toNumber(),
      cumulativeAskBaseSize: isAsk ? cumulativeBaseSize.toNumber() : undefined,
      cumulativeQuoteSize: cumulativeQuoteSize.toNumber(),
      changeFraction,
    });
  }

  // Return the items in ascending price
  return isAsk ? items : items.reverse();
}
