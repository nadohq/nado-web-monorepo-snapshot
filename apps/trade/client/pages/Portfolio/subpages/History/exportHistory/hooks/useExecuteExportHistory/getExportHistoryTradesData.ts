import { GetIndexerSubaccountMatchEventParams } from '@nadohq/client';
import { getHistoricalIndividualTradesTableItem } from 'client/modules/tables/historicalTrades/historicalIndividualTrades/useHistoricalIndividualTradesTable';
import { getOrderDirectionLabel } from 'client/modules/trading/utils/getOrderDirectionLabel';
import {
  EXPORT_HISTORY_QUERY_DELAY_MILLIS,
  EXPORT_HISTORY_QUERY_PAGE_SIZE,
} from 'client/pages/Portfolio/subpages/History/exportHistory/hooks/useExecuteExportHistory/consts';
import { GetExportHistoryDataContext } from 'client/pages/Portfolio/subpages/History/exportHistory/hooks/useExecuteExportHistory/types';
import { updateProgressFrac } from 'client/pages/Portfolio/subpages/History/exportHistory/hooks/useExecuteExportHistory/utils';
import {
  ExportHistoryTradeItem,
  GetExportHistoryDataParams,
} from 'client/pages/Portfolio/subpages/History/exportHistory/types';
import { delay } from 'client/utils/delay';
import { millisecondsToSeconds } from 'date-fns';
import { last } from 'lodash';

export async function getExportHistoryTradesData(
  params: GetExportHistoryDataParams,
  context: GetExportHistoryDataContext,
) {
  const { subaccount, nadoClient, allMarketsStaticData, t } = context;
  const items: ExportHistoryTradeItem[] = [];

  let startCursor: string | undefined = undefined;

  queryLoop: while (true) {
    const queryParams: GetIndexerSubaccountMatchEventParams = {
      subaccountOwner: subaccount.address,
      subaccountName: subaccount.name,
      maxTimestampInclusive: millisecondsToSeconds(params.endTimeMillis),
      limit: EXPORT_HISTORY_QUERY_PAGE_SIZE,
      startCursor,
    };

    const matchEventsResponse =
      await nadoClient.context.indexerClient.getPaginatedSubaccountMatchEvents(
        queryParams,
      );

    for (const event of matchEventsResponse.events) {
      const tableItem = getHistoricalIndividualTradesTableItem({
        event,
        allMarketsStaticData,
      });

      // Check timestamp
      if (tableItem.timeFilledMillis < params.startTimeMillis) {
        break queryLoop;
      }

      items.push({
        time: new Date(tableItem.timeFilledMillis),
        marketName: tableItem.productName,
        direction: getOrderDirectionLabel({ ...tableItem, t }),
        marginModeType: tableItem.isIsolated
          ? t(($) => $.isolated)
          : t(($) => $.cross),
        amount: tableItem.filledBaseSize.toString(),
        price: tableItem.filledPrice.toString(),
        fee: tableItem.tradeFeeQuote.toString(),
        total: tableItem.filledQuoteSize.toString(),
        realizedPnl: tableItem.realizedPnl?.pnlUsd.toString(),
        closedSize: tableItem.closedBaseSize?.toString(),
        orderId: tableItem.digest,
      });
    }

    // Update the next cursor
    startCursor = matchEventsResponse.meta.nextCursor;
    // Break if there are no more events for pagination
    if (!matchEventsResponse.meta.hasMore || !startCursor) {
      break;
    }

    updateProgressFrac(params, context, last(items)?.time);

    // Reduce chance of rate limiting.
    await delay(EXPORT_HISTORY_QUERY_DELAY_MILLIS);
  }

  return items;
}
