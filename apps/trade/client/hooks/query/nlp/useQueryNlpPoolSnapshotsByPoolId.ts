import {
  ChainEnv,
  IndexerSubaccountSnapshot,
  subaccountFromHex,
} from '@nadohq/client';
import {
  QueryDisabledError,
  useEVMContext,
  usePrimaryChainNadoClient,
} from '@nadohq/react-client';
import { useQuery } from '@tanstack/react-query';
import { useQueryNlpPools } from 'client/hooks/query/nlp/useQueryNlpPools';

function nlpPoolSnapshotsByPoolIdQueryKey(
  chainEnv?: ChainEnv,
  nlpPoolsDataUpdatedAt?: number,
) {
  return ['nlpPoolSnapshotsByPoolId', chainEnv, nlpPoolsDataUpdatedAt];
}

// Pool ID -> snapshots
type Data = Record<number, IndexerSubaccountSnapshot>;

/**
 * Queries balance snapshots for all sub-pools of the NLP at the current time, mapped by the pool ID
 * This is used for computing PnL, net interest/funding, etc.
 */
export function useQueryNlpPoolSnapshotsByPoolId() {
  const { primaryChainEnv } = useEVMContext();
  const nadoClient = usePrimaryChainNadoClient();
  const { data: nlpPoolsData, dataUpdatedAt: nlpPoolsDataUpdatedAt } =
    useQueryNlpPools();

  const disabled = !nadoClient || !nlpPoolsData;

  return useQuery({
    queryKey: nlpPoolSnapshotsByPoolIdQueryKey(
      primaryChainEnv,
      nlpPoolsDataUpdatedAt,
    ),
    queryFn: async (): Promise<Data> => {
      if (disabled) {
        throw new QueryDisabledError();
      }
      const poolsToQuery = nlpPoolsData.nlpPools.map((pool) => {
        return {
          subaccountHex: pool.subaccountHex,
          poolId: pool.poolId,
        };
      });
      // Use the dataUpdatedAt timestamp to ensure consistency with the pool data
      const queryTimestamp = nlpPoolsDataUpdatedAt;

      const snapshotsResponse =
        await nadoClient.context.indexerClient.getMultiSubaccountSnapshots({
          subaccounts: poolsToQuery.map((pool) =>
            subaccountFromHex(pool.subaccountHex),
          ),
          timestamps: [queryTimestamp],
        });

      return poolsToQuery.reduce((acc, pool) => {
        acc[pool.poolId] =
          snapshotsResponse.snapshots[pool.subaccountHex][queryTimestamp];
        return acc;
      }, {} as Data);
    },
    enabled: !disabled,
  });
}
