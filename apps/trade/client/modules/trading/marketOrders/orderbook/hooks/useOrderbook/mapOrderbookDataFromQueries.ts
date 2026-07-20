import {
  BigNumbers,
  EnginePriceTickLiquidity,
  removeDecimals,
} from '@nadohq/client';
import {
  AnnotatedMarket,
  toXStocksDisplayAmount,
  toXStocksDisplayPrice,
} from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { MarketLiquidityData } from 'client/hooks/query/markets/useQueryMarketLiquidity';
import {
  OrderbookData,
  OrderbookRowItem,
} from 'client/modules/trading/marketOrders/orderbook/hooks/types';
import { getTickPriceLevel } from 'client/modules/trading/marketOrders/orderbook/hooks/useOrderbook/getTickPriceLevel';
import { getIsHighSpread } from 'client/modules/trading/utils/getIsHighSpread';
import { getSharedProductMetadata } from 'client/utils/getSharedProductMetadata';
import { first, last } from 'lodash';

interface ProcessTicksParams {
  isAsk: boolean;
  showOrderbookTotalInQuote: boolean;
  ticksData: EnginePriceTickLiquidity[];
  tickSpacing: number;
  depth: number;
  exchangeRate: BigNumber;
}

/**
 * Helper function to process bid or ask data
 */
function processTicks({
  isAsk,
  showOrderbookTotalInQuote,
  ticksData,
  tickSpacing,
  depth,
  exchangeRate,
}: ProcessTicksParams) {
  let cumulativeBaseAmount = BigNumbers.ZERO;
  let cumulativeQuoteAmount = BigNumbers.ZERO;
  const ticks: OrderbookRowItem[] = [];

  for (const priceTickData of ticksData) {
    // Convert to display space first so bucketing happens in display units.
    // This ensures the depth limit and price comparisons are in the same space as what the UI renders.
    const displayTickPrice = toXStocksDisplayPrice(
      priceTickData.price,
      exchangeRate,
    );
    const displayAssetLiquidity = toXStocksDisplayAmount(
      removeDecimals(priceTickData.liquidity),
      exchangeRate,
    );

    const priceLevel = getTickPriceLevel({
      isAsk,
      price: displayTickPrice,
      tickSpacing,
    });

    if (!last(ticks)?.price.eq(priceLevel)) {
      if (ticks.length === depth) {
        // We already processed up to the desired depth, stop processing further
        break;
      }

      // Create a new level
      ticks.push({
        isAsk,
        price: priceLevel,
        assetAmount: BigNumbers.ZERO,
        // Display total follows the user's base/quote toggle; derived from the
        // always-on accumulators rather than tracked as a separate running total.
        cumulativeAmount: showOrderbookTotalInQuote
          ? cumulativeQuoteAmount
          : cumulativeBaseAmount,
        cumulativeBaseAmount,
        cumulativeQuoteAmount,
      });
    }

    // Quote-denominated cumulative: displayAmount × displayPrice = rawAmount × rawPrice (rate cancels)
    const quoteLiquidity = displayAssetLiquidity.multipliedBy(displayTickPrice);

    cumulativeBaseAmount = cumulativeBaseAmount.plus(displayAssetLiquidity);
    cumulativeQuoteAmount = cumulativeQuoteAmount.plus(quoteLiquidity);

    // Add to existing level
    const currentTick = last(ticks);
    if (currentTick) {
      currentTick.assetAmount = currentTick.assetAmount?.plus(
        displayAssetLiquidity,
      );
      currentTick.cumulativeBaseAmount = currentTick.cumulativeBaseAmount.plus(
        displayAssetLiquidity,
      );
      currentTick.cumulativeQuoteAmount =
        currentTick.cumulativeQuoteAmount.plus(quoteLiquidity);
      currentTick.cumulativeAmount = showOrderbookTotalInQuote
        ? currentTick.cumulativeQuoteAmount
        : currentTick.cumulativeBaseAmount;
    }
  }

  // Ticks are already in display space — no conversion needed.
  return {
    ticks,
    cumulativeAmount: showOrderbookTotalInQuote
      ? cumulativeQuoteAmount
      : cumulativeBaseAmount,
  };
}

interface MapOrderbookDataFromQueriesParams {
  /** The depth of the orderbook */
  depth: number;
  /** The liquidity query data */
  liquidityQueryData: MarketLiquidityData;
  /** Whether to show totals in quote currency */
  showOrderbookTotalInQuote: boolean;
  /** The quote currency symbol */
  quoteSymbol: string;
  /** The tick spacing configuration */
  tickSpacing: number;
  /** The market data */
  marketData: AnnotatedMarket;
  /** xStocks exchange rate — 1 for non-xStocks markets, making conversions a no-op */
  exchangeRate: BigNumber;
}

/**
 * Util function to map query data to orderbook data
 * @param params Configuration object with orderbook parameters
 * @returns Mapped orderbook data
 */
export function mapOrderbookDataFromQueries({
  depth,
  showOrderbookTotalInQuote,
  quoteSymbol,
  tickSpacing,
  marketData,
  liquidityQueryData,
  exchangeRate,
}: MapOrderbookDataFromQueriesParams): OrderbookData {
  const sharedProductMetadata = getSharedProductMetadata(marketData.metadata);

  const { bids: bidsData, asks: asksData } = liquidityQueryData;

  // Convert top-of-book prices to display space for spread calculation.
  const rawBidPrice = first(bidsData)?.price ?? BigNumbers.ZERO;
  const rawAskPrice = first(asksData)?.price ?? BigNumbers.ZERO;
  const displayBidPrice = toXStocksDisplayPrice(rawBidPrice, exchangeRate);
  const displayAskPrice = toXStocksDisplayPrice(rawAskPrice, exchangeRate);
  const spreadAmount = displayAskPrice.minus(displayBidPrice);
  const bidAskAvg = displayBidPrice.div(2).plus(displayAskPrice.div(2));

  // Process bids
  const { ticks: bids, cumulativeAmount: bidCumulativeAmount } = processTicks({
    isAsk: false,
    showOrderbookTotalInQuote,
    ticksData: bidsData,
    tickSpacing,
    depth,
    exchangeRate,
  });

  // Process asks
  const { ticks: asks, cumulativeAmount: askCumulativeAmount } = processTicks({
    isAsk: true,
    showOrderbookTotalInQuote,
    ticksData: asksData,
    tickSpacing,
    depth,
    exchangeRate,
  });

  const spreadFrac = bidAskAvg.eq(0)
    ? BigNumbers.ZERO
    : spreadAmount.div(bidAskAvg);

  // Cumulative amounts are already in display space from processTicks
  const maxCumulativeTotalAmount = BigNumber.max(
    bidCumulativeAmount,
    askCumulativeAmount,
  );

  return {
    productMetadata: sharedProductMetadata,
    maxCumulativeTotalAmount,
    quoteSymbol,
    asks,
    bids,
    spread: {
      amount: spreadAmount,
      frac: spreadFrac,
      // frac is a ratio of prices, scale-invariant — same in raw or display space
      isHigh: getIsHighSpread(spreadFrac),
    },
    sizeIncrement: marketData.sizeIncrement,
  };
}
