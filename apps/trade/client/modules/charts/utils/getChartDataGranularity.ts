import { TimeInSeconds } from '@nadohq/client';

const MAX_DATA_POINTS = 30;

function roundUp(value: number, granularity: number) {
  return Math.ceil(value / granularity) * granularity;
}

interface ChartDataGranularity {
  granularity: number;
  limit: number;
}

/**
 * getGranularity returns an appropriate granularity and limit for a given timespan.
 *
 * Currently, it uses the following rules:
 * For timespans less than or equal to 1 day, it returns hourly granularity.
 * For timespans less than or equal to 7 days, it returns 8-hour granularity.
 * For timespans less than or equal to 30 days, it returns daily granularity.
 * For longer timespans, it rounds up granularity to the nearest day so that timespanInSeconds would not require more than MAX_DATA_POINTS.
 *
 * @param timespanInSeconds timespan in seconds
 * @returns ChartDataGranularity
 */
export function getChartDataGranularity(
  timespanInSeconds: number,
): ChartDataGranularity {
  if (timespanInSeconds <= TimeInSeconds.DAY) {
    return { granularity: TimeInSeconds.HOUR, limit: 24 };
  }
  if (timespanInSeconds <= 7 * TimeInSeconds.DAY) {
    return { granularity: 8 * TimeInSeconds.HOUR, limit: 21 };
  }
  if (timespanInSeconds <= 30 * TimeInSeconds.DAY) {
    return { granularity: TimeInSeconds.DAY, limit: 30 };
  }
  return {
    granularity: roundUp(
      timespanInSeconds / MAX_DATA_POINTS,
      TimeInSeconds.DAY,
    ),
    limit: MAX_DATA_POINTS,
  };
}
