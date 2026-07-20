import { BigNumbers, toBigNumber } from '@nadohq/client';
import {
  getMarketPriceFormatSpecifier,
  getMarketSizeFormatSpecifier,
  getPrecisionFixedFormatSpecifier,
  getRoundedIncrement,
  PresetNumberFormatSpecifier,
  toXStocksDisplayPrice,
} from '@nadohq/react-client';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { useLatestOrderFill } from 'client/hooks/markets/useLatestOrderFill';
import { useMarket } from 'client/hooks/markets/useMarket';
import { useQueryMarketLiquidity } from 'client/hooks/query/markets/useQueryMarketLiquidity';
import { useQuerySubaccountOpenEngineOrders } from 'client/hooks/query/subaccount/useQuerySubaccountOpenEngineOrders';
import { useQuerySubaccountOpenTriggerOrders } from 'client/hooks/query/subaccount/useQuerySubaccountOpenTriggerOrders';
import {
  OrderbookData,
  OrderbookParams,
  UseOrderbook,
} from 'client/modules/trading/marketOrders/orderbook/hooks/types';
import { getTickPriceLevel } from 'client/modules/trading/marketOrders/orderbook/hooks/useOrderbook/getTickPriceLevel';
import { mapOrderbookDataFromQueries } from 'client/modules/trading/marketOrders/orderbook/hooks/useOrderbook/mapOrderbookDataFromQueries';
import { useSelectedTickSpacingMultiplier } from 'client/modules/trading/marketOrders/orderbook/hooks/useSelectedTickSpacingMultiplier';
import { useShowOrderbookTotalInQuote } from 'client/modules/trading/marketOrders/orderbook/hooks/useShowOrderbookTotalInQuote';
import { useGetXStocksExchangeRate } from 'client/modules/xStocks/hooks/useGetXStocksExchangeRate';
import { priceInputAtom } from 'client/store/trading/commonTradingStore';
import { useSetAtom } from 'jotai';
import { useMemo } from 'react';

export function useOrderbook({
  productId,
  depth,
}: OrderbookParams): UseOrderbook {
  const { tickSpacingMultiplier, setTickSpacingMultiplier } =
    useSelectedTickSpacingMultiplier(productId);
  const { showOrderbookTotalInQuote, setShowOrderbookTotalInQuote } =
    useShowOrderbookTotalInQuote();

  const { data: openEngineOrdersData } = useQuerySubaccountOpenEngineOrders();
  const { data: openTriggerOrdersData } = useQuerySubaccountOpenTriggerOrders();
  const { getExchangeRate } = useGetXStocksExchangeRate();
  const exchangeRate = getExchangeRate(productId);

  // Market data
  const { data: marketData } = useMarket({
    productId,
  });
  const { data: allMarketsStaticData } = useAllMarketsStaticData();
  const quoteData = productId
    ? allMarketsStaticData?.quotes[productId]
    : undefined;

  // Orderbook query, run only when market has loaded
  const { data: liquidityQueryData } = useQueryMarketLiquidity({
    productId,
  });

  const { data: latestOrderFillPrice } = useLatestOrderFill({ productId });

  const lastPrice =
    productId !== undefined
      ? toXStocksDisplayPrice(latestOrderFillPrice?.price, exchangeRate)
      : latestOrderFillPrice?.price;

  // Convert tick spacing to display space for format specifiers and UI display.
  // this needs to be done to build orderbook data so that the tick buckets are in display space
  const roundedPriceIncrement =
    getRoundedIncrement(
      toXStocksDisplayPrice(marketData?.priceIncrement, exchangeRate),
    ) ?? BigNumbers.ONE;
  const displayTickSpacing = roundedPriceIncrement
    .multipliedBy(tickSpacingMultiplier)
    .toNumber();

  // Compute data
  const orderbookData = useMemo((): OrderbookData | undefined => {
    if (!marketData || !liquidityQueryData || !quoteData) {
      return;
    }
    return mapOrderbookDataFromQueries({
      depth,
      showOrderbookTotalInQuote,
      quoteSymbol: quoteData.symbol,
      tickSpacing: displayTickSpacing,
      marketData,
      liquidityQueryData,
      exchangeRate,
    });
  }, [
    depth,
    liquidityQueryData,
    marketData,
    quoteData,
    showOrderbookTotalInQuote,
    displayTickSpacing,
    exchangeRate,
  ]);

  const openOrderPrices = useMemo(() => {
    // Use string instead of BigNumber for proper comparison.
    const orderPrices = new Set<string>();

    if (!marketData) {
      return;
    }

    // Add open engine order prices to the set.
    // Convert to display space first, then bucket — must match how processTicks buckets in mapOrderbookDataFromQueries.
    openEngineOrdersData?.[marketData.productId]?.forEach((order) => {
      const { price, totalAmount } = order;
      const displayPrice = toXStocksDisplayPrice(price, exchangeRate);
      const tickPriceLevel = getTickPriceLevel({
        isAsk: totalAmount.isNegative(),
        price: displayPrice,
        tickSpacing: displayTickSpacing,
      });
      orderPrices.add(tickPriceLevel.toString());
    });

    openTriggerOrdersData?.[marketData.productId]?.forEach((order) => {
      // Only show price-trigger orders
      if (order.order.triggerCriteria.type !== 'price') {
        return;
      }

      const rawPrice = toBigNumber(
        order.order.triggerCriteria.criteria.triggerPrice,
      );
      const { amount } = order.order;
      const displayPrice = toXStocksDisplayPrice(rawPrice, exchangeRate);
      const tickPriceLevel = getTickPriceLevel({
        isAsk: amount.isNegative(),
        price: displayPrice,
        tickSpacing: displayTickSpacing,
      });
      orderPrices.add(tickPriceLevel.toString());
    });

    return orderPrices;
  }, [
    marketData,
    openEngineOrdersData,
    openTriggerOrdersData,
    displayTickSpacing,
    exchangeRate,
  ]);

  const setNewPriceInput = useSetAtom(priceInputAtom);

  const amountFormatSpecifier = getMarketSizeFormatSpecifier({
    sizeIncrement: orderbookData?.sizeIncrement,
    exchangeRate,
  });

  const cumulativeAmountSpecifier = showOrderbookTotalInQuote
    ? PresetNumberFormatSpecifier.NUMBER_INT
    : amountFormatSpecifier;

  const amountSymbol = showOrderbookTotalInQuote
    ? orderbookData?.quoteSymbol
    : orderbookData?.productMetadata?.symbol;

  // We don't use `getMarketPriceFormatSpecifier` because we want to format depending on the selected tick spacing
  const rowPriceFormatSpecifier = getPrecisionFixedFormatSpecifier({
    step: displayTickSpacing,
    isSigned: false,
  });

  return {
    orderbookData,
    tickSpacingMultiplier,
    setTickSpacingMultiplier,
    roundedPriceIncrement,
    currentTickSpacing: displayTickSpacing,
    setShowOrderbookTotalInQuote,
    showOrderbookTotalInQuote,
    setNewPriceInput,
    lastPrice,
    amountSymbol,
    openOrderPrices,
    priceFormatSpecifier: getMarketPriceFormatSpecifier({
      priceIncrement: marketData?.priceIncrement,
      exchangeRate,
    }),
    rowPriceFormatSpecifier,
    amountFormatSpecifier,
    cumulativeAmountSpecifier,
  };
}
