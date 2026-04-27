import {
  QueryDisabledError,
  usePrimaryChainNadoClient,
} from '@nadohq/react-client';
import { useQuery, UseQueryResult } from '@tanstack/react-query';

export function serverTimeQueryKey() {
  return ['serverTime'];
}

interface UseQueryServerTime {
  /** Server time in milliseconds since the Unix epoch */
  serverTimeMillis: number;
  /** Latency in milliseconds for the server time request */
  latencyMillis: number;
  /**
   *  Monotonic timestamp in milliseconds when serverTimeMillis was last updated.
   *  NOT A UNIX TIMESTAMP.
   *  This value is only useful for duration measurements with performance.now()
   */
  updatedAtMonotonicMillis: number;
}

/**
 * Query for server time that refreshes every minute.
 */
export function useQueryServerTime(): UseQueryResult<UseQueryServerTime> {
  const nadoClient = usePrimaryChainNadoClient();
  const disabled = !nadoClient;

  return useQuery({
    queryKey: serverTimeQueryKey(),
    queryFn: async () => {
      if (disabled) {
        throw new QueryDisabledError();
      }

      // Using performance.now() for monotonic timing so that we can safely
      // derive durations and sync server time with client time without being
      // affected by system clock (eg. NTP adjustments, drift)
      //
      // @see useGetNowTimeInMillis
      const initiatedAtMonotonicMillis = Math.floor(performance.now());
      const serverTimeMillis = await nadoClient.context.engineClient.getTime();
      const updatedAtMonotonicMillis = Math.floor(performance.now());
      return {
        serverTimeMillis,
        latencyMillis: updatedAtMonotonicMillis - initiatedAtMonotonicMillis,
        updatedAtMonotonicMillis,
      };
    },
    enabled: !disabled,
    refetchInterval: 60000,
  });
}
