import {
  EngineServerPriceTickLiquidity,
  EngineServerSubscriptionTradeEvent,
} from '@nadohq/client';

export interface BatchBookDepthUpdateData {
  bids: Record<string, EngineServerPriceTickLiquidity>;
  asks: Record<string, EngineServerPriceTickLiquidity>;
}

export type BatchMarketTradeUpdateData = EngineServerSubscriptionTradeEvent[];
