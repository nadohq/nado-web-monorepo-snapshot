import { SingleBrokerMetaInfo } from 'public/charting_library';

/**
 * Declares which Broker API features the NadoBroker supports.
 *
 * Scope is intentionally narrow: only the Order Panel + Buy/Sell buttons go
 * through the broker (placeOrder). Order, position, and liquidation lines
 * remain hand-drawn via the legacy useDrawChart* hooks. Migrating those to
 * the Broker API is a separate follow-up.
 */
export const BROKER_CONFIG: SingleBrokerMetaInfo = {
  configFlags: {
    supportMarketOrders: true,
    supportLimitOrders: true,
    supportStopOrders: true,
    supportStopLimitOrders: true,
    // Position/bracket UX is owned by the legacy hand-drawn hooks today.
    supportPositions: false,
    supportClosePosition: false,
    supportPartialClosePosition: false,
    supportReversePosition: false,
    supportNativeReversePosition: false,
    supportPLUpdate: false,
    supportEditAmount: false,
    supportPositionBrackets: false,
    supportOrderBrackets: false,
    supportMarketBrackets: false,
    supportOrdersHistory: false,
    supportPositionNetting: false,
    supportLevel2Data: false,
    supportLeverage: false,
    supportPlaceOrderPreview: false,
    supportModifyOrderPreview: false,
    // Fill arrows come from datafeed.getMarks (bar-level glyphs); this keeps
    // TV from also calling broker.executions and double-rendering them.
    supportExecutions: false,
    supportMultipleExitLevels: false,
  },
};
