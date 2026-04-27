import { ChainEnv } from '@nadohq/client';
import {
  createQueryKey,
  QueryDisabledError,
  useEVMContext,
  usePrimaryChainNadoClient,
} from '@nadohq/react-client';
import { useQuery } from '@tanstack/react-query';
import { ALL_TRADING_COMP_CONTEST_IDS } from 'client/modules/tradingCompetition/consts';

export function tradingCompContestsQueryKey(chainEnv?: ChainEnv) {
  return createQueryKey('tradingCompContests', chainEnv);
}

export function useQueryTradingCompContests() {
  const nadoClient = usePrimaryChainNadoClient();
  const { primaryChainEnv } = useEVMContext();

  const disabled = !nadoClient;

  return useQuery({
    queryKey: tradingCompContestsQueryKey(primaryChainEnv),
    queryFn: async () => {
      if (disabled) {
        throw new QueryDisabledError();
      }

      const response =
        await nadoClient.context.indexerClient.getLeaderboardContests({
          contestIds: ALL_TRADING_COMP_CONTEST_IDS,
        });

      return response;
    },
    enabled: !disabled,
    refetchInterval: 30000,
  });
}
