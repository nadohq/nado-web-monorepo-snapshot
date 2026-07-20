import { IndexerOraclePrice } from '@nadohq/client';
import { ExecutePlaceOrderParams } from 'client/hooks/execute/placeOrder/types';
import { AllLatestMarketPricesData } from 'client/hooks/query/markets/useQueryAllMarketsLatestPrices';
import { PerpPositionItem } from 'client/hooks/subaccount/usePerpPositions';
import {
  MarginMode,
  OrderSlippageSettings,
} from 'client/modules/localstorage/userState/types/tradingSettings';
import { DispatchNotificationParams } from 'client/modules/notifications/types';
import { TradingViewSymbolInfo } from 'client/modules/trading/chart/config/datafeedConfig';
import type { TFunction } from 'i18next';
import type {
  IBasicDataFeed,
  IDatafeedQuotesApi,
} from 'public/charting_library';

export type TradingViewDataFeed = IBasicDataFeed & IDatafeedQuotesApi;

/**
 * React-sourced dependencies the NadoBroker reads on every Broker API call.
 * Provided through a mutable ref so the broker always sees the latest
 * query data, mutations, and settings without re-instantiating.
 */
export interface NadoBrokerDeps {
  address: string | undefined;
  // Single TV-keyed product map. Carries StaticMarketData + quote symbol so
  // the broker doesn't need a second copy of allMarketsStaticData.
  symbolInfoByProductId: Record<number, TradingViewSymbolInfo> | undefined;
  latestMarketPrices: AllLatestMarketPricesData | undefined;
  // Used to derive the price-trigger criterion (above/below) — backend
  // evaluates triggers against oracle prices, so the client-side direction
  // check must too. Mid-price would diverge in volatile markets.
  latestOraclePrices: Record<number, IndexerOraclePrice> | undefined;
  slippageSettings: OrderSlippageSettings;
  // Persisted spot-margin (cross-borrow) toggle. Mirrors the SpotMarginSwitch
  // in the side order placement panel so chart-placed spot orders honor the
  // same setting without surfacing the toggle on the chart.
  spotLeverageEnabled: boolean;
  // Resolves the user's persisted iso/cross + leverage selection for a
  // perp product. Returns undefined for non-perp / unknown products. Built
  // in useBrokerDependencies via the shared `resolvePerpMarginMode` helper.
  getPerpMarginMode: (productId: number) => MarginMode | undefined;
  // Latest perp positions list — used to decide `isReducingIsoPosition`
  // for the iso margin calculation, mirroring `useOrderFormSubmitHandler`.
  perpPositions: PerpPositionItem[] | undefined;
  placeOrder: (params: ExecutePlaceOrderParams) => Promise<unknown>;
  dispatchNotification: (params: DispatchNotificationParams) => void;
  t: TFunction;
}
