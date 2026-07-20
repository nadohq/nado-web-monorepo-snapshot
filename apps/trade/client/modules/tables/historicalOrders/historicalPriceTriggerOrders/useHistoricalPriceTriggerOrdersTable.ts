import { removeDecimals, toBigNumber } from '@nadohq/client';
import {
  calcOrderFillPrice,
  toXStocksDisplayAmount,
  toXStocksDisplayPrice,
} from '@nadohq/react-client';
import { nonNullFilter } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import { useDataTablePaginatedQuery } from 'client/components/DataTable/hooks/useDataTablePaginatedQuery';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { AllMarketsStaticDataForChainEnv } from 'client/hooks/query/markets/allMarketsStaticDataByChainEnv/types';
import { TriggerOrderInfoWithEngineOrder } from 'client/hooks/query/subaccount/types';
import { usePaginatedSubaccountHistoricalPriceTriggerOrders } from 'client/hooks/query/subaccount/usePaginatedSubaccountHistoricalPriceTriggerOrders';
import { HistoricalPriceTriggerOrderTableItem } from 'client/modules/tables/types/HistoricalPriceTriggerOrderTableItem';
import { getOrderTableItem } from 'client/modules/tables/utils/getOrderTableItem';
import { getProductTableItem } from 'client/modules/tables/utils/getProductTableItem';
import { requirePriceTriggerCriteria } from 'client/modules/trading/utils/trigger/getPriceTriggerCriteria';
import { getTriggerOrderStatusInfo } from 'client/modules/trading/utils/trigger/getTriggerOrderStatusInfo';
import { useGetXStocksExchangeRate } from 'client/modules/xStocks/hooks/useGetXStocksExchangeRate';
import { secondsToMilliseconds } from 'date-fns';
import type { TFunction } from 'i18next';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

function extractItems(data: { orders: TriggerOrderInfoWithEngineOrder[] }) {
  return data.orders;
}

interface Params {
  pageSize: number;
  productIds?: number[];
  reduceOnly: boolean;
}

export function useHistoricalPriceTriggerOrdersTable({
  pageSize,
  productIds,
  reduceOnly,
}: Params) {
  const { t } = useTranslation();

  const { data: allMarketsStaticData, isLoading: marketsDataLoading } =
    useAllMarketsStaticData();
  const { getExchangeRate } = useGetXStocksExchangeRate();

  const {
    isLoading,
    currentPageData: historicalOrders,
    isFetchingCurrPage,
    pagination,
  } = useDataTablePaginatedQuery({
    queryHook: usePaginatedSubaccountHistoricalPriceTriggerOrders,
    queryParams: {
      pageSize,
      productIds,
      reduceOnly,
    },
    extractItems,
  });

  const mappedData: HistoricalPriceTriggerOrderTableItem[] | undefined =
    useMemo(() => {
      if (!historicalOrders || !allMarketsStaticData) {
        return;
      }

      return historicalOrders
        .map((triggerOrderInfo): HistoricalPriceTriggerOrderTableItem => {
          return getHistoricalPriceTriggerOrderTableItem({
            t,
            triggerOrderInfo,
            allMarketsStaticData,
            exchangeRate: getExchangeRate(triggerOrderInfo.order.productId),
          });
        })
        .filter(nonNullFilter);
    }, [historicalOrders, allMarketsStaticData, t, getExchangeRate]);

  return {
    isLoading: isLoading || marketsDataLoading || isFetchingCurrPage,
    mappedData,
    pagination,
  };
}

interface GetHistoricalPriceTriggerOrderTableItemParams {
  t: TFunction;
  triggerOrderInfo: TriggerOrderInfoWithEngineOrder;
  allMarketsStaticData: AllMarketsStaticDataForChainEnv;
  exchangeRate: BigNumber;
}

export function getHistoricalPriceTriggerOrderTableItem({
  t,
  triggerOrderInfo,
  allMarketsStaticData,
  exchangeRate,
}: GetHistoricalPriceTriggerOrderTableItemParams): HistoricalPriceTriggerOrderTableItem {
  const order = triggerOrderInfo.order;
  const productTableItem = getProductTableItem({
    productId: order.productId,
    allMarketsStaticData,
    exchangeRate,
  });
  const orderTableItem = getOrderTableItem({ triggerOrderInfo, exchangeRate });

  const priceTriggerCriteria = requirePriceTriggerCriteria(
    order.triggerCriteria,
  );

  const triggeredEngineOrder = triggerOrderInfo.triggeredEngineOrder;
  const rawFilledBaseSize = removeDecimals(
    triggeredEngineOrder?.baseFilled,
  )?.abs();
  const filledQuoteSize = removeDecimals(
    triggeredEngineOrder?.quoteFilled,
  )?.abs();
  const rawFilledAvgPrice = triggeredEngineOrder
    ? calcOrderFillPrice(
        triggeredEngineOrder.quoteFilled,
        triggeredEngineOrder.totalFee,
        triggeredEngineOrder.baseFilled,
      )
    : undefined;
  const rawClosedBaseSize = removeDecimals(
    triggeredEngineOrder?.closedAmount,
  )?.abs();

  return {
    ...productTableItem,
    ...orderTableItem,
    timeUpdatedMillis: secondsToMilliseconds(triggerOrderInfo.updatedAt),
    priceTriggerCriteria,
    displayTriggerPrice: toXStocksDisplayPrice(
      toBigNumber(priceTriggerCriteria.triggerPrice),
      exchangeRate,
    ),
    filledAvgPrice: toXStocksDisplayPrice(rawFilledAvgPrice, exchangeRate),
    filledBaseSize: toXStocksDisplayAmount(rawFilledBaseSize, exchangeRate),
    filledQuoteSize,
    closedBaseSize: toXStocksDisplayAmount(rawClosedBaseSize, exchangeRate),
    status: getTriggerOrderStatusInfo(t, triggerOrderInfo),
  };
}
