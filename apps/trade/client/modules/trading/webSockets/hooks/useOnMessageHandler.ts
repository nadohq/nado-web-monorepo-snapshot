import {
  EngineServerPriceTickLiquidity,
  EngineServerSubscriptionBookDepthEvent,
  EngineServerSubscriptionTradeEvent,
} from '@nadohq/client';
import { useEVMContext } from '@nadohq/react-client';
import { useQueryClient } from '@tanstack/react-query';
import { useInterval } from 'ahooks';
import {
  BatchBookDepthUpdateData,
  BatchMarketTradeUpdateData,
} from 'client/modules/trading/webSockets/types';
import {
  handleBatchedBookDepthEvents,
  handleBatchedMarketTradeEvents,
} from 'client/modules/trading/webSockets/utils/eventHandlers';
import { getEngineSubscriptionEventData } from 'client/modules/webSockets/utils/getEngineSubscriptionEventData';
import { useCallback, useEffect, useRef } from 'react';

const BATCH_INTERVAL_MS = 400;

interface Params {
  productId?: number;
}

export function useOnMessageHandler({ productId }: Params) {
  const { primaryChainEnv } = useEVMContext();
  const queryClient = useQueryClient();

  // Chunk updates to be processed in batches. Backend can issue updates as frequently as 50ms, and we don't want to run
  // computations every time.
  const batchedBookDepthEventsRef = useRef<BatchBookDepthUpdateData>({
    // This uses a mapping so that subsequent updates in the SAME batch overwrite previous ones of the same price
    // This helps to lower computation
    bids: {},
    asks: {},
  });
  const batchedTradeEventsRef = useRef<BatchMarketTradeUpdateData>([]);

  // Process batches handler
  const processBatches = useCallback(() => {
    if (!productId) {
      return;
    }

    const batchedBookDepthEvents = batchedBookDepthEventsRef.current;
    const batchedTradeEvents = batchedTradeEventsRef.current;

    // Clear first, then process (because processing might take a while)
    batchedBookDepthEventsRef.current = {
      bids: {},
      asks: {},
    };
    batchedTradeEventsRef.current = [];

    handleBatchedBookDepthEvents(
      primaryChainEnv,
      batchedBookDepthEvents,
      productId,
      queryClient,
    );
    handleBatchedMarketTradeEvents(
      primaryChainEnv,
      batchedTradeEvents,
      productId,
      queryClient,
    );
  }, [primaryChainEnv, productId, queryClient]);

  // Clear batches on product ID change
  useEffect(() => {
    batchedBookDepthEventsRef.current = {
      bids: {},
      asks: {},
    };
    batchedTradeEventsRef.current = [];
  }, [productId]);

  // Clear batches on an interval
  useInterval(processBatches, BATCH_INTERVAL_MS);

  // Single event handlers
  const handleBookDepthEvent = useCallback(
    (event: EngineServerSubscriptionBookDepthEvent) => {
      if (!productId) {
        return;
      }
      event.bids.forEach((bid: EngineServerPriceTickLiquidity) => {
        const [priceX18] = bid;
        batchedBookDepthEventsRef.current.bids[priceX18] = bid;
      });
      event.asks.forEach((ask: EngineServerPriceTickLiquidity) => {
        const [priceX18] = ask;
        batchedBookDepthEventsRef.current.asks[priceX18] = ask;
      });
    },
    [productId],
  );

  const handleMarketTradeEvent = useCallback(
    (event: EngineServerSubscriptionTradeEvent) => {
      if (!productId) {
        return;
      }
      // Add to beginning so that the array remains in descending chronological order
      batchedTradeEventsRef.current.unshift(event);
    },
    [productId],
  );

  // Message handler simply adds to batches
  return useCallback(
    (event: MessageEvent<any>) => {
      const data = getEngineSubscriptionEventData(event);

      if (!productId || data?.product_id !== productId) {
        return;
      }

      switch (data?.type) {
        case 'book_depth': {
          handleBookDepthEvent(data);
          break;
        }
        case 'trade': {
          handleMarketTradeEvent(data);
          break;
        }
        default:
          break;
      }
    },
    [handleBookDepthEvent, handleMarketTradeEvent, productId],
  );
}
