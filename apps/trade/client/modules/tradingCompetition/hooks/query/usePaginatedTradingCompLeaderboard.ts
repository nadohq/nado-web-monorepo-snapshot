import { ChainEnv, IndexerLeaderboardRankType } from '@nadohq/client';
import {
  createQueryKey,
  QueryDisabledError,
  useEVMContext,
  usePrimaryChainNadoClient,
} from '@nadohq/react-client';
import { useInfiniteQuery } from '@tanstack/react-query';

export function paginatedTradingCompLeaderboardQueryKey(
  chainEnv?: ChainEnv,
  contestId?: number,
  rankType?: IndexerLeaderboardRankType,
  pageSize?: number,
) {
  return createQueryKey(
    'paginatedTradingCompLeaderboard',
    chainEnv,
    contestId,
    rankType,
    pageSize,
  );
}

interface Params {
  pageSize: number;
  contestId: number | undefined;
  /** Optional for single-track contests; required for multi-track contests. */
  rankType?: IndexerLeaderboardRankType;
}

export function usePaginatedTradingCompLeaderboard({
  pageSize,
  contestId,
  rankType,
}: Params) {
  const nadoClient = usePrimaryChainNadoClient();
  const { primaryChainEnv } = useEVMContext();

  const disabled = !nadoClient || contestId == null;

  return useInfiniteQuery({
    queryKey: paginatedTradingCompLeaderboardQueryKey(
      primaryChainEnv,
      contestId,
      rankType,
      pageSize,
    ),
    initialPageParam: <string | undefined>undefined,
    queryFn: async ({ pageParam }) => {
      if (disabled) {
        throw new QueryDisabledError();
      }

      return nadoClient.context.indexerClient.getPaginatedLeaderboard({
        contestId,
        rankType,
        limit: pageSize,
        startCursor: pageParam,
      });
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage?.meta.nextCursor) {
        return null;
      }
      return lastPage.meta.nextCursor;
    },
    enabled: !disabled,
  });
}
