import { nowInSeconds, TimeInSeconds } from '@nadohq/client';
import { useQuery } from '@tanstack/react-query';

function alertUpcomingMaintenanceWindowQueryKey() {
  return ['alertUpcomingMaintenanceWindow'];
}

// UNIX timestamps for the reference times of the maintenance windows
const MON_MAINT_REF_TIME = 1724076000; // Monday, Aug 19, 2pm UTC
const THU_MAINT_REF_TIME = 1724335200; // Thursday, Aug 22, 2pm UTC

const ONE_WEEK = TimeInSeconds.DAY * 7;

/**
 * The expression; ONE_WEEK - (NOW - MAINT_WINDOW_REF_TIME) % ONE_WEEK < ONE_DAY
 * checks if the difference between maintenance reference time (MAINT_WINDOW_REF_TIME)
 * and the current time (NOW), modulo one week, is less than the duration of one day (ONE_DAY).
 * @returns True if a maintenance window is upcoming within the next day, false otherwise
 */
export function useAlertUpcomingMaintenanceWindow(): boolean {
  const { data } = useQuery({
    queryKey: alertUpcomingMaintenanceWindowQueryKey(),
    queryFn: async () => {
      const refTimes: number[] = [MON_MAINT_REF_TIME, THU_MAINT_REF_TIME];
      const now = nowInSeconds();

      return refTimes.some((refTime) => {
        // Checking if time to the next maintenance window is less than 24 hours
        const timeToNextMaintWindow = ONE_WEEK - ((now - refTime) % ONE_WEEK);
        return timeToNextMaintWindow < TimeInSeconds.DAY;
      });
    },
  });
  return data ?? false;
}
