import { ChainEnv, toBigNumber } from '@nadohq/client';
import {
  QueryDisabledError,
  useEVMContext,
  usePrimaryChainNadoClient,
} from '@nadohq/react-client';
import { useQuery } from '@tanstack/react-query';
import { first } from 'lodash';

function latestEventSubmissionIndexQueryKey(chainEnv: ChainEnv) {
  return ['latestEventSubmissionIndex', chainEnv];
}

export function useQueryLatestEventSubmissionIndex() {
  const { primaryChainEnv } = useEVMContext();
  const nadoClient = usePrimaryChainNadoClient();
  const disabled = !nadoClient;

  return useQuery({
    queryKey: latestEventSubmissionIndexQueryKey(primaryChainEnv),
    queryFn: async () => {
      if (disabled) {
        throw new QueryDisabledError();
      }
      const events = await nadoClient.context.indexerClient.getEvents({
        limit: {
          type: 'txs',
          value: 1,
        },
        desc: true,
      });

      const latestEvent = first(events);

      if (!latestEvent) {
        console.error(
          '[useQueryLatestEventSubmissionIndex] Error fetching latest event',
          latestEvent,
        );
        throw new Error(
          '[useQueryLatestEventSubmissionIndex] Error fetching latest event',
        );
      }

      return toBigNumber(latestEvent.submissionIndex);
    },
    enabled: !disabled,
    refetchInterval: 10000,
  });
}
