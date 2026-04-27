import { GetIndexerPaginatedOrdersParams } from '@nadohq/client';
import { getHistoricalEngineOrderTableItem } from 'client/modules/tables/historicalOrders/historicalEngineOrders/useHistoricalEngineOrdersTable';
import { getOrderDirectionLabel } from 'client/modules/trading/utils/getOrderDirectionLabel';
import { getOrderTypeLabel } from 'client/modules/trading/utils/getOrderTypeLabel';
import {
  EXPORT_HISTORY_QUERY_DELAY_MILLIS,
  EXPORT_HISTORY_QUERY_PAGE_SIZE,
} from 'client/pages/Portfolio/subpages/History/exportHistory/hooks/useExecuteExportHistory/consts';
import { GetExportHistoryDataContext } from 'client/pages/Portfolio/subpages/History/exportHistory/hooks/useExecuteExportHistory/types';
import { updateProgressFrac } from 'client/pages/Portfolio/subpages/History/exportHistory/hooks/useExecuteExportHistory/utils';
import {
  ExportHistoryEngineOrderItem,
  GetExportHistoryDataParams,
} from 'client/pages/Portfolio/subpages/History/exportHistory/types';
import { delay } from 'client/utils/delay';
import { millisecondsToSeconds } from 'date-fns';
import { last } from 'lodash';

/**
 * Retrieves historical engine orders data for export
 */
export async function getExportHistoryEngineOrdersData(
  params: GetExportHistoryDataParams,
  context: GetExportHistoryDataContext,
): Promise<ExportHistoryEngineOrderItem[]> {
  const { subaccount, nadoClient, allMarketsStaticData, t } = context;
  const items: ExportHistoryEngineOrderItem[] = [];

  let startCursor: string | undefined = undefined;

  queryLoop: while (true) {
    const queryParams: GetIndexerPaginatedOrdersParams = {
      subaccountOwner: subaccount.address,
      subaccountName: subaccount.name,
      maxTimestampInclusive: millisecondsToSeconds(params.endTimeMillis),
      limit: EXPORT_HISTORY_QUERY_PAGE_SIZE,
      startCursor,
      triggerTypes: ['none'],
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
      });

      if (tableItem.timePlacedMillis < params.startTimeMillis) {
        break queryLoop;
      }

      items.push({
        time: new Date(tableItem.timePlacedMillis),
        marketName: tableItem.productName,
        orderType: getOrderTypeLabel({
          t,
          orderAppendix: tableItem.orderAppendix,
          orderSide: tableItem.orderSide,
          priceTriggerCriteria: undefined,
        }),
        direction: getOrderDirectionLabel({ ...tableItem, t }),
        marginModeType: tableItem.isIsolated
          ? t(($) => $.isolated)
          : t(($) => $.cross),
        orderPrice: tableItem.orderPrice.toString(),
        filledSize: tableItem.filledBaseSize.toString(),
        totalSize: tableItem.totalBaseSize.toString(),
        reduceOnly: tableItem.isReduceOnly ? t(($) => $.yes) : t(($) => $.no),
        realizedPnl: tableItem.realizedPnl?.pnlUsd.toString(),
        closedSize: tableItem.closedBaseSize?.toString(),
        status: tableItem.statusText,
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
