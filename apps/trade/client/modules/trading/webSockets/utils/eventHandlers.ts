import {
  ChainEnv,
  EnginePriceTickLiquidity,
  removeDecimals,
  toBigNumber,
} from '@nadohq/client';
import { QueryClient } from '@tanstack/react-query';
import safeStringify from 'safe-stable-stringify';

import {
  LATEST_ORDER_FILLS_LIMIT,
  LatestOrderFill,
  latestOrderFillsForProductQueryKey,
} from 'client/hooks/query/markets/useQueryLatestOrderFillsForProduct';
import {
  MarketLiquidityData,
  marketLiquidityQueryKey,
} from 'client/hooks/query/markets/useQueryMarketLiquidity';
import {
  BatchBookDepthUpdateData,
  BatchMarketTradeUpdateData,
} from 'client/modules/trading/webSockets/types';

import { first, uniqueId } from 'lodash';

function updateBookTicks(
  prevTicks: EnginePriceTickLiquidity[],
  updates: EnginePriceTickLiquidity[],
  isBid: boolean,
): EnginePriceTickLiquidity[] {
  const ticks = [...prevTicks];
  updates.forEach((update) => {
    const existingTickIndex = ticks.findIndex((tick) =>
      tick.price.eq(update.price),
    );
    if (existingTickIndex !== -1) {
      // Replace existingTick with update - do not mutate existingTick's liquidity in place!
      // Mutating in-place does not play well with TanStack Query's structural sharing
      // See https://tanstack.com/query/v5/docs/framework/react/guides/render-optimizations#structural-sharing
      ticks[existingTickIndex] = update;
    } else {
      // This is out of order, but we're sorting at the end
      ticks.push(update);
    }
  });

  return (
    ticks
      // Filter ticks that are now gone
      .filter((tick) => tick.liquidity.gt(0))
      .sort((a, b) => {
        // Bids in descending, asks in ascending, so flip the comparison if bid
        const multiplier = isBid ? -1 : 1;
        const comparisonResult = a.price.comparedTo(b.price);
        if (comparisonResult === null) {
          return 0; // One or both of the prices are NaN
        }
        return comparisonResult * multiplier;
      })
  );
}

export function handleBatchedMarketTradeEvents(
  chainEnv: ChainEnv,
  batchedUpdateData: BatchMarketTradeUpdateData,
  productId: number,
  queryClient: QueryClient,
) {
  const hasUpdates = batchedUpdateData.length > 0;
  if (!hasUpdates) {
    return;
  }

  // The unfortunate thing here is that if a fetch happens in the useLatestOrderFills query, the more up to date data (from WS)
  // will be wiped out. Indexer is always _slightly_ behind WS, so it's going to miss the latest fill.
  queryClient.setQueriesData<LatestOrderFill[]>(
    { queryKey: latestOrderFillsForProductQueryKey(chainEnv, productId) },
    (prev) => {
      if (!prev) {
        // Skip updates if there's no previous data
        return prev;
      }

      const newFills = batchedUpdateData.map((event): LatestOrderFill => {
        return {
          // Subscription events don't give digest / submission index, so use JSON of the entire event - this should be unique in most circumstances
          // but there are noticeable cases where these are the same, so prefix with a unique ID
          id: `${uniqueId()}_${safeStringify(event)}`,
          // Adjust to negative amount if the taker is the seller
          amount: toBigNumber(event.taker_qty).multipliedBy(
            event.is_taker_buyer ? 1 : -1,
          ),
          price: removeDecimals(event.price),
          // Event timestamp is in nanoseconds, so convert to seconds to be the same as order fills REST API data
          timestamp: toBigNumber(event.timestamp).div(1e9).toNumber(),
        };
      });

      // Return the new & prev trades trimmed to the limit, data is in descending order.
      return [...newFills, ...prev].slice(0, LATEST_ORDER_FILLS_LIMIT);
    },
  );
}

export function handleBatchedBookDepthEvents(
  chainEnv: ChainEnv,
  batchedUpdateData: BatchBookDepthUpdateData,
  productId: number,
  queryClient: QueryClient,
) {
  const bidUpdateEvents = Object.values(batchedUpdateData.bids);
  const askUpdateEvents = Object.values(batchedUpdateData.asks);

  const hasUpdates = bidUpdateEvents.length > 0 || askUpdateEvents.length > 0;
  if (!hasUpdates) {
    return;
  }

  queryClient.setQueriesData<MarketLiquidityData>(
    { queryKey: marketLiquidityQueryKey(chainEnv, productId) },
    (prev) => {
      if (!prev) {
        // Skip updates if there's no previous data
        return prev;
      }

      const bidUpdates: EnginePriceTickLiquidity[] = bidUpdateEvents.map(
        ([priceX18, size]): EnginePriceTickLiquidity => {
          return {
            price: removeDecimals(priceX18),
            liquidity: toBigNumber(size),
          };
        },
      );
      const askUpdates: EnginePriceTickLiquidity[] = askUpdateEvents.map(
        ([priceX18, size]): EnginePriceTickLiquidity => {
          return {
            price: removeDecimals(priceX18),
            liquidity: toBigNumber(size),
          };
        },
      );

      const newBids = updateBookTicks(prev.bids, bidUpdates, true);
      const newAsks = updateBookTicks(prev.asks, askUpdates, false);

      const firstBid = first(newBids);
      const firstAsk = first(newAsks);

      // Sanity check for crossed book, in case of existing stale query data
      if (firstBid && firstAsk && firstBid.price.gt(firstAsk.price)) {
        console.warn(
          '[useTradingWebSocketSubscriptions] Encountered crossed book, invalidating queries',
          productId,
        );
        queryClient.invalidateQueries(
          { queryKey: marketLiquidityQueryKey(chainEnv, productId) },
          {
            // This guards against multiple overriding invalidations when fast websocket updates occur and book is
            // out of sync. If the underlying REST query is slow to update query data, then invalidation will occur multiple
            // times. This skips subsequent invalidation calls
            cancelRefetch: false,
          },
        );
        return;
      }

      return { bids: newBids, asks: newAsks };
    },
  );
}
