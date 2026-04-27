import { ChainEnv, IndexerLeaderboardRankType } from '@nadohq/client';
import {
  createQueryKey,
  QueryDisabledError,
  useEVMContext,
  usePrimaryChainNadoClient,
} from '@nadohq/react-client';
import { useInfiniteQuery } from '@tanstack/react-query';
import { LEADERBOARD_PAGE_SIZE } from 'client/modules/tradingCompetition/consts';

export function paginatedTradingCompLeaderboardQueryKey(
  chainEnv?: ChainEnv,
  contestId?: number,
  rankType?: IndexerLeaderboardRankType,
) {
  return createQueryKey(
    'paginatedTradingCompLeaderboard',
    chainEnv,
    contestId,
    rankType,
  );
}

interface Params {
  contestId: number | undefined;
  /** Optional for single-track contests; required for multi-track contests. */
  rankType?: IndexerLeaderboardRankType;
}

export function usePaginatedTradingCompLeaderboard({
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
    ),
    initialPageParam: <string | undefined>undefined,
    queryFn: async ({ pageParam }) => {
      if (disabled) {
        throw new QueryDisabledError();
      }

      const response =
        await nadoClient.context.indexerClient.getPaginatedLeaderboard({
          contestId,
          rankType,
          limit: LEADERBOARD_PAGE_SIZE,
          startCursor: pageParam,
        });

      return response;
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
