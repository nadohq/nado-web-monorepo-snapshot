import { GetTriggerOrdersParams, toBigNumber } from '@nadohq/client';
import { getTriggerOrdersWithEngineOrders } from 'client/hooks/query/subaccount/utils';
import { getHistoricalPriceTriggerOrderTableItem } from 'client/modules/tables/historicalOrders/historicalPriceTriggerOrders/useHistoricalPriceTriggerOrdersTable';
import { isTpSlMaxOrderSize } from 'client/modules/trading/tpsl/utils/isTpSlMaxOrderSize';
import { getOrderDirectionLabel } from 'client/modules/trading/utils/getOrderDirectionLabel';
import { getOrderTypeLabel } from 'client/modules/trading/utils/getOrderTypeLabel';
import { getTriggerReferencePriceType } from 'client/modules/trading/utils/trigger/getTriggerReferencePriceType';
import {
  EXPORT_HISTORY_QUERY_DELAY_MILLIS,
  EXPORT_HISTORY_QUERY_PAGE_SIZE,
} from 'client/pages/Portfolio/subpages/History/exportHistory/hooks/useExecuteExportHistory/consts';
import { GetExportHistoryDataContext } from 'client/pages/Portfolio/subpages/History/exportHistory/hooks/useExecuteExportHistory/types';
import { updateProgressFrac } from 'client/pages/Portfolio/subpages/History/exportHistory/hooks/useExecuteExportHistory/utils';
import {
  ExportHistoryPriceTriggerOrderItem,
  GetExportHistoryDataParams,
} from 'client/pages/Portfolio/subpages/History/exportHistory/types';
import { delay } from 'client/utils/delay';
import { millisecondsToSeconds } from 'date-fns';
import { get, last } from 'lodash';

interface GetExportHistoryPriceTriggerOrdersDataParams {
  reduceOnly: boolean;
}

export async function getExportHistoryPriceTriggerOrdersData(
  params: GetExportHistoryDataParams,
  context: GetExportHistoryDataContext,
  { reduceOnly }: GetExportHistoryPriceTriggerOrdersDataParams,
): Promise<ExportHistoryPriceTriggerOrderItem[]> {
  const { subaccount, nadoClient, allMarketsStaticData, t } = context;
  const items: ExportHistoryPriceTriggerOrderItem[] = [];

  let startCursor: number | undefined = undefined;

  queryLoop: while (true) {
    const queryParams: GetTriggerOrdersParams = {
      subaccountOwner: subaccount.address,
      subaccountName: subaccount.name,
      maxUpdateTimeInclusive:
        startCursor ?? millisecondsToSeconds(params.endTimeMillis),
      limit: EXPORT_HISTORY_QUERY_PAGE_SIZE + 1, // +1 to check if there's more data
      triggerTypes: ['price_trigger'],
      statusTypes: ['cancelled', 'triggering', 'triggered', 'internal_error'],
      reduceOnly,
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
      const tableItem = getHistoricalPriceTriggerOrderTableItem({
        t,
        triggerOrderInfo,
        allMarketsStaticData,
      });

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
          priceTriggerCriteria: tableItem.priceTriggerCriteria,
        }),
        direction: getOrderDirectionLabel({ ...tableItem, t }),
        marginModeType: tableItem.isIsolated
          ? t(($) => $.isolated)
          : t(($) => $.cross),
        orderPrice: tableItem.isMarket
          ? t(($) => $.orderTypes.market)
          : tableItem.orderPrice.toString(),
        filledAvgPrice: tableItem.filledAvgPrice?.toString(),
        filledSize: tableItem.filledBaseSize?.toString(),
        totalSize: isTpSlMaxOrderSize(tableItem.totalBaseSize)
          ? t(($) => $.entirePosition)
          : tableItem.totalBaseSize.toString(),
        triggerPrice: toBigNumber(
          tableItem.priceTriggerCriteria.triggerPrice,
        ).toString(),
        triggerReferencePriceType: getTriggerReferencePriceType(
          tableItem.priceTriggerCriteria,
        ),
        reduceOnly: tableItem.isReduceOnly ? t(($) => $.yes) : t(($) => $.no),
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
