import { ChainEnv } from '@nadohq/client';
import {
  createQueryKey,
  QueryDisabledError,
  useEVMContext,
  usePrimaryChainNadoClient,
} from '@nadohq/react-client';
import { useQuery } from '@tanstack/react-query';

function latestEpochQueryKey(chainEnv: ChainEnv) {
  return createQueryKey('latestEpoch', chainEnv);
}

/** Get the latest epoch for the current chain. */
export function useLatestEpoch() {
  const { primaryChainEnv } = useEVMContext();
  const nadoClient = usePrimaryChainNadoClient();

  const disabled = !nadoClient;

  return useQuery({
    queryKey: latestEpochQueryKey(primaryChainEnv),
    queryFn: async () => {
      if (disabled) {
        throw new QueryDisabledError();
      }

      // We use rewards to get the latest epoch.
      // TODO: when new MM rewards system is defined, query latest epoch here
      //       - or -  remove all epoch-related logic and UI.
      return { epoch: 1 };
    },
    enabled: !disabled,
  });
}
