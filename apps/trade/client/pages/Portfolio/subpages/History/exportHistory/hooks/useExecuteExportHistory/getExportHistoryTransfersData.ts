import { GetIndexerSubaccountCollateralEventsParams } from '@nadohq/client';
import { getTransferCollateralEvent } from 'client/modules/events/collateral/getTransferCollateralEvent';
import {
  EXPORT_HISTORY_QUERY_DELAY_MILLIS,
  EXPORT_HISTORY_QUERY_PAGE_SIZE,
} from 'client/pages/Portfolio/subpages/History/exportHistory/hooks/useExecuteExportHistory/consts';
import { GetExportHistoryDataContext } from 'client/pages/Portfolio/subpages/History/exportHistory/hooks/useExecuteExportHistory/types';
import { updateProgressFrac } from 'client/pages/Portfolio/subpages/History/exportHistory/hooks/useExecuteExportHistory/utils';
import {
  ExportHistoryTransferItem,
  GetExportHistoryDataParams,
} from 'client/pages/Portfolio/subpages/History/exportHistory/types';
import { delay } from 'client/utils/delay';
import { millisecondsToSeconds } from 'date-fns';
import { last } from 'lodash';

export async function getExportHistoryTransfersData(
  params: GetExportHistoryDataParams,
  context: GetExportHistoryDataContext,
) {
  const {
    subaccount,
    nadoClient,
    allMarketsStaticData,
    getSubaccountProfile,
    t,
  } = context;

  const items: ExportHistoryTransferItem[] = [];

  let startCursor: string | undefined = undefined;

  queryLoop: while (true) {
    const queryParams: GetIndexerSubaccountCollateralEventsParams = {
      subaccountOwner: subaccount.address,
      subaccountName: subaccount.name,
      maxTimestampInclusive: millisecondsToSeconds(params.endTimeMillis),
      limit: EXPORT_HISTORY_QUERY_PAGE_SIZE,
      startCursor,
      eventTypes: ['transfer_quote'],
    };

    const collateralEventsResponse =
      await nadoClient.context.indexerClient.getPaginatedSubaccountCollateralEvents(
        queryParams,
      );

    for (const indexerEvent of collateralEventsResponse.events) {
      const event = getTransferCollateralEvent({
        event: indexerEvent,
        allMarketsStaticData,
        getSubaccountProfile,
        t,
      });

      // Check timestamp
      if (event.timestampMillis < params.startTimeMillis) {
        break queryLoop;
      }

      items.push({
        time: new Date(event.timestampMillis),
        asset: event.token.symbol,
        balanceChange: event.amount.toString(),
        fromSubaccountName: event.fromSubaccount.name,
        fromSubaccountDisplayName: event.fromSubaccount.username,
        toSubaccountName: event.toSubaccount.name,
        toSubaccountDisplayName: event.toSubaccount.username,
      });
    }

    // Update the next cursor
    startCursor = collateralEventsResponse.meta.nextCursor;
    // Break if there are no more events for pagination
    if (!collateralEventsResponse.meta.hasMore || !startCursor) {
      break;
    }

    updateProgressFrac(params, context, last(items)?.time);

    // Reduce chance of rate limiting.
    await delay(EXPORT_HISTORY_QUERY_DELAY_MILLIS);
  }

  return items;
}
