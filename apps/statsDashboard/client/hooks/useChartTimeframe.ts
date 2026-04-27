import { TimeInSeconds } from '@nadohq/client';
import { NADO_LAUNCH_DATE_SECONDS } from '@nadohq/web-common';
import { SelectOption } from '@nadohq/web-ui';
import { dateWithDayAxisFormatter } from 'client/components/charts/axisFormatters';
import { differenceInWeeks, fromUnixTime } from 'date-fns';
import { atom, useAtom } from 'jotai';
import { useMemo } from 'react';

type ChartTimeframeID =
  | 'past_30_days'
  | 'past_60_days'
  | 'past_90_days'
  | 'all_time';

const TIMEFRAME_OPTIONS: SelectOption<ChartTimeframeID>[] = [
  {
    label: 'Past 30 Days',
    value: 'past_30_days',
  },
  {
    label: 'Past 60 Days',
    value: 'past_60_days',
  },
  {
    label: 'Past 90 Days',
    value: 'past_90_days',
  },
  {
    label: 'All Time',
    value: 'all_time',
  },
];

interface ChartTimeframeDetails {
  granularity: number;
  queryLimit: number;
  granularityLabel: string;
  xAxisTickFormatter: ((value: number) => string) | undefined;
}

const chartTimeframeAtom = atom(TIMEFRAME_OPTIONS[0].value);

interface UseChartTimeframeParams {
  allTimeStartDateSeconds: number;
}

/**
 * Hook for managing and retrieving chart timeframe settings.
 *
 * @param allTimeStartDateSeconds - Optional start date (Unix seconds) for "all time" view. Defaults to Nado launch.
 * @returns Config and state for the selected timeframe:
 *  - timeframe: Current selection
 *  - setTimeframe: Setter function
 *  - timeframeOptions: Available options
 *  - granularity: Data interval in seconds
 *  - queryLimit: Number of data points to fetch
 *  - granularityLabel: Label for granularity
 *  - xAxisTickFormatter: Formatter for x-axis ticks
 */
export function useChartTimeframe(params?: UseChartTimeframeParams) {
  const [timeframe, setTimeframe] =
    useAtom<ChartTimeframeID>(chartTimeframeAtom);

  const timeframeDetailsByTimeframe = useMemo(() => {
    const allTimeStartDateSeconds =
      params?.allTimeStartDateSeconds ?? NADO_LAUNCH_DATE_SECONDS;

    const weeksSinceLaunchDate = Math.ceil(
      differenceInWeeks(new Date(), fromUnixTime(allTimeStartDateSeconds)),
    );

    // Add one more day / month to query limit so we can calculate deltas if we need to.
    const baseLimit = 1;

    return {
      past_30_days: {
        granularity: TimeInSeconds.DAY,
        queryLimit: 30 + baseLimit,
        granularityLabel: 'daily',
        xAxisTickFormatter: dateWithDayAxisFormatter,
      },
      past_60_days: {
        granularity: TimeInSeconds.DAY,
        queryLimit: 60 + baseLimit,
        granularityLabel: 'daily',
        xAxisTickFormatter: dateWithDayAxisFormatter,
      },
      past_90_days: {
        granularity: TimeInSeconds.DAY,
        queryLimit: 90 + baseLimit,
        granularityLabel: 'daily',
        xAxisTickFormatter: dateWithDayAxisFormatter,
      },
      all_time: {
        granularity: 7 * TimeInSeconds.DAY,
        queryLimit: weeksSinceLaunchDate + baseLimit,
        granularityLabel: 'weekly',
        xAxisTickFormatter: dateWithDayAxisFormatter,
      },
    } satisfies Record<ChartTimeframeID, ChartTimeframeDetails>;
  }, [params?.allTimeStartDateSeconds]);

  return {
    ...timeframeDetailsByTimeframe[timeframe],
    timeframe,
    setTimeframe,
    timeframeOptions: TIMEFRAME_OPTIONS,
  };
}
