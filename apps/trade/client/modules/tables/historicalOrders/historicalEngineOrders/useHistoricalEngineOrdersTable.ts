import {
  GetIndexerPaginatedOrdersResponse,
  IndexerOrder,
  ProductEngineType,
  removeDecimals,
} from '@nadohq/client';
import { calcOrderFillPrice } from '@nadohq/react-client';
import { nonNullFilter } from '@nadohq/web-common';
import { useDataTablePaginatedQuery } from 'client/components/DataTable/hooks/useDataTablePaginatedQuery';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { AllMarketsStaticDataForChainEnv } from 'client/hooks/query/markets/allMarketsStaticDataByChainEnv/types';
import { usePaginatedSubaccountHistoricalEngineOrders } from 'client/hooks/query/subaccount/usePaginatedSubaccountHistoricalEngineOrders';
import { HistoricalEngineOrderTableItem } from 'client/modules/tables/types/HistoricalEngineOrderTableItem';
import { calcHistoricalIsoLeverage } from 'client/modules/tables/utils/calcHistoricalIsoLeverage';
import { calcRealizedPnlInfo } from 'client/modules/tables/utils/calcRealizedPnlInfo';
import { getOrderTableItem } from 'client/modules/tables/utils/getOrderTableItem';
import { getProductTableItem } from 'client/modules/tables/utils/getProductTableItem';
import { secondsToMilliseconds } from 'date-fns';
import type { TFunction } from 'i18next';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

function extractItems(data: GetIndexerPaginatedOrdersResponse) {
  return data.orders;
}

interface Params {
  pageSize: number;
  productIds?: number[];
}

export function useHistoricalEngineOrdersTable({
  pageSize,
  productIds,
}: Params) {
  const { t } = useTranslation();

  const { data: allMarketsStaticData, isLoading: marketsDataLoading } =
    useAllMarketsStaticData();

  const {
    isLoading,
    isFetchingCurrPage,
    currentPageData: historicalOrders,
    pagination,
  } = useDataTablePaginatedQuery({
    queryHook: usePaginatedSubaccountHistoricalEngineOrders,
    queryParams: {
      pageSize,
      productIds,
    },
    extractItems,
  });

  const mappedData: HistoricalEngineOrderTableItem[] | undefined =
    useMemo(() => {
      if (!historicalOrders || !allMarketsStaticData) {
        return;
      }

      return historicalOrders
        .map((order): HistoricalEngineOrderTableItem | undefined => {
          const staticMarketData =
            allMarketsStaticData.allMarkets[order.productId];
          const staticQuoteData = allMarketsStaticData.quotes[order.productId];

          if (!staticMarketData || !staticQuoteData) {
            return;
          }

          return getHistoricalEngineOrderTableItem({
            order,
            allMarketsStaticData,
            t,
          });
        })
        .filter(nonNullFilter);
    }, [historicalOrders, allMarketsStaticData, t]);

  return {
    isLoading: isLoading || marketsDataLoading || isFetchingCurrPage,
    mappedData,
    pagination,
  };
}

function getStatusText(order: IndexerOrder, t: TFunction): string {
  if (order.baseFilled.eq(order.amount)) {
    return t(($) => $.filled);
  }

  if (!order.baseFilled.isZero()) {
    return t(($) => $.partiallyFilled);
  }

  const hasExpired = Date.now() >= order.expiration * 1000;
  return hasExpired ? t(($) => $.expired) : t(($) => $.cancelled);
}

export function getHistoricalEngineOrderTableItem(params: {
  order: IndexerOrder;
  allMarketsStaticData: AllMarketsStaticDataForChainEnv;
  t: TFunction;
}): HistoricalEngineOrderTableItem {
  const { order, allMarketsStaticData, t } = params;

  const productTableItem = getProductTableItem({
    productId: order.productId,
    allMarketsStaticData,
  });
  const orderTableItem = getOrderTableItem({ indexerOrder: order });

  const preBase = order.preBalances.base;
  const decimalAdjustedPreBaseAmount = removeDecimals(preBase.amount);
  const decimalAdjustedPreOrderSize = decimalAdjustedPreBaseAmount.abs();

  const decimalAdjustedFilledBaseSize = removeDecimals(order.baseFilled).abs();
  const decimalAdjustedFilledQuoteSize = removeDecimals(
    order.quoteFilled,
  ).abs();
  const filledAvgPrice = calcOrderFillPrice(
    order.quoteFilled,
    order.totalFee,
    order.baseFilled,
  );
  const decimalAdjustedTotalFee = removeDecimals(order.totalFee);
  const decimalAdjustedClosedSize = removeDecimals(order.closedAmount).abs();
  const hasClosedPosition = !decimalAdjustedClosedSize.isZero();

  const decimalAdjustedClosedNetEntry = removeDecimals(order.closedNetEntry);
  const decimalAdjustedPreCloseMargin = order.preCloseMargin
    ? removeDecimals(order.preCloseMargin)
    : null;

  const isoLeverage = calcHistoricalIsoLeverage({
    decimalAdjustedPreCloseMargin,
    decimalAdjustedPreBaseAmount,
    fillPrice: filledAvgPrice,
    decimalAdjustedVQuoteBalance:
      preBase.type === ProductEngineType.PERP
        ? removeDecimals(preBase.vQuoteBalance)
        : undefined,
  });

  // preBalances.base.amount is the signed position size before the order.
  const preClosePositionAmount = hasClosedPosition
    ? decimalAdjustedPreBaseAmount
    : undefined;

  const entryPrice = hasClosedPosition
    ? decimalAdjustedClosedNetEntry.div(decimalAdjustedClosedSize).abs()
    : undefined;

  return {
    ...productTableItem,
    ...orderTableItem,
    timePlacedMillis: secondsToMilliseconds(order.recvTimeSeconds),
    filledAvgPrice,
    filledBaseSize: decimalAdjustedFilledBaseSize,
    filledQuoteSize: decimalAdjustedFilledQuoteSize,
    statusText: getStatusText(order, t),
    tradeFeeQuote: decimalAdjustedTotalFee,
    closedBaseSize: hasClosedPosition ? decimalAdjustedClosedSize : undefined,
    preClosePositionAmount,
    entryPrice,
    isoLeverage,
    realizedPnl: calcRealizedPnlInfo({
      realizedPnlUsd: removeDecimals(order.realizedPnl),
      isPerp: productTableItem.isPerp,
      closedBaseSize: decimalAdjustedClosedSize,
      closedNetEntry: decimalAdjustedClosedNetEntry,
      margin: decimalAdjustedPreCloseMargin,
      preEventPositionSize: decimalAdjustedPreOrderSize,
      longWeightInitial:
        allMarketsStaticData.allMarkets[order.productId]?.longWeightInitial,
    }),
    lastFillTimeMillis: secondsToMilliseconds(
      order.lastFillTimestamp.toNumber(),
    ),
    marginModeType: order.isolated ? 'isolated' : 'cross',
  };
}
