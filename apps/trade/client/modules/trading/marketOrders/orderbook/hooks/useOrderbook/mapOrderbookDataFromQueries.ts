import {
  BigNumbers,
  EnginePriceTickLiquidity,
  removeDecimals,
} from '@nadohq/client';
import { AnnotatedMarket } from '@nadohq/react-client';
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
}: ProcessTicksParams) {
  let cumulativeAmount = BigNumbers.ZERO;
  const ticks: OrderbookRowItem[] = [];

  for (const priceTickData of ticksData) {
    const tickPrice = priceTickData.price;
    const priceLevel = getTickPriceLevel({
      isAsk,
      price: tickPrice,
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
        cumulativeAmount,
      });
    }

    const decimalAdjustedAssetLiquidity = removeDecimals(
      priceTickData.liquidity,
    );

    cumulativeAmount = cumulativeAmount.plus(
      showOrderbookTotalInQuote
        ? decimalAdjustedAssetLiquidity.multipliedBy(tickPrice)
        : decimalAdjustedAssetLiquidity,
    );

    // Add to existing level
    const currentTick = last(ticks);
    if (currentTick) {
      currentTick.assetAmount = currentTick.assetAmount?.plus(
        decimalAdjustedAssetLiquidity,
      );
      currentTick.cumulativeAmount = currentTick.cumulativeAmount.plus(
        showOrderbookTotalInQuote
          ? decimalAdjustedAssetLiquidity.multipliedBy(tickPrice)
          : decimalAdjustedAssetLiquidity,
      );
    }
  }

  return {
    ticks,
    cumulativeAmount,
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
}: MapOrderbookDataFromQueriesParams): OrderbookData {
  const sharedProductMetadata = getSharedProductMetadata(marketData.metadata);

  const { bids: bidsData, asks: asksData } = liquidityQueryData;

  const bidPrice = first(bidsData)?.price ?? BigNumbers.ZERO;
  const askPrice = first(asksData)?.price ?? BigNumbers.ZERO;
  const spreadAmount = askPrice.minus(bidPrice);
  const bidAskAvg = bidPrice.div(2).plus(askPrice.div(2));

  // Process bids
  const { ticks: bids, cumulativeAmount: bidCumulativeAmount } = processTicks({
    isAsk: false,
    showOrderbookTotalInQuote,
    ticksData: bidsData,
    tickSpacing,
    depth,
  });

  // Process asks
  const { ticks: asks, cumulativeAmount: askCumulativeAmount } = processTicks({
    isAsk: true,
    showOrderbookTotalInQuote,
    ticksData: asksData,
    tickSpacing,
    depth,
  });

  const spreadFrac = bidAskAvg.eq(0)
    ? BigNumbers.ZERO
    : spreadAmount.div(bidAskAvg);

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
      isHigh: getIsHighSpread(spreadFrac),
    },
    sizeIncrement: marketData.sizeIncrement,
    priceIncrement: marketData.priceIncrement,
  };
}
