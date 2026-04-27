import { TwapExecutionInfo } from '@nadohq/client';
import {
  createQueryKey,
  QueryDisabledError,
  usePrimaryChainNadoClient,
} from '@nadohq/react-client';
import { useQuery } from '@tanstack/react-query';

export function twapExecutionsQueryKey(digest?: string) {
  return createQueryKey('twapExecutions', digest);
}

interface Params {
  digest: string | undefined;
}

/**
 * Hook to fetch TWAP executions for a specific order digest
 */
export function useQueryTwapExecutions({ digest }: Params) {
  const nadoClient = usePrimaryChainNadoClient();

  const disabled = !digest || !nadoClient;

  return useQuery({
    queryKey: twapExecutionsQueryKey(digest),
    queryFn: async (): Promise<TwapExecutionInfo[]> => {
      if (disabled) {
        throw new QueryDisabledError();
      }

      const response =
        await nadoClient.context.triggerClient.listTwapExecutions({
          digest,
        });
      return response.executions;
    },
    // Use a lower stale time for twap executions as these are updated frequently
    staleTime: 5000,
    enabled: !disabled,
  });
}
