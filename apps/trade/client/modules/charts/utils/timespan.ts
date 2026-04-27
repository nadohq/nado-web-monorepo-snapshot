import { TimeInSeconds } from '@nadohq/client';
import { NADO_LAUNCH_DATE_SECONDS } from '@nadohq/web-common';
import type { ChartTimespan } from 'client/modules/charts/types';
import type { TFunction } from 'i18next';

export function getTimespanMetadata(t: TFunction, timespan: ChartTimespan) {
  switch (timespan) {
    case '24h':
      return {
        id: timespan,
        label: t(($) => $.durations.label24h),
        shortLabel: t(($) => $.durations.label24h),
        timespanInSeconds: TimeInSeconds.DAY,
      };
    case '7d':
      return {
        id: timespan,
        label: t(($) => $.durations.label7d),
        shortLabel: t(($) => $.durations.label7d),
        timespanInSeconds: 7 * TimeInSeconds.DAY,
      };
    case '30d':
      return {
        id: timespan,
        label: t(($) => $.durations.label30d),
        shortLabel: t(($) => $.durations.label30d),
        timespanInSeconds: 30 * TimeInSeconds.DAY,
      };
    case 'all_time':
      return {
        id: timespan,
        label: t(($) => $.durations.allTime),
        shortLabel: t(($) => $.durations.allTimeShort),
        timespanInSeconds: Infinity,
      };
  }
}

/**
 * Minimum timespan for the all-time chart.
 * This is to avoid showing a hard-to-read chart with short timespans (eg. new account that just deposited)
 */
const MIN_ALL_TIME_CHART_TIMESPAN = 7 * TimeInSeconds.DAY;

interface GetTimespanInSecondsParams {
  timespan: ChartTimespan;
  earliestTimeInSeconds: number | null | undefined;
  nowInSeconds: number;
}

export function getTimespanInSeconds({
  timespan,
  earliestTimeInSeconds,
  nowInSeconds,
}: GetTimespanInSecondsParams) {
  if (timespan === 'all_time') {
    return Math.max(
      nowInSeconds - (earliestTimeInSeconds ?? NADO_LAUNCH_DATE_SECONDS),
      MIN_ALL_TIME_CHART_TIMESPAN,
    );
  }

  // we only need `timespanInSeconds` so we do not need to pass real TFunction here
  const dummyT = (_selector: (keys: any) => any) => '';
  return getTimespanMetadata(dummyT as TFunction, timespan).timespanInSeconds;
}
