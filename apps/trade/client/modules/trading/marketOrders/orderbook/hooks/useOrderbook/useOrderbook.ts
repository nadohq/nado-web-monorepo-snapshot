import { toBigNumber } from '@nadohq/client';
import {
  getMarketSizeFormatSpecifier,
  PresetNumberFormatSpecifier,
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
import { priceInputAtom } from 'client/store/trading/commonTradingStore';
import { precisionFixed } from 'd3-format';
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

  const lastPrice = latestOrderFillPrice?.price;

  const tickSpacing =
    marketData?.priceIncrement.multipliedBy(tickSpacingMultiplier).toNumber() ??
    1;

  // Compute data
  const orderbookData = useMemo((): OrderbookData | undefined => {
    if (!marketData || !liquidityQueryData || !quoteData) {
      return;
    }
    return mapOrderbookDataFromQueries({
      depth,
      showOrderbookTotalInQuote,
      quoteSymbol: quoteData.symbol,
      tickSpacing,
      marketData,
      liquidityQueryData,
    });
  }, [
    depth,
    liquidityQueryData,
    marketData,
    quoteData,
    showOrderbookTotalInQuote,
    tickSpacing,
  ]);

  const openOrderPrices = useMemo(() => {
    // Use string instead of BigNumber for proper comparison.
    const orderPrices = new Set<string>();

    if (!marketData) {
      return;
    }

    // Add open engine order prices to the set
    openEngineOrdersData?.[marketData.productId]?.forEach((order) => {
      const { price, totalAmount } = order;
      const tickPriceLevel = getTickPriceLevel({
        isAsk: totalAmount.isNegative(),
        price,
        tickSpacing,
      });
      orderPrices.add(tickPriceLevel.toString());
    });

    openTriggerOrdersData?.[marketData.productId]?.forEach((order) => {
      // Only show price-trigger orders
      if (order.order.triggerCriteria.type !== 'price') {
        return;
      }

      const price = toBigNumber(
        order.order.triggerCriteria.criteria.triggerPrice,
      );
      const { amount } = order.order;
      const tickPriceLevel = getTickPriceLevel({
        isAsk: amount.isNegative(),
        price,
        tickSpacing,
      });
      orderPrices.add(tickPriceLevel.toString());
    });

    return orderPrices;
  }, [marketData, openEngineOrdersData, openTriggerOrdersData, tickSpacing]);

  const setNewPriceInput = useSetAtom(priceInputAtom);

  const amountFormatSpecifier = getMarketSizeFormatSpecifier({
    sizeIncrement: orderbookData?.sizeIncrement,
  });

  const cumulativeAmountSpecifier = showOrderbookTotalInQuote
    ? PresetNumberFormatSpecifier.NUMBER_INT
    : amountFormatSpecifier;

  const amountSymbol = showOrderbookTotalInQuote
    ? orderbookData?.quoteSymbol
    : orderbookData?.productMetadata?.symbol;

  return {
    orderbookData,
    tickSpacingMultiplier,
    setTickSpacingMultiplier,
    currentTickSpacing: tickSpacing,
    setShowOrderbookTotalInQuote,
    showOrderbookTotalInQuote,
    setNewPriceInput,
    lastPrice,
    amountSymbol,
    openOrderPrices,
    // We don't use `getMarketPriceFormatSpecifier` because we want to format depending on the selected tick spacing
    priceFormatSpecifier: `.${precisionFixed(tickSpacing).toFixed()}f`,
    amountFormatSpecifier,
    cumulativeAmountSpecifier,
  };
}
