import { GetIndexerPaginatedOrdersParams } from '@nadohq/client';
import { getHistoricalEngineOrderTableItem } from 'client/modules/tables/historicalOrders/historicalEngineOrders/useHistoricalEngineOrdersTable';
import { getOrderDirectionLabel } from 'client/modules/trading/utils/getOrderDirectionLabel';
import {
  EXPORT_HISTORY_QUERY_DELAY_MILLIS,
  EXPORT_HISTORY_QUERY_PAGE_SIZE,
} from 'client/pages/Portfolio/subpages/History/exportHistory/hooks/useExecuteExportHistory/consts';
import { GetExportHistoryDataContext } from 'client/pages/Portfolio/subpages/History/exportHistory/hooks/useExecuteExportHistory/types';
import { updateProgressFrac } from 'client/pages/Portfolio/subpages/History/exportHistory/hooks/useExecuteExportHistory/utils';
import {
  ExportHistoryAggregatedTradeItem,
  GetExportHistoryDataParams,
} from 'client/pages/Portfolio/subpages/History/exportHistory/types';
import { delay } from 'client/utils/delay';
import { isReversalFillEvent } from 'client/utils/isReversalFillEvent';
import { millisecondsToSeconds } from 'date-fns';
import { last } from 'lodash';

/**
 * Retrieves historical aggregated trades (filled orders, including trigger orders) for export.
 * Mirrors the data shown in the HistoricalAggregatedTradesTable.
 */
export async function getExportHistoryAggregatedTradesData(
  params: GetExportHistoryDataParams,
  context: GetExportHistoryDataContext,
): Promise<ExportHistoryAggregatedTradeItem[]> {
  const { subaccount, nadoClient, allMarketsStaticData, getExchangeRate, t } =
    context;
  const items: ExportHistoryAggregatedTradeItem[] = [];

  let startCursor: string | undefined = undefined;

  // Note: orders are returned ordered by placement (submission index), not by fill time.
  // `lastFillTimestamp` is therefore not monotonically decreasing across pages, so we cannot
  // break the loop early on it. The upper bound is capped server-side via `maxTimestampInclusive`
  // (placement time <= endTime, which is safe since a fill cannot occur before placement).
  while (true) {
    const queryParams: GetIndexerPaginatedOrdersParams = {
      subaccountOwner: subaccount.address,
      subaccountName: subaccount.name,
      maxTimestampInclusive: millisecondsToSeconds(params.endTimeMillis),
      limit: EXPORT_HISTORY_QUERY_PAGE_SIZE,
      startCursor,
      // Include engine, price-trigger, and time-trigger orders to match the aggregated trades table
      triggerTypes: ['time_trigger', 'price_trigger', 'none'],
    };

    const response =
      await nadoClient.context.indexerClient.getPaginatedSubaccountOrders(
        queryParams,
      );

    if (response.orders.length === 0) {
      break;
    }

    for (const order of response.orders) {
      const tableItem = getHistoricalEngineOrderTableItem({
        order,
        allMarketsStaticData,
        t,
        exchangeRate: getExchangeRate(order.productId),
      });

      items.push({
        time: new Date(tableItem.lastFillTimeMillis),
        marketName: tableItem.productName,
        direction: getOrderDirectionLabel({
          ...tableItem,
          t,
          isReversal: isReversalFillEvent(
            tableItem.closedBaseSize,
            tableItem.filledBaseSize,
          ),
        }),
        marginModeType: tableItem.isIsolated
          ? t(($) => $.isolated)
          : t(($) => $.cross),
        price: tableItem.filledAvgPrice.toString(),
        size: tableItem.filledBaseSize.toString(),
        tradeValue: tableItem.filledQuoteSize.toString(),
        fee: tableItem.tradeFeeQuote.toString(),
        realizedPnl: tableItem.realizedPnl?.pnlUsd.toString(),
        closedSize: tableItem.closedBaseSize?.toString(),
        orderId: tableItem.digest,
      });
    }

    // Update the next cursor
    startCursor = response.meta.nextCursor;
    // Break if there are no more events for pagination
    if (!response.meta.hasMore || !startCursor) {
      break;
    }

    updateProgressFrac(params, context, last(items)?.time);

    // Reduce chance of rate limiting.
    await delay(EXPORT_HISTORY_QUERY_DELAY_MILLIS);
  }

  return items;
}
