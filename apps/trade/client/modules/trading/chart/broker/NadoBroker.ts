import {
  addDecimals,
  ProductEngineType,
  removeDecimals,
  toBigNumber,
} from '@nadohq/client';
import {
  calcIsoOrderRequiredMargin,
  toXStocksDisplayAmount,
  toXStocksDisplayPrice,
} from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import {
  ExecutePlaceEngineOrderParams,
  ExecutePlaceOrderCommonParams,
  ExecutePlaceOrderIsolatedParams,
  ExecutePlaceOrderParams,
  ExecutePlacePriceTriggerOrderParams,
} from 'client/hooks/execute/placeOrder/types';
import { getMarketOrderExecutionPrice } from 'client/hooks/execute/util/getMarketOrderExecutionPrice';
import { TradingViewSymbolInfo } from 'client/modules/trading/chart/config/datafeedConfig';
import { NadoBrokerDeps } from 'client/modules/trading/chart/types';
import { getOrderSlippageMultiplier } from 'client/modules/trading/utils/getOrderSlippageMultiplier';
import { getOraclePriceTriggerType } from 'client/modules/trading/utils/trigger/getOraclePriceTriggerType';
import { getSharedProductMetadata } from 'client/utils/getSharedProductMetadata';
import {
  ConnectionStatus,
  OrderType,
  Side,
  type AccountId,
  type AccountManagerInfo,
  type AccountMetainfo,
  type ActionMetaInfo,
  type ConnectionStatus as ConnectionStatusType,
  type DefaultContextMenuActionsParams,
  type Execution,
  type IBrokerConnectionAdapterHost,
  type IBrokerTerminal,
  type InstrumentInfo,
  type IsTradableResult,
  type Order,
  type PlaceOrderResult,
  type PreOrder,
  type TradeContext,
} from 'public/charting_library';
import type { RefObject } from 'react';

/**
 * Wires TradingView's Order Panel and Buy/Sell buttons into our placeOrder
 * mutation. Order/position/liquidation lines are still drawn by the legacy
 * hand-drawn hooks (useDrawChartOrderLines, useDrawChartPositionLines); the
 * broker intentionally does not surface orders/positions to TV here so those
 * hooks remain the single source of truth on the chart. Migrating line
 * rendering to the Broker API is tracked as a separate follow-up.
 */
export class NadoBroker implements IBrokerTerminal {
  private readonly host: IBrokerConnectionAdapterHost;
  private readonly depsRef: RefObject<NadoBrokerDeps>;

  constructor(
    host: IBrokerConnectionAdapterHost,
    depsRef: RefObject<NadoBrokerDeps>,
  ) {
    this.host = host;
    this.depsRef = depsRef;
  }

  private get deps(): NadoBrokerDeps {
    return this.depsRef.current;
  }

  // ---------------------------------------------------------------------------
  // Connection / Account
  //
  // Account-related methods are stubs. We don't expose multiple accounts to TV
  // (no setCurrentAccount, no AccountManager widget) — the broker just tracks
  // whatever subaccount the rest of the app has selected via the React deps
  // ref, so its placeOrder mutation already targets the right subaccount.
  // The values returned here are only used for TV's internal bookkeeping
  // (keying its own orders/positions cache) and don't appear in the UI.
  // ---------------------------------------------------------------------------

  // Always return Connected — per TV docs, anything else makes the Account
  // Manager spin forever and logs a "not properly implemented" warning. We
  // gate trading through `isTradable()` instead, which the deps ref keeps
  // fresh on wallet changes (no host push needed).
  connectionStatus(): ConnectionStatusType {
    return ConnectionStatus.Connected;
  }

  currentAccount(): AccountId {
    // Wallet address (not subaccount hex) is sufficient since TV never sees
    // multiple accounts in this integration.
    return (this.deps.address ?? '') as AccountId;
  }

  async accountsMetainfo(): Promise<AccountMetainfo[]> {
    return [
      {
        id: (this.deps.address ?? '') as AccountId,
        name: this.deps.t(($) => $.tradingChart.broker.tradingAccount),
      },
    ];
  }

  // ---------------------------------------------------------------------------
  // Trading info
  // ---------------------------------------------------------------------------

  // Symbol must exist; if no wallet is connected we mark the symbol
  // non-tradable and return an `IsTradableResult` so TV renders our inline
  // "connect wallet" copy in the Order Ticket / legend instead of its default
  // "Non-tradable symbol" modal. We only gate on `address` here — other
  // user-state errors (chain, deposit, 1CT) are still surfaced by the side
  // panel CTA, and the chart's order ticket has no click handler to drive
  // those flows.
  async isTradable(symbol: string): Promise<boolean | IsTradableResult> {
    if (!this.getSymbolInfo(symbol)) {
      return false;
    }
    if (!this.deps.address) {
      const reason = this.deps.t(
        ($) => $.tradingChart.broker.notTradableReason,
      );
      return {
        tradable: false,
        reason,
        shortReason: reason,
      };
    }
    return true;
  }

  async symbolInfo(symbol: string): Promise<InstrumentInfo> {
    const symbolInfo = this.getSymbolInfo(symbol);
    if (!symbolInfo) {
      throw new Error(`No market data for symbol: ${symbol}`);
    }
    const { marketData, quoteSymbol, exchangeRate } = symbolInfo;

    // TV operates in display (QQQx) space — for non-xStocks markets the
    // exchange rate is 1 so these toXStocks* calls are no-ops.
    const priceIncrement = toXStocksDisplayPrice(
      marketData.priceIncrement,
      exchangeRate,
    ).toNumber();
    const sizeIncrement = removeDecimals(
      toXStocksDisplayAmount(marketData.sizeIncrement, exchangeRate),
    );
    const baseSymbol = getSharedProductMetadata(marketData.metadata).symbol;

    return {
      qty: {
        // TV's InstrumentInfo only supports a single qty.min. Use the looser
        // market-order min (size tick) so legitimate sub-notional market
        // orders aren't blocked at the UI; the engine rejects under-notional
        // limit orders server-side.
        min: sizeIncrement.toNumber(),
        // TV requires a number here; account-level max is enforced by the
        // engine on placement, so use MAX_SAFE_INTEGER to avoid blocking
        // legitimate large orders at the UI layer.
        max: Number.MAX_SAFE_INTEGER,
        step: sizeIncrement.toNumber(),
      },
      // pipSize and minTick both describe the smallest price increment;
      // pipSize is used by the order ticket display, minTick is what TV
      // snaps the price field to. pipValue is the account-currency value of
      // one pip — for our linear contracts (qty in base, price in quote),
      // 1 pip × 1 unit = priceIncrement, so they happen to match.
      pipValue: priceIncrement,
      pipSize: priceIncrement,
      minTick: priceIncrement,
      description: marketData.metadata.marketName,
      // Order Ticket header (brokerSymbol) and Buy/Sell button label
      // (currency) — without these TV falls back to the raw symbol
      // (productId), e.g. "Buy 0.0013 2 MARKET" instead of "Buy 0.0013 BTC MARKET".
      brokerSymbol: marketData.metadata.marketName,
      currency: baseSymbol,
      baseCurrency: baseSymbol,
      quoteCurrency: quoteSymbol,
      allowedOrderTypes: [
        OrderType.Market,
        OrderType.Limit,
        OrderType.Stop,
        OrderType.StopLimit,
      ],
    };
  }

  // ---------------------------------------------------------------------------
  // Orders — broker does not surface order lines; the legacy hand-drawn
  // hooks own that visualization. orders() returns [] and modify/cancel are
  // unreachable stubs (TV only invokes them for orders the broker returned).
  // ---------------------------------------------------------------------------

  async orders(): Promise<Order[]> {
    return [];
  }

  async placeOrder(preOrder: PreOrder): Promise<PlaceOrderResult> {
    const params = this.mapPreOrderToPlaceParams(preOrder);

    this.deps.dispatchNotification({
      type: 'action_error_handler',
      data: {
        executionData: { serverExecutionResult: this.deps.placeOrder(params) },
        errorNotificationTitle: this.deps.t(
          ($) => $.tradingChart.broker.placeOrderFailed,
        ),
      },
    });

    return {};
  }

  async modifyOrder(_order: Order): Promise<void> {
    // Unreachable: orders() returns [] so TV never has a broker-managed order
    // to modify. Required by IBrokerTerminal.
    throw new Error('NadoBroker.modifyOrder is not supported');
  }

  async cancelOrder(_orderId: string): Promise<void> {
    // Unreachable: see modifyOrder.
    throw new Error('NadoBroker.cancelOrder is not supported');
  }

  // ---------------------------------------------------------------------------
  // Context menu / Account Manager (stubs — Account Manager is disabled by
  // widget config; the context menu falls through to TV defaults).
  // ---------------------------------------------------------------------------

  async chartContextMenuActions(
    context: TradeContext,
    options?: DefaultContextMenuActionsParams,
  ): Promise<ActionMetaInfo[]> {
    return this.host.defaultContextMenuActions(context, options);
  }

  // Required by IBrokerTerminal even though the AccountManager widget is
  // disabled in BROKER_CONFIG — TV still calls this once during init. Empty
  // arrays are valid because nothing renders.
  accountManagerInfo(): AccountManagerInfo {
    return {
      accountTitle: 'Nado',
      summary: [],
      orderColumns: [],
      pages: [],
    };
  }

  async executions(_symbol: string): Promise<Execution[]> {
    // Fill arrows are produced by `datafeed.getMarks`; supportExecutions:false
    // in BROKER_CONFIG keeps TV from invoking this.
    return [];
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  // The TradingView widget keys symbols by stringified productId (see
  // datafeedConfig.getTradingViewSymbolInfo), so the productId int round-trips
  // unchanged here. Returns undefined for unknown symbols so isTradable can
  // signal "not tradable" cleanly.
  private getSymbolInfo(symbol: string): TradingViewSymbolInfo | undefined {
    return this.deps.symbolInfoByProductId?.[Number(symbol)];
  }

  private getMarketExecutionPrice(
    productId: number,
    isBuy: boolean,
    exchangeRate: BigNumber,
  ): BigNumber {
    const rawPrice = getMarketOrderExecutionPrice({
      isBuy,
      latestMarketPrices: this.deps.latestMarketPrices?.[productId],
      marketSlippageFraction: this.deps.slippageSettings.market,
    });

    if (!rawPrice) {
      throw new Error(`No market price available for product ${productId}`);
    }

    // latestMarketPrices is in raw (wQQQx) space; the rest of the broker
    // pipeline (and usePlaceOrderMutationFn's toRawPrice) operates on
    // display values, so convert here. No-op for non-xStocks markets.
    return toXStocksDisplayPrice(rawPrice, exchangeRate);
  }

  // Converts a TradingView PreOrder into our ExecutePlaceOrderParams shape.
  // Centralizes all order-shape logic (slippage prices, trigger criteria,
  // required-field validation) so placeOrder is a thin wrapper.
  private mapPreOrderToPlaceParams(
    preOrder: PreOrder,
  ): ExecutePlaceOrderParams {
    const symbolInfo = this.getSymbolInfo(preOrder.symbol);
    if (!symbolInfo) {
      throw new Error(`Unknown symbol: ${preOrder.symbol}`);
    }

    const productId = symbolInfo.marketData.productId;
    const isBuy = preOrder.side === Side.Buy;
    const sideMultiplier = isBuy ? 1 : -1;
    // usePlaceOrderMutationFn expects fixed-point amounts (× 10^18); TV's qty
    // is always positive, so encode the side via the amount sign.
    const amount = addDecimals(
      toBigNumber(preOrder.qty).multipliedBy(sideMultiplier),
    );

    // Common fields shared across all order types — pulls in the persisted
    // spot-margin and perp iso/cross settings from the side order panel so
    // chart placement honors the same user state without on-chart toggles.
    const sharedParams = this.buildSharedOrderParams(
      symbolInfo,
      isBuy,
      amount,
      preOrder,
    );

    // TV's PreOrder values (qty, limitPrice, stopPrice) and our derived
    // amount/prices are all in display (QQQx) space — usePlaceOrderMutationFn
    // converts them back to raw (wQQQx) before sending to the engine. No-op
    // for non-xStocks markets.
    switch (preOrder.type) {
      case OrderType.Market: {
        return {
          ...sharedParams,
          price: this.getMarketExecutionPrice(
            productId,
            isBuy,
            symbolInfo.exchangeRate,
          ),
          orderType: 'market',
        } satisfies ExecutePlaceEngineOrderParams;
      }
      case OrderType.Limit: {
        if (preOrder.limitPrice == null) {
          throw new Error('Limit order missing limitPrice');
        }
        return {
          ...sharedParams,
          price: toBigNumber(preOrder.limitPrice),
          orderType: 'limit',
        } satisfies ExecutePlaceEngineOrderParams;
      }
      case OrderType.Stop: {
        if (preOrder.stopPrice == null) {
          throw new Error('Stop order missing stopPrice');
        }
        const triggerPrice = toBigNumber(preOrder.stopPrice);
        return {
          ...sharedParams,
          // Stop-market: place at trigger × slippage so the engine has a
          // worst-acceptable fill price when the trigger fires.
          price: triggerPrice.times(
            getOrderSlippageMultiplier(
              isBuy,
              this.deps.slippageSettings.stopMarket,
            ),
          ),
          orderType: 'stop_market',
          priceTriggerCriteria: {
            type: this.getStopOrderPriceTriggerType(
              productId,
              triggerPrice,
              symbolInfo.exchangeRate,
            ),
            triggerPrice,
          },
        } satisfies ExecutePlacePriceTriggerOrderParams;
      }
      case OrderType.StopLimit: {
        if (preOrder.stopPrice == null) {
          throw new Error('StopLimit order missing stopPrice');
        }
        if (preOrder.limitPrice == null) {
          throw new Error('StopLimit order missing limitPrice');
        }
        const triggerPrice = toBigNumber(preOrder.stopPrice);
        return {
          ...sharedParams,
          price: toBigNumber(preOrder.limitPrice),
          orderType: 'stop_limit',
          priceTriggerCriteria: {
            type: this.getStopOrderPriceTriggerType(
              productId,
              triggerPrice,
              symbolInfo.exchangeRate,
            ),
            triggerPrice,
          },
        } satisfies ExecutePlacePriceTriggerOrderParams;
      }
    }
  }

  // Builds the productId/amount/spotLeverage/iso fields shared across all
  // order types. Mirrors the `commonOrderParams` block in
  // `useOrderFormSubmitHandler` so chart-placed orders pick up the same
  // persisted spot-margin and perp iso/cross settings.
  //
  // Returns just the common subset; per-order-type fields (`price`,
  // `orderType`, `priceTriggerCriteria`) are spread on by the caller.
  private buildSharedOrderParams(
    symbolInfo: TradingViewSymbolInfo,
    isBuy: boolean,
    amount: BigNumber,
    preOrder: PreOrder,
  ): Omit<ExecutePlaceOrderCommonParams, 'price'> {
    const { marketData } = symbolInfo;
    const productId = marketData.productId;
    const isSpot = marketData.type === ProductEngineType.SPOT;
    const isPerp = marketData.type === ProductEngineType.PERP;

    // Spot: pass through the persisted toggle so chart-placed spot orders
    // can borrow when the user has enabled spot margin in the order panel.
    const spotLeverage = isSpot ? this.deps.spotLeverageEnabled : undefined;

    // Perp: replicate the iso branch of useOrderFormSubmitHandler so the
    // engine receives `iso.margin` + `iso.borrowMargin` whenever the user
    // has selected isolated margin for this product. Cross orders set no
    // `iso` field — cross leverage is a UI-side max-size guardrail and is
    // not consumed by the engine.
    const iso = isPerp
      ? this.buildIsolatedParams(
          marketData,
          isBuy,
          amount,
          preOrder,
          symbolInfo.exchangeRate,
        )
      : undefined;

    return {
      productId,
      amount,
      spotLeverage,
      iso,
    };
  }

  // Builds `iso.margin` + `iso.borrowMargin` for a perp order when the
  // user's persisted margin mode for this product is isolated. Returns
  // undefined for cross / unknown products so the order falls back to the
  // cross subaccount.
  //
  // Mirrors the iso branch of `useOrderFormSubmitHandler` (input
  // conversion price, oracle-price taker adjustment, reduce-only borrow
  // suppression).
  private buildIsolatedParams(
    marketData: TradingViewSymbolInfo['marketData'],
    isBuy: boolean,
    amount: BigNumber,
    preOrder: PreOrder,
    exchangeRate: BigNumber,
  ): ExecutePlaceOrderIsolatedParams | undefined {
    if (marketData.type !== ProductEngineType.PERP) {
      return undefined;
    }
    const productId = marketData.productId;
    const marginMode = this.deps.getPerpMarginMode(productId);
    if (!marginMode || marginMode.mode !== 'isolated') {
      return undefined;
    }

    const inputConversionPrice = this.getInputConversionPrice(
      productId,
      isBuy,
      preOrder,
      exchangeRate,
    );
    if (!inputConversionPrice) {
      throw new Error(
        `No price available to calculate isolated margin for product ${productId}`,
      );
    }

    const isReducingIsoPosition = this.isReducingIsoPosition(productId, isBuy);
    // Match useOrderFormSubmitHandler: reducing an iso position never
    // borrows; otherwise honor the user's `enableBorrows` setting.
    const borrowMargin = isReducingIsoPosition
      ? false
      : (marginMode.enableBorrows ?? false);

    const margin = calcIsoOrderRequiredMargin({
      isMarketOrder: preOrder.type === OrderType.Market,
      leverage: marginMode.leverage,
      marketMaxLeverage: marketData.maxLeverage,
      assetAmountWithSign: amount,
      orderPrice: inputConversionPrice,
      oraclePrice: this.deps.latestOraclePrices?.[productId]?.oraclePrice,
      isReducingIsoPosition,
    });

    return { margin, borrowMargin };
  }

  // Mirrors `inputConversionPrice` from `useOrderFormConversionPrices`
  // (the unslipped price the iso margin calc and form validators key off).
  // Limit / StopLimit use the user-entered limit price; Stop uses the
  // trigger price; Market falls back to the top-of-book quote on the
  // user's side (safeAsk for buys, safeBid for sells). All return values
  // are in display (QQQx) space, matching the order form.
  private getInputConversionPrice(
    productId: number,
    isBuy: boolean,
    preOrder: PreOrder,
    exchangeRate: BigNumber,
  ): BigNumber | undefined {
    switch (preOrder.type) {
      case OrderType.Limit:
      case OrderType.StopLimit:
        return preOrder.limitPrice != null
          ? toBigNumber(preOrder.limitPrice)
          : undefined;
      case OrderType.Stop:
        return preOrder.stopPrice != null
          ? toBigNumber(preOrder.stopPrice)
          : undefined;
      case OrderType.Market: {
        const latest = this.deps.latestMarketPrices?.[productId];
        // safeBid/safeAsk are raw (wQQQx); convert to display.
        const rawTopOfBook = isBuy ? latest?.safeAsk : latest?.safeBid;
        return toXStocksDisplayPrice(rawTopOfBook, exchangeRate);
      }
    }
  }

  // Returns true when the order would reduce an existing iso position on
  // this product (long position + sell, or short + buy). Used to suppress
  // borrow + zero out margin transfer in `calcIsoOrderRequiredMargin`,
  // matching the order-form behavior.
  private isReducingIsoPosition(productId: number, isBuy: boolean): boolean {
    const isoPosition = this.deps.perpPositions?.find(
      (pos) => pos.productId === productId && !!pos.iso,
    );
    if (!isoPosition || isoPosition.amount.isZero()) {
      return false;
    }
    const isReducingLong = isoPosition.amount.isPositive() && !isBuy;
    const isReducingShort = isoPosition.amount.isNegative() && isBuy;
    return isReducingLong || isReducingShort;
  }

  // Looks up the market's quote product and asks the shared trigger-type
  // util to derive the oracle-based criterion. Throws if oracle data is
  // missing — propagates to a notification via dispatchNotification.
  private getStopOrderPriceTriggerType(
    productId: number,
    triggerPrice: BigNumber,
    exchangeRate: BigNumber,
  ) {
    const symbolInfo = this.deps.symbolInfoByProductId?.[productId];
    const quoteProductId = symbolInfo?.marketData.metadata.quoteProductId;
    if (quoteProductId == null) {
      throw new Error(`No quote product for product ${productId}`);
    }

    const triggerType = getOraclePriceTriggerType({
      triggerPrice,
      productId,
      quoteProductId,
      latestOraclePrices: this.deps.latestOraclePrices,
      exchangeRate,
    });
    if (!triggerType) {
      throw new Error(`No oracle price available for product ${productId}`);
    }
    return triggerType;
  }
}
