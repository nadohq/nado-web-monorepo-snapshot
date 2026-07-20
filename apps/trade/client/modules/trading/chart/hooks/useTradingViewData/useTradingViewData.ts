import {
  asyncResult,
  IndexerMatchEvent,
  removeDecimals,
  toBigNumber,
} from '@nadohq/client';
import {
  calcOrderFillPrice,
  formatNumber,
  getMarketPriceFormatSpecifier,
  getMarketSizeFormatSpecifier,
  toXStocksDisplayAmount,
  toXStocksDisplayPrice,
  usePrimaryChainNadoClient,
  useSubaccountContext,
} from '@nadohq/react-client';
import { formatTimestamp, TimeFormatSpecifier } from '@nadohq/web-ui';
import { useInterval } from 'ahooks';
import { BigNumber } from 'bignumber.js';
import { useQueryAllMarketsStaticDataByChainEnv } from 'client/hooks/query/markets/allMarketsStaticDataByChainEnv/useQueryAllMarketsStaticDataByChainEnv';
import { useQueryAllMarketsLatestPrices } from 'client/hooks/query/markets/useQueryAllMarketsLatestPrices';
import { useGetNowTimeInSeconds } from 'client/hooks/util/useGetNowTime';
import { useOperationTimeLogger } from 'client/hooks/util/useOperationTimeLogger';
import { useSyncedRef } from 'client/hooks/util/useSyncedRef';
import { getResolvedColorValue } from 'client/modules/theme/colorVars';
import {
  ALL_RESOLUTIONS_TO_INTERVALS,
  DATAFEED_CONFIGURATION,
  getTradingViewSymbolInfo,
  RESOLUTIONS_TO_INTERVALS,
  TradingViewSymbolInfo,
} from 'client/modules/trading/chart/config/datafeedConfig';
import { useBrokerDependencies } from 'client/modules/trading/chart/hooks/useBrokerDependencies';
import {
  BACKFILL_END_DATE_SECONDS_BY_PRODUCT_ID,
  DEFAULT_BACKFILL_END_DATE_SECONDS,
} from 'client/modules/trading/chart/hooks/useTradingViewData/consts';
import { BarSubscriber } from 'client/modules/trading/chart/hooks/useTradingViewData/types';
import {
  applyMidPriceToBar,
  getProductIdIntervalKey,
  syncBarOpenWithValue,
  toTVCandlestick,
  toTVCandlesticks,
} from 'client/modules/trading/chart/hooks/useTradingViewData/utils';
import {
  NadoBrokerDeps,
  TradingViewDataFeed,
} from 'client/modules/trading/chart/types';
import { useEnableChartMarks } from 'client/modules/trading/hooks/useEnableChartMarks';
import { useEngineSubscriptionsWebSocket } from 'client/modules/webSockets/hooks/useEngineSubscriptionsWebSocket';
import { getEngineSubscriptionEventData } from 'client/modules/webSockets/utils/getEngineSubscriptionEventData';
import { useGetXStocksExchangeRate } from 'client/modules/xStocks/hooks/useGetXStocksExchangeRate';
import { last } from 'lodash';
import type { Bar, Mark, QuoteData } from 'public/charting_library';
import { RefObject, useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import safeStringify from 'safe-stable-stringify';

interface QuoteListener {
  productIds: Set<number>;
  callback: (data: QuoteData[]) => void;
}

interface UseTradingViewData {
  symbolInfoByProductId: Record<number, TradingViewSymbolInfo> | undefined;
  datafeed: TradingViewDataFeed | undefined;
  brokerDepsRef: RefObject<NadoBrokerDeps>;
}

/**
 * Builds the TradingView datafeed (candlesticks, quotes, marks) and broker
 * dependencies. BBO subscription for the active product is handled by
 * useTradingWebSocketSubscriptions at the page level; quote data is read
 * from the latestMarketPrices query cache.
 */
export function useTradingViewData(): UseTradingViewData {
  const { t } = useTranslation();

  const { startProfiling, endProfiling } = useOperationTimeLogger(
    'tvCharts',
    false,
  );
  const _nadoClient = usePrimaryChainNadoClient();
  const nadoClientRef = useSyncedRef(_nadoClient);
  const hasLoadedNadoClient = !!_nadoClient;

  const getNowTimeInSeconds = useGetNowTimeInSeconds();

  // Current subaccount for fetching user's trade marks
  const { currentSubaccount } = useSubaccountContext();

  const currentSubaccountRef = useSyncedRef(currentSubaccount);

  const { enableChartMarks } = useEnableChartMarks();
  const enableChartMarksRef = useSyncedRef(enableChartMarks);

  // Static data per chainEnv carries StaticMarketData + the quotes map, both
  // needed to build a complete TradingViewSymbolInfo (see datafeedConfig).
  const { data: allMarketsStaticDataByChainEnv } =
    useQueryAllMarketsStaticDataByChainEnv();

  // xStocks exchange rates — needed to convert raw (wQQQx) backend values
  // to display (QQQx) space before handing them to TradingView. Returns 1
  // for non-xStocks markets so the toXStocks* helpers become no-ops.
  const { getExchangeRate, hasLoaded: hasLoadedExchangeRates } =
    useGetXStocksExchangeRate();
  const getExchangeRateRef = useSyncedRef(getExchangeRate);

  // Source for `getQuotes` snapshots — read from the polled query cache so
  // bid/ask are available immediately on symbol switch, before the first
  // BBO websocket event lands. The query is already polled elsewhere so
  // reading from its cache costs nothing extra here.
  const { data: latestMarketPrices } = useQueryAllMarketsLatestPrices();
  const latestMarketPricesRef = useSyncedRef(latestMarketPrices);

  const hasLoadedMarketsStaticData = allMarketsStaticDataByChainEnv != null;

  // Construct symbol info for all markets across edge. This means that we don't need to reload the datafeed when changing chain env
  const symbolInfoByProductId = useMemo(
    () => {
      if (!hasLoadedMarketsStaticData || !hasLoadedExchangeRates) {
        return;
      }

      const mapping: Record<number, TradingViewSymbolInfo> = {};
      Object.values(allMarketsStaticDataByChainEnv).forEach(
        (staticDataForChainEnv) => {
          Object.values(staticDataForChainEnv.allMarkets).forEach(
            (marketData) => {
              const quoteSymbol =
                staticDataForChainEnv.quotes[marketData.productId]?.symbol;

              if (!quoteSymbol) {
                return;
              }

              mapping[marketData.productId] = getTradingViewSymbolInfo(
                marketData,
                quoteSymbol,
                getExchangeRate(marketData.productId),
              );
            },
          );
        },
      );

      return mapping;
    },
    // Only re-run when both data sources finish loading for the first time
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hasLoadedMarketsStaticData, hasLoadedExchangeRates],
  );

  const brokerDepsRef = useBrokerDependencies(symbolInfoByProductId);

  // This is used to retrieve the correct subscriber when unsubscribing from updates
  const tvUIDToBarSubscriber = useRef<Map<string, BarSubscriber>>(new Map());
  // This is used to retrieve the correct subscriber when receiving an update from the websocket
  const productIdIntervalKeyToBarSubscriber = useRef<
    Map<string, BarSubscriber>
  >(new Map());
  // This is used to connect candles (i.e. make the open of a new bar equal to the close of the previous)
  const productIdIntervalKeyToLastBar = useRef<Map<string, Bar>>(new Map());

  // Quotes API state — backs `getQuotes` / `subscribeQuotes` for the
  // Buy/Sell buttons and Order Panel. BBO updates flow through the
  // latestMarketPrices query cache (updated by useTradingWebSocketSubscriptions).
  const quoteListenersByUidRef = useRef<Map<string, QuoteListener>>(new Map());

  // Last traded price per product, used as `lp` in the Quotes API. Engine
  // pushes a new `latest_candlestick` event on every match, so the running
  // bar's `close` is the freshest trade price we have client-side. Seeded
  // from getBars history (last close in the fetched window) and updated
  // live by the candlestick branch of onSubscriptionMessage. Stored in
  // display (QQQx) space so it can be passed straight to TV.
  const lastTradedPriceByProductIdRef = useRef<Map<number, BigNumber>>(
    new Map(),
  );

  const buildQuoteData = useCallback(
    (productIds: number[]): QuoteData[] => {
      return productIds.map((productId) => {
        const symbol = String(productId);
        const lastTradedPrice =
          lastTradedPriceByProductIdRef.current.get(productId);
        // Bid/ask come from the latestMarketPrices query cache, which is
        // kept fresh by BBO websocket events via useTradingWebSocketSubscriptions.
        // Convert to display space — TV's Buy/Sell buttons render these
        // directly and the broker compares against them in the same space.
        const exchangeRate = getExchangeRateRef.current(productId);
        const marketPrice = latestMarketPricesRef.current?.[productId];
        const bid = toXStocksDisplayPrice(marketPrice?.safeBid, exchangeRate);
        const ask = toXStocksDisplayPrice(marketPrice?.safeAsk, exchangeRate);

        return {
          s: 'ok' as const,
          n: symbol,
          v: {
            lp: lastTradedPrice?.toNumber(),
            ask: ask?.toNumber(),
            bid: bid?.toNumber(),
            spread: bid && ask ? ask.minus(bid).toNumber() : undefined,
          },
        };
      });
    },
    [latestMarketPricesRef, getExchangeRateRef],
  );

  // Periodically push fresh data sourced from the latestMarketPrices query
  // cache (polled by useQueryAllMarketsLatestPrices) — two consumers:
  //   1. Quote listeners: bid/ask for Buy/Sell buttons and Order Panel.
  //      Polling covers productIds that may not be receiving BBO/candlestick
  //      events on the shared socket (or while the WS is disconnected) —
  //      without it, their bid/ask would never reach TV.
  //   2. Running bar close: driven from mid-price between trades.
  //      `latest_candlestick` is only emitted on a match, so without this
  //      the close is pinned to the last trade price and visibly drifts
  //      from the book on thin markets. Does not touch
  //      `lastTradedPriceByProductIdRef` — the Quotes API's `lp` stays tied
  //      to actual trade prints.
  const pushLatestPriceUpdates = useCallback(() => {
    quoteListenersByUidRef.current.forEach((listener) => {
      const quoteData = buildQuoteData(Array.from(listener.productIds));
      listener.callback(quoteData);
    });

    productIdIntervalKeyToBarSubscriber.current.forEach(
      (barSubscriber, productIdIntervalKey) => {
        const safeMidPrice =
          latestMarketPricesRef.current?.[barSubscriber.productId]
            ?.safeMidPrice;
        if (!safeMidPrice) {
          return;
        }

        const midPrice = toXStocksDisplayPrice(
          safeMidPrice,
          getExchangeRateRef.current(barSubscriber.productId),
        ).toNumber();

        const lastBar =
          productIdIntervalKeyToLastBar.current.get(productIdIntervalKey);
        if (!lastBar) {
          return;
        }

        const updatedBar = applyMidPriceToBar(lastBar, midPrice);
        productIdIntervalKeyToLastBar.current.set(
          productIdIntervalKey,
          updatedBar,
        );
        barSubscriber.updateLatestBar(updatedBar);
      },
    );
  }, [buildQuoteData, getExchangeRateRef, latestMarketPricesRef]);

  useInterval(pushLatestPriceUpdates, 1000);

  // Single message handler for the shared engine subscriptions socket —
  // dispatches by `type` to the relevant branch.
  const onSubscriptionMessage = useCallback(
    (message: MessageEvent) => {
      const data = getEngineSubscriptionEventData(message);

      if (data?.type === 'latest_candlestick') {
        // Given product ID + resolution, find all relevant subscribers and update their latest bar
        const productIdIntervalKey = getProductIdIntervalKey(
          data.product_id,
          data.granularity,
        );
        const barSubscriber =
          productIdIntervalKeyToBarSubscriber.current.get(productIdIntervalKey);
        if (!barSubscriber) {
          console.warn(
            `[useTradingViewData] No bar subscriber found for product ID ${data.product_id} and interval ${data.granularity}`,
          );
          return;
        }

        const exchangeRate = getExchangeRateRef.current(data.product_id);
        let newCandlestick = toTVCandlestick(
          {
            close: removeDecimals(data.close_x18),
            high: removeDecimals(data.high_x18),
            low: removeDecimals(data.low_x18),
            open: removeDecimals(data.open_x18),
            time: toBigNumber(data.timestamp),
            volume: toBigNumber(data.volume),
          },
          exchangeRate,
        );
        // The running bar's close = most recent trade price (display space).
        lastTradedPriceByProductIdRef.current.set(
          data.product_id,
          toBigNumber(newCandlestick.close),
        );
        const lastBar =
          productIdIntervalKeyToLastBar.current.get(productIdIntervalKey);
        if (lastBar) {
          // Sync the open price with the last bar's close to prevent gaps
          // Candlesticks within the same period will have the same timestamp
          if (newCandlestick.time > lastBar.time) {
            // This is a new bar
            newCandlestick = syncBarOpenWithValue(
              newCandlestick,
              lastBar.close,
            );
          } else {
            // This is an update to the existing last bar
            newCandlestick = syncBarOpenWithValue(newCandlestick, lastBar.open);
          }

          // Clone to prevent TradingView from mutating our stored reference
          // (TV can modify bar properties in place, e.g. normalizing timestamps)
          productIdIntervalKeyToLastBar.current.set(productIdIntervalKey, {
            ...newCandlestick,
          });
        } else {
          console.warn(
            `[useTradingViewData] No last bar found during candlestick update for ${productIdIntervalKey}, skipping open price sync`,
          );
        }

        barSubscriber.updateLatestBar(newCandlestick);
        return;
      }
    },
    [getExchangeRateRef],
  );
  const { isActiveWebSocket, sendJsonMessage } =
    useEngineSubscriptionsWebSocket({
      onMessage: onSubscriptionMessage,
    });
  const isActiveWebSocketRef = useSyncedRef(isActiveWebSocket);
  const sendJsonMessageRef = useSyncedRef(sendJsonMessage);

  // Resubscribe to candlestick streams when WebSocket reconnects.
  // BBO subscription is handled by useTradingWebSocketSubscriptions at
  // the page level; the chart reads bid/ask from the query cache.
  useEffect(() => {
    if (!isActiveWebSocket) {
      console.debug(
        '[useTradingViewData] WebSocket not active, skipping resubscribe',
      );
      return;
    }

    const nadoClient = nadoClientRef.current;
    if (!nadoClient) {
      console.error(
        '[useTradingViewData] Cannot resubscribe - nadoClient not available',
      );
      return;
    }

    const barSubscribers = Array.from(tvUIDToBarSubscriber.current.values());
    if (barSubscribers.length === 0) {
      return;
    }

    console.debug(
      `[useTradingViewData] Resubscribing to ${barSubscribers.length} candlestick streams`,
    );

    barSubscribers.forEach((subscriber) => {
      const subscriptionParams =
        nadoClient.ws.subscription.buildSubscriptionParams(
          'latest_candlestick',
          {
            product_id: subscriber.productId,
            granularity: subscriber.chartIntervalSeconds,
          },
        );
      const subscriptionMessage =
        nadoClient.ws.subscription.buildSubscriptionMessage(
          0,
          'subscribe',
          subscriptionParams,
        );
      sendJsonMessageRef.current(subscriptionMessage);
    });
  }, [isActiveWebSocket, nadoClientRef, sendJsonMessageRef]);

  const datafeed = useMemo((): TradingViewDataFeed | undefined => {
    if (!hasLoadedNadoClient || !symbolInfoByProductId) {
      return;
    }
    console.debug('[useTradingViewData] Reconstructing TV Datafeed');

    return {
      onReady: (callback) => {
        setTimeout(() => callback(DATAFEED_CONFIGURATION), 0);
      },
      // Not being used, as the symbol can't be switched from the chart itself
      searchSymbols: async () => {},
      // Given a symbol name (from search), return the symbol info
      resolveSymbol: async (
        ticker,
        onSymbolResolvedCallback,
        onResolveErrorCallback,
      ) => {
        // Symbol name is the ticker, which is the stringified product ID
        const marketInfo = symbolInfoByProductId[Number(ticker)];
        if (marketInfo) {
          setTimeout(() => onSymbolResolvedCallback(marketInfo), 0);
        } else {
          setTimeout(
            () => onResolveErrorCallback(t(($) => $.errors.symbolNotFound)),
            0,
          );
        }
      },
      // Get price data for the given period
      getBars: async (
        symbolInfo,
        resolution,
        periodParams,
        onHistoryCallback,
        onErrorCallback,
      ) => {
        const marketInfo = symbolInfoByProductId[Number(symbolInfo.ticker)];
        if (!marketInfo) {
          onErrorCallback(
            t(($) => $.errors.symbolNotFoundDetailed, {
              symbolInfo: safeStringify(symbolInfo),
            }),
          );
          return;
        }

        const { to, firstDataRequest, countBack } = periodParams;

        console.debug(
          '[useTradingViewData] Requesting bars',
          resolution,
          to,
          countBack,
          firstDataRequest,
        );

        // `to` is in seconds and meant to be exclusive, but the query is inclusive. Subtract 1 second to simulate that behavior
        const beforeTime = firstDataRequest ? getNowTimeInSeconds() : to - 1;

        startProfiling();

        const chartIntervalSeconds = RESOLUTIONS_TO_INTERVALS[resolution];

        nadoClientRef.current?.market
          .getEdgeCandlesticks({
            productId: marketInfo.marketData.productId,
            maxTimeInclusive: beforeTime,
            period: chartIntervalSeconds,
            limit: countBack,
          })
          .then((candlesticks) => {
            console.debug(
              '[useTradingViewData] Fetched candlesticks',
              candlesticks.length,
            );
            endProfiling();

            const tvCandlesticks = toTVCandlesticks(
              candlesticks,
              marketInfo.exchangeRate,
            );

            // Store lastBar before onHistoryCallback — TradingView mutates
            // bar objects in place (e.g. normalizing timestamps), so we clone
            // and extract before handing data to TV.
            const lastBar = last(tvCandlesticks);
            if (firstDataRequest && lastBar) {
              const productIdIntervalKey = getProductIdIntervalKey(
                marketInfo.marketData.productId,
                chartIntervalSeconds,
              );
              productIdIntervalKeyToLastBar.current.set(productIdIntervalKey, {
                ...lastBar,
              });
              // Seed last traded price for the Quotes API. Subsequent
              // candlestick events keep this fresh; without the seed the
              // first quote after subscribe would have no `lp`.
              lastTradedPriceByProductIdRef.current.set(
                marketInfo.marketData.productId,
                toBigNumber(lastBar.close),
              );
            }

            onHistoryCallback(tvCandlesticks, {
              noData: candlesticks.length === 0,
            });
          })
          .catch((err) => {
            console.error(
              '[useTradingViewData] Error fetching candlesticks',
              err,
            );
            let errorMsg: string;
            try {
              errorMsg = safeStringify(err) ?? t(($) => $.errors.unknown);
            } catch (_e) {
              errorMsg = String(err);
            }
            onErrorCallback(
              `[useTradingViewData] Error fetching data for product ${marketInfo.marketData.productId}: ${errorMsg}`,
            );
          });
      },
      // Subscribe to latest price updates
      subscribeBars: (
        symbolInfo,
        resolution,
        onRealtimeCallback,
        subscribeUID,
      ) => {
        const marketInfo = symbolInfoByProductId[Number(symbolInfo.ticker)];
        if (!marketInfo) {
          console.error(
            `[useTradingViewData] Symbol not found for subscribeBars: ${safeStringify(
              symbolInfo,
            )}`,
          );
          return;
        }

        const chartIntervalSeconds = RESOLUTIONS_TO_INTERVALS[resolution];
        const updateLatestBar = (bar: Bar) => {
          onRealtimeCallback(bar);
        };
        const barSubscriber: BarSubscriber = {
          chartIntervalSeconds,
          updateLatestBar,
          productId: marketInfo.marketData.productId,
          subscribeUID,
        };

        // Registration MUST be done before the websocket / nado client checks so that if the websocket isn't active
        // here, the effect that runs on reconnection can resubscribe correctly
        console.debug(
          '[useTradingViewData] Registering bar subscriber',
          barSubscriber,
        );
        tvUIDToBarSubscriber.current.set(subscribeUID, barSubscriber);
        productIdIntervalKeyToBarSubscriber.current.set(
          getProductIdIntervalKey(
            marketInfo.marketData.productId,
            chartIntervalSeconds,
          ),
          barSubscriber,
        );

        if (!isActiveWebSocketRef.current) {
          console.warn(
            `[useTradingViewData] WebSocket is not connected, cannot subscribe to updates for product ${marketInfo.marketData.productId}`,
          );
          return;
        }
        const nadoClient = nadoClientRef.current;
        if (!nadoClient) {
          console.error(`[useTradingViewData] Nado client is not available`);
          return;
        }

        console.debug(
          '[useTradingViewData] Subscribing to bars for symbol',
          symbolInfo.name,
          'resolution',
          resolution,
        );

        // Send a websocket message to subscribe to candlestick updates for this product + interval
        const subscriptionParams =
          nadoClient.ws.subscription.buildSubscriptionParams(
            'latest_candlestick',
            {
              product_id: marketInfo.marketData.productId,
              granularity: chartIntervalSeconds,
            },
          );
        const subscriptionMessage =
          nadoClient.ws.subscription.buildSubscriptionMessage(
            0,
            'subscribe',
            subscriptionParams,
          );
        sendJsonMessageRef.current(subscriptionMessage);
      },
      // Unsubscribe to latest price updates
      unsubscribeBars: (subscriberUID) => {
        console.debug(
          '[useTradingViewData] Unsubscribing from bars for ID',
          subscriberUID,
        );

        const barSubscriber = tvUIDToBarSubscriber.current.get(subscriberUID);
        if (!barSubscriber) {
          return;
        }

        // Unsubscribe from the websocket
        const nadoClient = nadoClientRef.current;
        if (nadoClient && isActiveWebSocketRef.current) {
          const unsubscriptionParams =
            nadoClient.ws.subscription.buildSubscriptionParams(
              'latest_candlestick',
              {
                product_id: barSubscriber.productId,
                granularity: barSubscriber.chartIntervalSeconds,
              },
            );
          const unsubscriptionMessage =
            nadoClient.ws.subscription.buildSubscriptionMessage(
              0,
              'unsubscribe',
              unsubscriptionParams,
            );
          sendJsonMessageRef.current(unsubscriptionMessage);
        }

        tvUIDToBarSubscriber.current.delete(subscriberUID);
        productIdIntervalKeyToBarSubscriber.current.delete(
          getProductIdIntervalKey(
            barSubscriber.productId,
            barSubscriber.chartIntervalSeconds,
          ),
        );
      },
      // Get timescale marks for the visible range
      getTimescaleMarks: (
        symbolInfo,
        from,
        to,
        onDataCallback,
        _resolution,
      ) => {
        const backfillMarkColor = getResolvedColorValue('accent');

        const productId = Number(symbolInfo.ticker);
        const backfillEndDateSeconds =
          BACKFILL_END_DATE_SECONDS_BY_PRODUCT_ID[productId] ??
          DEFAULT_BACKFILL_END_DATE_SECONDS;

        // Check if backfillEndDateSeconds is within the visible range
        if (from <= backfillEndDateSeconds && backfillEndDateSeconds <= to) {
          onDataCallback([
            {
              id: 'nado-launch-backfill-mark',
              time: backfillEndDateSeconds,
              color: backfillMarkColor,
              label: t(($) => $.tradingChart.backfillMark),
              tooltip: [t(($) => $.tradingChart.backfillMarkTooltip)],
              shape: 'circle',
            },
          ]);
        } else {
          onDataCallback([]);
        }
      },
      // Get bar marks (buy/sell trade marks) for the visible range
      getMarks: async (symbolInfo, from, to, onDataCallback, resolution) => {
        // Return empty marks if the feature is disabled
        if (!enableChartMarksRef.current) {
          onDataCallback([]);
          return;
        }

        const marketInfo = symbolInfoByProductId[Number(symbolInfo.ticker)];
        const nadoClient = nadoClientRef.current;
        const { address: subaccountOwner, name: subaccountName } =
          currentSubaccountRef.current ?? {};

        if (!subaccountOwner || !subaccountName || !nadoClient || !marketInfo) {
          onDataCallback([]);
          return;
        }

        // We don't want to fetch marks for the future, as it's not yet available
        const maxTimestampInclusive = Math.min(to, getNowTimeInSeconds());

        // Fetch match events for the visible time range
        const [response, error] = await asyncResult(
          nadoClient.context.indexerClient.getPaginatedSubaccountMatchEvents({
            subaccountOwner,
            subaccountName,
            productIds: [marketInfo.marketData.productId],
            maxTimestampInclusive,
            limit: 50,
          }),
        );

        if (error || !response) {
          console.error('[useTradingViewData] Error fetching marks', error);
          onDataCallback([]);
          return;
        }

        console.debug('[useTradingViewData] Fetched trade marks');

        const positiveColor = getResolvedColorValue('positive');
        const negativeColor = getResolvedColorValue('negative');

        // Get the chart interval in seconds to snap marks to candle open time
        const chartIntervalSeconds = ALL_RESOLUTIONS_TO_INTERVALS[resolution];

        if (!chartIntervalSeconds) {
          console.error(
            '[useTradingViewData] Unsupported resolution',
            resolution,
          );
          onDataCallback([]);
          return;
        }

        // Group fills by order digest AND candle interval
        // This ensures fills from the same order on different candles show as separate marks
        const fillsByDigestAndCandle = new Map<
          string,
          { candleTimeInSeconds: number; fills: IndexerMatchEvent[] }
        >();
        response.events
          // Filter to only include events within the visible time range
          .filter((trade) => trade.timestamp.toNumber() >= from)
          .forEach((trade) => {
            const candleTimeInSeconds = floorToInterval(
              trade.timestamp.toNumber(),
              chartIntervalSeconds,
            );
            const groupKey = `${trade.digest}_${candleTimeInSeconds}`;
            const existing = fillsByDigestAndCandle.get(groupKey);

            if (existing) {
              existing.fills.push(trade);
            } else {
              fillsByDigestAndCandle.set(groupKey, {
                candleTimeInSeconds,
                fills: [trade],
              });
            }
          });

        // Create one mark per order per candle with aggregated data
        const marks: Mark[] = Array.from(fillsByDigestAndCandle.entries()).map(
          ([groupKey, { candleTimeInSeconds, fills }]) => {
            const firstFill = fills[0];

            // Calculate aggregated values using weighted average price
            // avgPrice = sum(fillPrice * |amount|) / sum(|amount|)
            let totalBaseSize = toBigNumber(0);
            let weightedPriceSum = toBigNumber(0);

            for (const fill of fills) {
              const fillSize = removeDecimals(fill.baseFilled).abs();
              const fillPrice = calcOrderFillPrice(
                fill.quoteFilled,
                fill.totalFee,
                fill.baseFilled,
              );
              totalBaseSize = totalBaseSize.plus(fillSize);
              weightedPriceSum = weightedPriceSum.plus(
                fillPrice.multipliedBy(fillSize),
              );
            }

            const rawAvgFillPrice = weightedPriceSum.dividedBy(totalBaseSize);
            const isBuy = firstFill.baseFilled.isPositive();
            const color = isBuy ? positiveColor : negativeColor;
            const label = isBuy
              ? t(($) => $.buyAbbrev)
              : t(($) => $.sellAbbrev);

            return {
              id: groupKey,
              time: candleTimeInSeconds,
              color: {
                background: color,
                border: color,
              },
              text: getAggregatedTradeMarkTooltip({
                totalBaseSize: toXStocksDisplayAmount(
                  totalBaseSize,
                  marketInfo.exchangeRate,
                ),
                avgFillPrice: toXStocksDisplayPrice(
                  rawAvgFillPrice,
                  marketInfo.exchangeRate,
                ),
                candleTimeInSeconds,
                marketInfo,
              }),
              label,
              labelFontColor: getResolvedColorValue('text-primary'),
              minSize: 14,
            };
          },
        );

        onDataCallback(marks);
      },

      // Quotes API — provides bid/ask data for Buy/Sell buttons and Order Panel
      getQuotes: (symbols, onDataCallback, _onErrorCallback) => {
        onDataCallback(buildQuoteData(symbols.map(Number)));
      },
      subscribeQuotes: (
        symbols,
        fastSymbols,
        onRealtimeCallback,
        listenerGUID,
      ) => {
        // Register the callback; the pushQuoteUpdates interval will
        // periodically call it with fresh data from the query cache.
        const productIds = new Set<number>(
          [...symbols, ...fastSymbols].map(Number),
        );
        quoteListenersByUidRef.current.set(listenerGUID, {
          productIds,
          callback: onRealtimeCallback,
        });
      },
      unsubscribeQuotes: (listenerGUID) => {
        quoteListenersByUidRef.current.delete(listenerGUID);
      },
    };
  }, [
    hasLoadedNadoClient,
    symbolInfoByProductId,
    buildQuoteData,
    startProfiling,
    nadoClientRef,
    endProfiling,
    isActiveWebSocketRef,
    sendJsonMessageRef,
    currentSubaccountRef,
    enableChartMarksRef,
    getNowTimeInSeconds,
    t,
  ]);

  return {
    datafeed,
    symbolInfoByProductId,
    brokerDepsRef,
  };
}

interface AggregatedTradeMarkTooltipParams {
  totalBaseSize: BigNumber;
  avgFillPrice: BigNumber;
  candleTimeInSeconds: number;
  marketInfo: TradingViewSymbolInfo;
}

/**
 * Creates a tooltip for an aggregated order.
 * Format: "Jan 15, 10:30 AM: 1.5@2,500"
 */
function getAggregatedTradeMarkTooltip({
  totalBaseSize,
  avgFillPrice,
  candleTimeInSeconds,
  marketInfo,
}: AggregatedTradeMarkTooltipParams): string {
  const formattedPrice = formatNumber(avgFillPrice, {
    formatSpecifier: getMarketPriceFormatSpecifier({
      priceIncrement: marketInfo.marketData.priceIncrement,
      exchangeRate: marketInfo.exchangeRate,
    }),
  });

  const formattedSize = formatNumber(totalBaseSize, {
    formatSpecifier: getMarketSizeFormatSpecifier({
      sizeIncrement: marketInfo.marketData.sizeIncrement,
      exchangeRate: marketInfo.exchangeRate,
    }),
  });

  const formattedTime = formatTimestamp(candleTimeInSeconds * 1000, {
    formatSpecifier: TimeFormatSpecifier.MMM_D_HH_12H_O,
  });

  return `${formattedTime}: ${formattedSize}@${formattedPrice}`;
}

/**
 * Floors a timestamp to the start of its containing interval.
 * @param timestampSeconds - Unix timestamp in seconds
 * @param intervalSeconds - Interval size in seconds (e.g., 1800 for 30 minutes)
 * @returns The timestamp of the interval's start
 */
function floorToInterval(
  timestampSeconds: number,
  intervalSeconds: number,
): number {
  return Math.floor(timestampSeconds / intervalSeconds) * intervalSeconds;
}
