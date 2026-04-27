import { IndexerSnapshotsIntervalParams } from '@nadohq/client';
import { NADO_LAUNCH_DATE_SECONDS } from '@nadohq/web-common';
import { useGetNowTimeInSeconds } from 'client/hooks/util/useGetNowTime';
import { ChartTimespan } from 'client/modules/charts/types';
import { getChartDataGranularity } from 'client/modules/charts/utils/getChartDataGranularity';
import { getTimespanInSeconds } from 'client/modules/charts/utils/timespan';

export function useChartSnapshotQueryParams(
  timespan: ChartTimespan,
  /** earliestTimeInSeconds should be set when chart has a defined launch date
   *  (eg. subaccount creation time or feature launch date)
   */
  earliestTimeInSeconds = NADO_LAUNCH_DATE_SECONDS,
): IndexerSnapshotsIntervalParams {
  const getNowTimeInSeconds = useGetNowTimeInSeconds();

  const timespanInSeconds = getTimespanInSeconds({
    timespan,
    earliestTimeInSeconds,
    nowInSeconds: getNowTimeInSeconds(),
  });
  const { granularity, limit } = getChartDataGranularity(timespanInSeconds);

  return {
    granularity,
    // request one more snapshot then the calculated limit as the backend returns first snapshot
    // with current time and then the remaining snapshots roughly aligned to granularity.
    // eg. 24h chart request at 10:30AM with 1h granularity will return snapshots at 10:30AM, 10AM up to previous 11AM.
    //     we need +1 to get the previous 10AM so that the chart represents a full 24h.
    limit: limit + 1,
  };
}
