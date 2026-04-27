import { GetIndexerSubaccountNlpEventsParams } from '@nadohq/client';
import {
  EXPORT_HISTORY_QUERY_DELAY_MILLIS,
  EXPORT_HISTORY_QUERY_PAGE_SIZE,
} from 'client/pages/Portfolio/subpages/History/exportHistory/hooks/useExecuteExportHistory/consts';
import { GetExportHistoryDataContext } from 'client/pages/Portfolio/subpages/History/exportHistory/hooks/useExecuteExportHistory/types';
import { updateProgressFrac } from 'client/pages/Portfolio/subpages/History/exportHistory/hooks/useExecuteExportHistory/utils';
import {
  ExportHistorySettlementItem,
  GetExportHistoryDataParams,
} from 'client/pages/Portfolio/subpages/History/exportHistory/types';
import { getHistoricalSettlementsTableItem } from 'client/pages/Portfolio/subpages/History/hooks/useSettlementEventsTable';
import { delay } from 'client/utils/delay';
import { millisecondsToSeconds } from 'date-fns';
import { last } from 'lodash';

export async function getExportHistorySettlementsData(
  params: GetExportHistoryDataParams,
  context: GetExportHistoryDataContext,
) {
  const { subaccount, nadoClient, allMarketsStaticData } = context;
  const items: ExportHistorySettlementItem[] = [];

  let startCursor: string | undefined = undefined;

  queryLoop: while (true) {
    const queryParams: GetIndexerSubaccountNlpEventsParams = {
      subaccountOwner: subaccount.address,
      subaccountName: subaccount.name,
      maxTimestampInclusive: millisecondsToSeconds(params.endTimeMillis),
      limit: EXPORT_HISTORY_QUERY_PAGE_SIZE,
      startCursor,
    };

    const response =
      await nadoClient.context.indexerClient.getPaginatedSubaccountSettlementEvents(
        queryParams,
      );

    for (const event of response.events) {
      const tableItem = getHistoricalSettlementsTableItem({
        event,
        allMarketsStaticData,
      });
      if (tableItem.timestampMillis < params.startTimeMillis) {
        break queryLoop;
      }

      items.push({
        time: new Date(tableItem.timestampMillis),
        marketName: tableItem.productName,
        positionAmount: tableItem.positionAmount.toString(),
        settlementQuoteAmount: tableItem.settlementQuoteAmount.toString(),
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
