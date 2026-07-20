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
import { usePaginatedSubaccountHistoricalTimeTriggerOrders } from 'client/hooks/query/subaccount/usePaginatedSubaccountHistoricalTimeTriggerOrders';
import { HistoricalTimeTriggerOrdersTableItem } from 'client/modules/tables/types/HistoricalTimeTriggerOrderTableItem';
import { getOrderTableItem } from 'client/modules/tables/utils/getOrderTableItem';
import { getProductTableItem } from 'client/modules/tables/utils/getProductTableItem';
import { calculateTwapRuntimeInMillis } from 'client/modules/trading/components/twap/utils';
import { requireTimeTriggerCriteria } from 'client/modules/trading/utils/trigger/getTimeTriggerCriteria';
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
}

export function useHistoricalTimeTriggerOrdersTable({
  pageSize,
  productIds,
}: Params) {
  const { t } = useTranslation();

  const { data: allMarketsStaticData, isLoading: marketsDataLoading } =
    useAllMarketsStaticData();
  const { getExchangeRate } = useGetXStocksExchangeRate();

  const {
    isLoading,
    isFetchingCurrPage,
    currentPageData: historicalOrders,
    pagination,
  } = useDataTablePaginatedQuery({
    queryHook: usePaginatedSubaccountHistoricalTimeTriggerOrders,
    queryParams: {
      pageSize,
      productIds,
    },
    extractItems,
  });

  const mappedData: HistoricalTimeTriggerOrdersTableItem[] | undefined =
    useMemo(() => {
      if (!historicalOrders || !allMarketsStaticData) {
        return;
      }

      return historicalOrders
        .map(
          (
            triggerOrderInfo,
          ): HistoricalTimeTriggerOrdersTableItem | undefined => {
            return getHistoricalTimeTriggerOrderTableItem({
              t,
              triggerOrderInfo,
              allMarketsStaticData,
              exchangeRate: getExchangeRate(triggerOrderInfo.order.productId),
            });
          },
        )
        .filter(nonNullFilter);
    }, [historicalOrders, allMarketsStaticData, t, getExchangeRate]);

  return {
    isLoading: isLoading || marketsDataLoading || isFetchingCurrPage,
    mappedData,
    pagination,
  };
}

interface GetHistoricalTimeTriggerOrderTableItemParams {
  t: TFunction;
  triggerOrderInfo: TriggerOrderInfoWithEngineOrder;
  allMarketsStaticData: AllMarketsStaticDataForChainEnv;
  exchangeRate: BigNumber;
}

export function getHistoricalTimeTriggerOrderTableItem({
  t,
  triggerOrderInfo,
  allMarketsStaticData,
  exchangeRate,
}: GetHistoricalTimeTriggerOrderTableItemParams):
  | HistoricalTimeTriggerOrdersTableItem
  | undefined {
  const order = triggerOrderInfo.order;
  const productTableItem = getProductTableItem({
    productId: order.productId,
    allMarketsStaticData,
    exchangeRate,
  });
  const orderTableItem = getOrderTableItem({ triggerOrderInfo, exchangeRate });
  const appendix = orderTableItem.orderAppendix;

  if (!appendix.twap) {
    return;
  }

  // Only allow time trigger orders
  const timeTriggerCriteria = requireTimeTriggerCriteria(order.triggerCriteria);

  const triggeredEngineOrder = triggerOrderInfo.triggeredEngineOrder;

  const filledAvgPrice = triggeredEngineOrder
    ? calcOrderFillPrice(
        triggeredEngineOrder.quoteFilled,
        triggeredEngineOrder.totalFee,
        triggeredEngineOrder.baseFilled,
      )
    : undefined;

  const filledBaseSize = removeDecimals(
    triggeredEngineOrder?.baseFilled,
  )?.abs();
  const closedBaseSize = removeDecimals(
    triggeredEngineOrder?.closedAmount,
  )?.abs();

  const frequencyInSeconds = toBigNumber(
    timeTriggerCriteria.interval,
  ).toNumber();

  const totalRuntimeInMillis = calculateTwapRuntimeInMillis(
    frequencyInSeconds,
    appendix.twap.numOrders,
  );

  return {
    ...productTableItem,
    ...orderTableItem,
    timeUpdatedMillis: secondsToMilliseconds(triggerOrderInfo.updatedAt),
    filledAvgPrice: toXStocksDisplayPrice(filledAvgPrice, exchangeRate),
    filledBaseSize: toXStocksDisplayAmount(filledBaseSize, exchangeRate),
    closedBaseSize: toXStocksDisplayAmount(closedBaseSize, exchangeRate),
    status: getTriggerOrderStatusInfo(t, triggerOrderInfo),
    frequencyInMillis: secondsToMilliseconds(frequencyInSeconds),
    totalRuntimeInMillis,
  };
}
