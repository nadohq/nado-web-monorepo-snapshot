import {
  GetIndexerSubaccountMatchEventsResponse,
  IndexerMatchEvent,
  ProductEngineType,
  removeDecimals,
  toBigNumber,
} from '@nadohq/client';
import { calcOrderFillPrice } from '@nadohq/react-client';
import { nonNullFilter } from '@nadohq/web-common';
import { useDataTablePaginatedQuery } from 'client/components/DataTable/hooks/useDataTablePaginatedQuery';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { AllMarketsStaticDataForChainEnv } from 'client/hooks/query/markets/allMarketsStaticDataByChainEnv/types';
import { usePaginatedSubaccountHistoricalTrades } from 'client/hooks/query/subaccount/usePaginatedSubaccountHistoricalTrades';
import { HistoricalTradesTableItem } from 'client/modules/tables/types/HistoricalTradesTableItem';
import { calcHistoricalIsoLeverage } from 'client/modules/tables/utils/calcHistoricalIsoLeverage';
import { calcRealizedPnlInfo } from 'client/modules/tables/utils/calcRealizedPnlInfo';
import { getOrderTableItem } from 'client/modules/tables/utils/getOrderTableItem';
import { getProductTableItem } from 'client/modules/tables/utils/getProductTableItem';
import { createRowId } from 'client/utils/createRowId';
import { secondsToMilliseconds } from 'date-fns';
import { useMemo } from 'react';

interface Params {
  pageSize: number;
  productIds?: number[];
}

function extractItems(data: GetIndexerSubaccountMatchEventsResponse) {
  return data.events;
}

export function useHistoricalIndividualTradesTable({
  pageSize,
  productIds,
}: Params) {
  const { data: allMarketsStaticData } = useAllMarketsStaticData();

  const {
    currentPageData,
    isLoading: historicalOrdersLoading,
    isFetchingCurrPage,
    pagination,
  } = useDataTablePaginatedQuery({
    queryHook: usePaginatedSubaccountHistoricalTrades,
    queryParams: {
      pageSize,
      productIds,
    },
    extractItems,
  });

  const mappedData: HistoricalTradesTableItem[] | undefined = useMemo(() => {
    if (!currentPageData || !allMarketsStaticData) {
      return undefined;
    }

    return currentPageData
      .map((event): HistoricalTradesTableItem | undefined => {
        const staticMarketData =
          allMarketsStaticData.allMarkets[event.productId];
        const staticQuoteData = allMarketsStaticData.quotes[event.productId];

        if (!staticMarketData || !staticQuoteData) {
          return;
        }

        return getHistoricalIndividualTradesTableItem({
          event,
          allMarketsStaticData,
        });
      })
      .filter(nonNullFilter);
  }, [allMarketsStaticData, currentPageData]);

  return {
    isLoading: historicalOrdersLoading || isFetchingCurrPage,
    mappedData,
    pagination,
  };
}

interface GetHistoricalTradesTableItemParams {
  event: IndexerMatchEvent;
  allMarketsStaticData: AllMarketsStaticDataForChainEnv;
}

export function getHistoricalIndividualTradesTableItem({
  event,
  allMarketsStaticData,
}: GetHistoricalTradesTableItemParams): HistoricalTradesTableItem {
  const { productId, quoteFilled, baseFilled, totalFee, closedAmount } = event;

  const productTableItem = getProductTableItem({
    productId,
    allMarketsStaticData,
  });

  const preBase = event.preBalances.base;
  const decimalAdjustedPreBaseAmount = removeDecimals(preBase.amount);
  const decimalAdjustedPreEventPositionSize =
    decimalAdjustedPreBaseAmount.abs();

  const decimalAdjustedTotalFee = removeDecimals(totalFee);
  // Inclusive of fee
  const decimalAdjustedQuoteAmount = removeDecimals(toBigNumber(quoteFilled));
  const decimalAdjustedFilledAmount = removeDecimals(toBigNumber(baseFilled));

  const orderTableItem = getOrderTableItem({ indexerMatchEvent: event });

  const fillPrice = calcOrderFillPrice(
    decimalAdjustedQuoteAmount,
    decimalAdjustedTotalFee,
    decimalAdjustedFilledAmount,
  );

  const decimalAdjustedClosedSize = removeDecimals(closedAmount).abs();
  const hasClosedPosition = !decimalAdjustedClosedSize.isZero();

  const decimalAdjustedClosedNetEntry = removeDecimals(event.closedNetEntry);
  const decimalAdjustedPreCloseMargin = event.margin
    ? removeDecimals(event.margin)
    : null;

  const isoLeverage = calcHistoricalIsoLeverage({
    decimalAdjustedPreCloseMargin,
    decimalAdjustedPreBaseAmount,
    fillPrice,
    decimalAdjustedVQuoteBalance:
      preBase.type === ProductEngineType.PERP
        ? removeDecimals(preBase.vQuoteBalance)
        : undefined,
  });

  // preBalances.base.amount is the signed position size before the trade.
  const preClosePositionAmount = hasClosedPosition
    ? decimalAdjustedPreBaseAmount
    : undefined;

  const averageEntryPrice = hasClosedPosition
    ? decimalAdjustedClosedNetEntry.div(decimalAdjustedClosedSize).abs()
    : undefined;

  return {
    ...productTableItem,
    ...orderTableItem,
    rowId: createRowId(event.submissionIndex, productId, orderTableItem.digest),
    submissionIndex: event.submissionIndex,
    timeFilledMillis: secondsToMilliseconds(event.timestamp.toNumber()),
    filledPrice: fillPrice,
    filledBaseSize: decimalAdjustedFilledAmount.abs(),
    filledQuoteSize: decimalAdjustedQuoteAmount.abs(),
    tradeFeeQuote: decimalAdjustedTotalFee,
    marginModeType: orderTableItem.isIsolated ? 'isolated' : 'cross',
    closedBaseSize: hasClosedPosition ? decimalAdjustedClosedSize : undefined,
    preClosePositionAmount,
    averageEntryPrice,
    isoLeverage,
    realizedPnl: calcRealizedPnlInfo({
      realizedPnlUsd: removeDecimals(event.realizedPnl),
      isPerp: productTableItem.isPerp,
      closedBaseSize: decimalAdjustedClosedSize,
      closedNetEntry: decimalAdjustedClosedNetEntry,
      margin: decimalAdjustedPreCloseMargin,
      preEventPositionSize: decimalAdjustedPreEventPositionSize,
      longWeightInitial:
        allMarketsStaticData.allMarkets[productId]?.longWeightInitial,
    }),
  };
}
