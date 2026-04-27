import { GetTriggerOrdersParams } from '@nadohq/client';
import { getTriggerOrdersWithEngineOrders } from 'client/hooks/query/subaccount/utils';
import { getHistoricalTimeTriggerOrderTableItem } from 'client/modules/tables/historicalOrders/historicalTimeTriggerOrders/useHistoricalTimeTriggerOrdersTable';
import { getOrderDirectionLabel } from 'client/modules/trading/utils/getOrderDirectionLabel';
import { getOrderTypeLabel } from 'client/modules/trading/utils/getOrderTypeLabel';
import {
  EXPORT_HISTORY_QUERY_DELAY_MILLIS,
  EXPORT_HISTORY_QUERY_PAGE_SIZE,
} from 'client/pages/Portfolio/subpages/History/exportHistory/hooks/useExecuteExportHistory/consts';
import { GetExportHistoryDataContext } from 'client/pages/Portfolio/subpages/History/exportHistory/hooks/useExecuteExportHistory/types';
import { updateProgressFrac } from 'client/pages/Portfolio/subpages/History/exportHistory/hooks/useExecuteExportHistory/utils';
import {
  ExportHistoryTimeTriggerOrderItem,
  GetExportHistoryDataParams,
} from 'client/pages/Portfolio/subpages/History/exportHistory/types';
import { delay } from 'client/utils/delay';
import { millisecondsToSeconds } from 'date-fns';
import { get, last } from 'lodash';

export async function getExportHistoryTimeTriggerOrdersData(
  params: GetExportHistoryDataParams,
  context: GetExportHistoryDataContext,
): Promise<ExportHistoryTimeTriggerOrderItem[]> {
  const { subaccount, nadoClient, allMarketsStaticData, t } = context;
  const items: ExportHistoryTimeTriggerOrderItem[] = [];

  let startCursor: number | undefined = undefined;

  queryLoop: while (true) {
    const queryParams: GetTriggerOrdersParams = {
      subaccountOwner: subaccount.address,
      subaccountName: subaccount.name,
      maxUpdateTimeInclusive:
        startCursor ?? millisecondsToSeconds(params.endTimeMillis),
      limit: EXPORT_HISTORY_QUERY_PAGE_SIZE + 1, // +1 to check if there's more data
      triggerTypes: ['time_trigger'],
      statusTypes: ['cancelled', 'twap_completed', 'internal_error'],
    };

    const response = await nadoClient.market.getTriggerOrders(queryParams);

    if (response.orders.length === 0) {
      break;
    }

    // This retrieves the (pageSize+1)th item in the response, which is used to determine if there is a next page
    const firstOrderOfNextPage = get(
      response.orders,
      EXPORT_HISTORY_QUERY_PAGE_SIZE,
      undefined,
    );

    const orders = response.orders.slice(0, EXPORT_HISTORY_QUERY_PAGE_SIZE);

    const triggerOrdersWithEngineOrders =
      await getTriggerOrdersWithEngineOrders({
        nadoClient,
        orders,
      });

    for (const triggerOrderInfo of triggerOrdersWithEngineOrders) {
      const tableItem = getHistoricalTimeTriggerOrderTableItem({
        t,
        triggerOrderInfo,
        allMarketsStaticData,
      });
      if (!tableItem) {
        continue;
      }

      if (tableItem.timeUpdatedMillis < params.startTimeMillis) {
        break queryLoop;
      }

      items.push({
        time: new Date(tableItem.timeUpdatedMillis),
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
        filledAvgPrice: tableItem.filledAvgPrice?.toString(),
        filledSize: tableItem.filledBaseSize?.toString(),
        totalSize: tableItem.totalBaseSize.toString(),
        reduceOnly: tableItem.isReduceOnly ? t(($) => $.yes) : t(($) => $.no),
        frequencyInSeconds: millisecondsToSeconds(tableItem.frequencyInMillis),
        runtimeInSeconds: millisecondsToSeconds(tableItem.totalRuntimeInMillis),
        status: tableItem.status.statusText,
        statusDetails: tableItem.status.detailsText,
        orderId: tableItem.digest,
      });
    }

    // Update the next cursor
    startCursor = firstOrderOfNextPage?.updatedAt;
    // Break if there are no more events for pagination
    if (!startCursor) {
      break;
    }

    updateProgressFrac(params, context, last(items)?.time);

    // Reduce chance of rate limiting.
    await delay(EXPORT_HISTORY_QUERY_DELAY_MILLIS);
  }

  return items;
}
