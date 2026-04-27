import { useQueryServerTime } from 'client/hooks/query/useQueryServerTime';
import { useSyncedRef } from 'client/hooks/util/useSyncedRef';
import { useCallback } from 'react';

/**
 * Hook to get the current time in milliseconds, synced with server time if available.
 * This helps to avoid issues with client clock drift.
 */
export function useGetNowTimeInMillis() {
  const { data } = useQueryServerTime();

  const serverTimeRef = useSyncedRef(data?.serverTimeMillis);
  const serverTimeUpdatedAtRef = useSyncedRef(data?.updatedAtMonotonicMillis);

  const getNowTimeMillis = useCallback(() => {
    const serverTime = serverTimeRef.current;
    const serverTimeUpdatedAt = serverTimeUpdatedAtRef.current;

    if (!serverTime || !serverTimeUpdatedAt) {
      // Fallback to client time if server time is not available
      return Date.now();
    }

    // Otherwise, compute current time based on last known server time
    // and elapsed time since then
    // We use performance.now() to measure elapsed (monotonic!) time
    // without being affected by system clock skew/changes
    const timeSinceUpdateMillis = Math.floor(
      performance.now() - serverTimeUpdatedAt,
    );
    return serverTime + timeSinceUpdateMillis;
  }, [serverTimeUpdatedAtRef, serverTimeRef]);
  return getNowTimeMillis;
}

/**
 * Hook to get the current time in seconds, synced with server time if available.
 * This helps to avoid issues with client clock drift.
 */
export function useGetNowTimeInSeconds() {
  const getNowTimeMillis = useGetNowTimeInMillis();
  return useCallback(
    () => Math.floor(getNowTimeMillis() / 1000),
    [getNowTimeMillis],
  );
}
