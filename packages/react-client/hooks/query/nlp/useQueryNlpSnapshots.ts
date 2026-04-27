import { ChainEnv, nowInSeconds } from '@nadohq/client';
import { useQuery } from '@tanstack/react-query';
import { useEVMContext, usePrimaryChainNadoClient } from '../../../context';
import { createQueryKey, QueryDisabledError } from '../../../utils';

export function nlpSnapshotsQueryKey(
  chainEnv?: ChainEnv,
  granularity?: number,
  limit?: number,
  maxTimeInclusive?: number,
) {
  return createQueryKey(
    'nlpSnapshots',
    chainEnv,
    granularity,
    limit,
    maxTimeInclusive,
  );
}

interface Params {
  granularity: number;
  limit: number;
  maxTimeInclusive?: number;
}

/**
 * Queries snapshots for the entirety of the NLP. For sub-pool subaccount snapshots, use
 * `useQueryNlpPoolSnapshotsByPoolId`.
 */
export function useQueryNlpSnapshots({
  granularity,
  limit,
  maxTimeInclusive: maxTimeInclusiveOverride,
}: Params) {
  const { primaryChainEnv } = useEVMContext();
  const nadoClient = usePrimaryChainNadoClient();

  const disabled = !nadoClient;

  return useQuery({
    queryKey: nlpSnapshotsQueryKey(
      primaryChainEnv,
      granularity,
      limit,
      maxTimeInclusiveOverride,
    ),
    queryFn: async () => {
      if (disabled) {
        throw new QueryDisabledError();
      }

      // default to nowInSeconds so that the query returns 2 latest snapshots
      // with accurate interval
      const maxTimeInclusive = maxTimeInclusiveOverride ?? nowInSeconds();

      return nadoClient.context.indexerClient.getNlpSnapshots({
        granularity,
        limit,
        maxTimeInclusive,
      });
    },
    enabled: !disabled,
  });
}
