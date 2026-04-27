import {
  GetIndexerSubaccountNlpEventsParams,
  removeDecimals,
} from '@nadohq/client';
import {
  EXPORT_HISTORY_QUERY_DELAY_MILLIS,
  EXPORT_HISTORY_QUERY_PAGE_SIZE,
} from 'client/pages/Portfolio/subpages/History/exportHistory/hooks/useExecuteExportHistory/consts';
import { GetExportHistoryDataContext } from 'client/pages/Portfolio/subpages/History/exportHistory/hooks/useExecuteExportHistory/types';
import { updateProgressFrac } from 'client/pages/Portfolio/subpages/History/exportHistory/hooks/useExecuteExportHistory/utils';
import {
  ExportHistoryNlpItem,
  GetExportHistoryDataParams,
} from 'client/pages/Portfolio/subpages/History/exportHistory/types';
import { delay } from 'client/utils/delay';
import { millisecondsToSeconds, secondsToMilliseconds } from 'date-fns';
import { last } from 'lodash';

export async function getExportHistoryNlpData(
  params: GetExportHistoryDataParams,
  context: GetExportHistoryDataContext,
) {
  const { subaccount, nadoClient } = context;
  const items: ExportHistoryNlpItem[] = [];

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
      await nadoClient.context.indexerClient.getPaginatedSubaccountNlpEvents(
        queryParams,
      );

    for (const event of response.events) {
      const timestampMillis = secondsToMilliseconds(event.timestamp.toNumber());
      if (timestampMillis < params.startTimeMillis) {
        break queryLoop;
      }

      items.push({
        time: new Date(timestampMillis),
        nlpAmountDelta: removeDecimals(event.nlpDelta).toString(),
        primaryQuoteAmountDelta: removeDecimals(
          event.primaryQuoteDelta,
        ).toString(),
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
