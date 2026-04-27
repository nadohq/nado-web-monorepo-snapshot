import { GetIndexerSubaccountLiquidationEventsParams } from '@nadohq/client';
import { getHistoricalLiquidationsTableItem } from 'client/modules/tables/liquidations/LiquidationEventsTable/useLiquidationEventsTable';
import {
  EXPORT_HISTORY_QUERY_DELAY_MILLIS,
  EXPORT_HISTORY_QUERY_PAGE_SIZE,
} from 'client/pages/Portfolio/subpages/History/exportHistory/hooks/useExecuteExportHistory/consts';
import { GetExportHistoryDataContext } from 'client/pages/Portfolio/subpages/History/exportHistory/hooks/useExecuteExportHistory/types';
import { updateProgressFrac } from 'client/pages/Portfolio/subpages/History/exportHistory/hooks/useExecuteExportHistory/utils';
import {
  ExportHistoryLiquidationItem,
  GetExportHistoryDataParams,
} from 'client/pages/Portfolio/subpages/History/exportHistory/types';
import { delay } from 'client/utils/delay';
import { millisecondsToSeconds } from 'date-fns';
import { last } from 'lodash';

export async function getExportHistoryLiquidationsData(
  params: GetExportHistoryDataParams,
  context: GetExportHistoryDataContext,
) {
  const { subaccount, nadoClient, allMarketsStaticData, t } = context;
  const items: ExportHistoryLiquidationItem[] = [];

  let startCursor: string | undefined = undefined;

  queryLoop: while (true) {
    const queryParams: GetIndexerSubaccountLiquidationEventsParams = {
      subaccountOwner: subaccount.address,
      subaccountName: subaccount.name,
      maxTimestampInclusive: millisecondsToSeconds(params.endTimeMillis),
      limit: EXPORT_HISTORY_QUERY_PAGE_SIZE,
      startCursor,
    };

    const liquidationEventsResponse =
      await nadoClient.context.indexerClient.getPaginatedSubaccountLiquidationEvents(
        queryParams,
      );

    for (const event of liquidationEventsResponse.events) {
      const tableItem = getHistoricalLiquidationsTableItem({
        allMarketsStaticData,
        event,
      });

      if (!tableItem) {
        continue;
      }

      // Check timestamp
      if (tableItem.timestampMillis < params.startTimeMillis) {
        break queryLoop;
      }

      // Add spot
      if (tableItem.spot) {
        items.push({
          time: new Date(tableItem.timestampMillis),
          submissionIndex: tableItem.submissionIndex,
          balanceType: t(($) => $.spot),
          marginModeType: tableItem.spot.isIsolated
            ? t(($) => $.isolated)
            : t(($) => $.cross),
          productName: tableItem.spot.productName,
          amountLiquidated: tableItem.spot.amountLiquidated.toString(),
          liquidatedValueUsd: tableItem.spot.liquidatedValueUsd.toString(),
        });
      }

      // Add perp
      if (tableItem.perp) {
        items.push({
          time: new Date(tableItem.timestampMillis),
          submissionIndex: tableItem.submissionIndex,
          balanceType: t(($) => $.perp),
          marginModeType: tableItem.perp.isIsolated
            ? t(($) => $.isolated)
            : t(($) => $.cross),
          productName: tableItem.perp.productName,
          amountLiquidated: tableItem.perp.amountLiquidated.toString(),
          liquidatedValueUsd: tableItem.perp.liquidatedValueUsd.toString(),
        });
      }
    }

    // Update the next cursor
    startCursor = liquidationEventsResponse.meta.nextCursor;
    // Break if there are no more events for pagination
    if (!liquidationEventsResponse.meta.hasMore || !startCursor) {
      break;
    }

    updateProgressFrac(params, context, last(items)?.time);

    // Reduce chance of rate limiting.
    await delay(EXPORT_HISTORY_QUERY_DELAY_MILLIS);
  }

  return items;
}
