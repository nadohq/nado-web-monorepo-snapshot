import {
  BigNumbers,
  EnginePriceTickLiquidity,
  removeDecimals,
} from '@nadohq/client';
import {
  getMarketPriceFormatSpecifier,
  getMarketSizeFormatSpecifier,
  safeDiv,
  toXStocksDisplayAmount,
  toXStocksDisplayPrice,
} from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { useMarket } from 'client/hooks/markets/useMarket';
import { useQueryMarketLiquidity } from 'client/hooks/query/markets/useQueryMarketLiquidity';
import { useGetXStocksExchangeRate } from 'client/modules/xStocks/hooks/useGetXStocksExchangeRate';
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
  const { getExchangeRate } = useGetXStocksExchangeRate();

  const chartData = useMemo(() => {
    if (!liquidityQueryData || !market) {
      return [];
    }

    const exchangeRate = getExchangeRate(market.productId);

    // Data starts from the top-of-book price, so the first item is the lowest ask / highest bid
    const { asks, bids } = liquidityQueryData;

    const highestBidPrice = first(bids)?.price;
    const lowestAskPrice = first(asks)?.price;

    const mappedBids = mapDepthChartData({
      ticks: bids,
      // If one side of the book doesn't exist, we still need `limit` number of data points starting from an appropriate number (either the other side of the book, or a default of 0)
      startPrice: highestBidPrice ?? lowestAskPrice ?? BigNumbers.ZERO,
      priceIncrement: market.priceIncrement,
      isAsk: false,
      limit,
      exchangeRate,
    });
    const mappedAsks = mapDepthChartData({
      ticks: asks,
      startPrice: lowestAskPrice ?? highestBidPrice ?? BigNumbers.ZERO,
      priceIncrement: market.priceIncrement,
      isAsk: true,
      limit,
      exchangeRate,
    });

    return [...mappedBids, ...mappedAsks];
  }, [liquidityQueryData, limit, market, getExchangeRate]);

  const exchangeRate = getExchangeRate(market?.productId);

  const priceFormatSpecifier = getMarketPriceFormatSpecifier({
    priceIncrement: market?.priceIncrement,
    exchangeRate,
  });

  const sizeFormatSpecifier = getMarketSizeFormatSpecifier({
    sizeIncrement: market?.sizeIncrement,
    exchangeRate,
  });

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

interface MapDepthChartDataParams {
  ticks: EnginePriceTickLiquidity[];
  startPrice: BigNumber;
  priceIncrement: BigNumber;
  isAsk: boolean;
  limit: number;
  exchangeRate: BigNumber;
}

function mapDepthChartData({
  ticks,
  startPrice,
  priceIncrement,
  isAsk,
  limit,
  exchangeRate,
}: MapDepthChartDataParams) {
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

    // changeFraction is a ratio of prices — rate cancels out, no conversion needed
    const changeFraction = safeDiv(currentPrice.minus(startPrice), startPrice);

    items.push({
      price: toXStocksDisplayPrice(currentPrice, exchangeRate).toNumber(),
      cumulativeBidBaseSize: isAsk
        ? undefined
        : toXStocksDisplayAmount(cumulativeBaseSize, exchangeRate).toNumber(),
      cumulativeAskBaseSize: isAsk
        ? toXStocksDisplayAmount(cumulativeBaseSize, exchangeRate).toNumber()
        : undefined,
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
      price: toXStocksDisplayPrice(currentPrice, exchangeRate).toNumber(),
      cumulativeBidBaseSize: isAsk
        ? undefined
        : toXStocksDisplayAmount(cumulativeBaseSize, exchangeRate).toNumber(),
      cumulativeAskBaseSize: isAsk
        ? toXStocksDisplayAmount(cumulativeBaseSize, exchangeRate).toNumber()
        : undefined,
      cumulativeQuoteSize: cumulativeQuoteSize.toNumber(),
      changeFraction,
    });
  }

  // Return the items in ascending price
  return isAsk ? items : items.reverse();
}
