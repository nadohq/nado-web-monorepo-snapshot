import { useGetNowTimeInSeconds } from 'client/hooks/util/useGetNowTime';
import { ChartTimespan } from 'client/modules/charts/types';
import { getChartDataGranularity } from 'client/modules/charts/utils/getChartDataGranularity';
import { getTimespanInSeconds } from 'client/modules/charts/utils/timespan';
import { rangeRight } from 'lodash';
import { useMemo } from 'react';

interface Params {
  /** timespan of the chart */
  timespan: ChartTimespan;

  /** earliestTimeInSeconds should be set when chart has a defined launch date
   *  (eg. subaccount creation time or feature launch date)
   *  it is null when it cannot be determined (eg. subaccount creation time is not available)
   */
  earliestTimeInSeconds?: number | null;
}

interface ChartQuerySecondsBeforeNow {
  secondsBeforeNow: number[] | undefined;
}

/**
 * Given a timespan, return the query times for the chart structured as an array of (secondsBeforeNow)[]
 * where the last element is 0 (i.e. current time).
 * Timestamps are aligned to hour or day granularity.
 */
export function useChartQuerySecondsBeforeNow({
  timespan,
  earliestTimeInSeconds,
}: Params): ChartQuerySecondsBeforeNow {
  const getNowTimeInSeconds = useGetNowTimeInSeconds();
  return useMemo(() => {
    const secondsBeforeNow = (() => {
      const nowInSeconds = getNowTimeInSeconds();
      const timespanInSeconds = getTimespanInSeconds({
        timespan,
        earliestTimeInSeconds,
        nowInSeconds,
      });
      const { granularity } = getChartDataGranularity(timespanInSeconds);

      // secondsToLastGranularityTimestamp is the number of seconds from now until
      // the latest timestamp aligned to the granularity.
      // examples:
      // - if now is 10:02AM and granularity is 1 hour, value is 120 (2 minutes)
      // - if now is 10:02AM and granularity is 1 day, value is 36120 (10 hours 2 minutes)
      const secondsToLastGranularityTimestamp = nowInSeconds % granularity;

      const secondsBeforeNow = rangeRight(
        // we start range from latest aligned timestamp
        secondsToLastGranularityTimestamp,
        // then range backwards down to the earliest timestamp aligned to the granularity
        timespanInSeconds + granularity,
        granularity,
      );

      return secondsToLastGranularityTimestamp === 0
        ? secondsBeforeNow
        : [...secondsBeforeNow, 0];
    })();

    return { secondsBeforeNow };
  }, [timespan, earliestTimeInSeconds, getNowTimeInSeconds]);
}
